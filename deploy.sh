#!/bin/bash

# EC2 Deployment Script
# This script deploys the application to an EC2 instance

set -e

echo "Starting deployment to EC2..."

# Variables (can be overridden by environment variables)
EC2_HOST="${EC2_HOST}"
EC2_USER="${EC2_USER:-ec2-user}"
APP_DIR="${APP_DIR:-/home/ec2-user/app}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
APP_NAME="${APP_NAME:-basic-jenkins-app}"

# Check required variables
if [ -z "$EC2_HOST" ]; then
    echo "Error: EC2_HOST environment variable is not set"
    exit 1
fi

if [ -z "$SSH_KEY" ] || [ ! -f "$SSH_KEY" ]; then
    echo "Error: SSH_KEY file not found: $SSH_KEY"
    exit 1
fi

echo "Deploying to: $EC2_USER@$EC2_HOST"
echo "Application directory: $APP_DIR"
echo "SSH Key: $SSH_KEY"

# Create application directory on EC2
echo "Creating application directory and stopping existing app..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" << ENDSSH
    set -e
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    # Stop the application if running
    if command -v pm2 &> /dev/null; then
        pm2 stop "$APP_NAME" || true
        pm2 delete "$APP_NAME" || true
    fi
ENDSSH

# Copy files to EC2
echo "Copying files to EC2..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
    app.js \
    package.json \
    ecosystem.config.js \
    "$EC2_USER@$EC2_HOST:$APP_DIR/" || {
    echo "Error: Failed to copy files to EC2"
    exit 1
}

# SSH into EC2 and deploy
echo "Installing dependencies and starting application..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" << ENDSSH
    set -e
    cd "$APP_DIR"
    
    echo "Installing dependencies..."
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh" || {
        echo "Error: NVM not found. Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="\$HOME/.nvm"
        [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
    }
    
    nvm use 18 || nvm install 18
    npm install --production
    
    echo "Starting application with PM2..."
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 not found. Installing PM2..."
        npm install -g pm2
    fi
    
    pm2 start ecosystem.config.js || {
        echo "Error: Failed to start application with PM2"
        exit 1
    }
    pm2 save || true
    pm2 startup || true
    
    echo "Deployment completed successfully!"
    echo "Application is running on: http://$EC2_HOST:3000"
ENDSSH

echo "Deployment to EC2 completed!"

