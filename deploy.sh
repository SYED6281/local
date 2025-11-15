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

echo "Deploying to: $EC2_USER@$EC2_HOST"
echo "Application directory: $APP_DIR"

# Create application directory on EC2
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << ENDSSH
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Stop the application if running
    if command -v pm2 &> /dev/null; then
        pm2 stop $APP_NAME || true
        pm2 delete $APP_NAME || true
    fi
ENDSSH

# Copy files to EC2
echo "Copying files to EC2..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r \
    app.js \
    package.json \
    ecosystem.config.js \
    "$EC2_USER@$EC2_HOST:$APP_DIR/"

# SSH into EC2 and deploy
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << ENDSSH
    cd $APP_DIR
    
    echo "Installing dependencies..."
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
    nvm use 18 || nvm install 18
    npm install --production
    
    echo "Starting application with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "Deployment completed successfully!"
    echo "Application is running on: http://$EC2_HOST:3000"
ENDSSH

echo "Deployment to EC2 completed!"

