#!/bin/bash

# EC2 Instance Initial Setup Script
# Run this script once on a fresh EC2 instance

set -e

echo "Setting up EC2 instance for Node.js application..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS"
    exit 1
fi

# Update system
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo "Updating Ubuntu/Debian system..."
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get install -y curl git build-essential
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    echo "Updating Amazon Linux/RHEL/CentOS system..."
    sudo yum update -y
    sudo yum install -y curl git gcc-c++ make
fi

# Install NVM (Node Version Manager)
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18
echo "Installing Node.js 18..."
nvm install 18
nvm use 18
nvm alias default 18

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Create application directory
echo "Creating application directory..."
mkdir -p ~/app
mkdir -p ~/app/logs

# Setup PM2 startup script
echo "Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    sudo ufw allow 22/tcp
    sudo ufw allow 3000/tcp
    sudo ufw --force enable
fi

echo "EC2 setup completed!"
echo ""
echo "Next steps:"
echo "1. Deploy your application using Jenkins or deploy.sh script"
echo "2. Verify Node.js: node --version"
echo "3. Verify PM2: pm2 --version"
echo "4. Check application: pm2 status"

