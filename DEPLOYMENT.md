# EC2 Deployment Guide

This guide explains how to deploy the application to an AWS EC2 instance using Jenkins.

## Prerequisites

1. **AWS EC2 Instance**
   - Ubuntu 20.04/22.04 or Amazon Linux 2
   - Security group configured to allow:
     - SSH (port 22) from Jenkins server
     - HTTP (port 3000) from your IP or 0.0.0.0/0
   - Instance has public IP or Elastic IP

2. **Jenkins Server**
   - Jenkins installed and running
   - SSH plugin installed
   - AWS credentials configured (if using IAM roles)

3. **EC2 Instance Setup**
   - Node.js and npm installed (via nvm recommended)
   - PM2 installed globally: `npm install -g pm2`
   - Git installed (optional, for direct pulls)

## EC2 Instance Initial Setup

SSH into your EC2 instance and run:

```bash
# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt-get update && sudo apt-get upgrade -y  # For Ubuntu

# Install Node.js using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p ~/app
cd ~/app
```

## Jenkins Configuration

### 1. Install Required Jenkins Plugins
- SSH Pipeline Steps
- SSH Agent Plugin

### 2. Configure SSH Credentials in Jenkins

1. Go to **Jenkins Dashboard** → **Manage Jenkins** → **Manage Credentials**
2. Click on your domain (usually "Global")
3. Click **Add Credentials**
4. Fill in the following:
   - **Kind**: SSH Username with private key
   - **ID**: `ec2-deploy-key` (must match exactly)
   - **Description**: EC2 Deployment Key (optional)
   - **Username**: `ec2-user` (or `ubuntu` for Ubuntu instances)
   - **Private Key**: 
     - Select **Enter directly**
     - Click **Add** button
     - Paste the entire content of your `62818.pem` file
     - The key should start with `-----BEGIN RSA PRIVATE KEY-----` or `-----BEGIN OPENSSH PRIVATE KEY-----`
5. Click **OK** to save

### 3. Configure Environment Variables

In your Jenkins pipeline configuration, add these environment variables:

- `EC2_HOST`: Your EC2 instance public IP or domain
- `EC2_USER`: `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu)
- `APP_DIR`: `/home/ec2-user/app` (default)
- `SSH_KEY`: Path to SSH key file (or use Jenkins credentials)

### 4. Update Jenkinsfile

The Jenkinsfile is already configured with EC2 deployment. Make sure to set the environment variables in Jenkins:

**Option A: Using Jenkins Credentials (Recommended)**

Update the Jenkinsfile Deploy stage to use SSH credentials:

```groovy
stage('Deploy to EC2') {
    steps {
        script {
            withCredentials([sshUserPrivateKey(
                credentialsId: 'ec2-deploy-key',
                keyFileVariable: 'SSH_KEY',
                usernameVariable: 'EC2_USER'
            )]) {
                sh """
                    export EC2_HOST='your-ec2-ip-or-domain'
                    export EC2_USER='${EC2_USER}'
                    export SSH_KEY='${SSH_KEY}'
                    chmod +x deploy.sh
                    ./deploy.sh
                """
            }
        }
    }
}
```

**Option B: Using Environment Variables**

Set these in Jenkins job configuration:
- `EC2_HOST`: Your EC2 instance IP
- `EC2_USER`: `ec2-user` or `ubuntu`
- `SSH_KEY`: Path to your SSH key

## Deployment Process

The deployment script (`deploy.sh`) performs the following:

1. **Connects to EC2** via SSH
2. **Stops existing application** (if running with PM2)
3. **Copies application files** to EC2
4. **Installs dependencies** on EC2
5. **Starts application** with PM2
6. **Saves PM2 configuration** for auto-restart

## Manual Deployment

If you want to deploy manually:

```bash
# On your local machine or Jenkins server
export EC2_HOST='your-ec2-ip'
export EC2_USER='ec2-user'
export SSH_KEY='~/.ssh/your-key.pem'
chmod +x deploy.sh
./deploy.sh
```

## Post-Deployment

### Check Application Status

SSH into EC2 and run:
```bash
pm2 status
pm2 logs basic-jenkins-app
```

### Access the Application

- Main endpoint: `http://your-ec2-ip:3000`
- Health check: `http://your-ec2-ip:3000/health`
- API info: `http://your-ec2-ip:3000/api/info`

### PM2 Commands

```bash
# View logs
pm2 logs basic-jenkins-app

# Restart application
pm2 restart basic-jenkins-app

# Stop application
pm2 stop basic-jenkins-app

# View status
pm2 status

# Monitor
pm2 monit
```

## Security Considerations

1. **Security Groups**: Only allow necessary ports (22, 3000)
2. **SSH Keys**: Use key-based authentication, disable password auth
3. **Firewall**: Configure EC2 instance firewall (iptables/ufw)
4. **HTTPS**: Consider using Nginx as reverse proxy with SSL
5. **Environment Variables**: Store sensitive data in Jenkins credentials

## Troubleshooting

### Connection Issues
- Verify security group allows SSH from Jenkins IP
- Check SSH key permissions: `chmod 400 your-key.pem`
- Verify EC2 instance is running

### Application Not Starting
- Check PM2 logs: `pm2 logs basic-jenkins-app`
- Verify Node.js version: `node --version`
- Check port 3000 is not in use: `netstat -tulpn | grep 3000`

### Permission Issues
- Ensure user has write permissions to app directory
- Check PM2 is installed globally: `npm list -g pm2`

## Next Steps

- Set up Nginx reverse proxy for port 80/443
- Configure SSL certificate (Let's Encrypt)
- Set up monitoring and alerts
- Configure auto-scaling if needed

