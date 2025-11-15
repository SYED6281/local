pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'basic-jenkins-app'
        // EC2 Deployment Variables
        EC2_HOST = '3.110.158.31'
        // EC2_USER will be set from credential, default to 'ec2-user' for Amazon Linux or 'ubuntu' for Ubuntu
        EC2_USER = 'ubuntu'
        APP_DIR = '/home/ubuntu/app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh """
                    node --version
                    npm --version
                    npm install
                """
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh """npm test || true"""
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                echo 'Deploying application to EC2...'
                script {
                    // Check if EC2_HOST is set
                    if (!env.EC2_HOST || env.EC2_HOST.isEmpty()) {
                        error('EC2_HOST environment variable is not set. Please configure it in Jenkins job settings.')
                    }
                    
                    // Make deploy script executable
                    sh 'chmod +x deploy.sh'
                    
                    // Deploy to EC2 using SSH credentials
                    // Make sure to configure 'ec2-deploy-key' credential in Jenkins
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-deploy-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )]) {
                        // Set proper permissions on SSH key file
                        sh 'chmod 600 "$SSH_KEY"'
                        
                        // Use username from credential and set app directory accordingly
                        // SSH_USER is available as shell variable from withCredentials
                        sh """
                            # Debug: Show credential information (without exposing key)
                            echo "Using SSH_USER: \$SSH_USER"
                            if [ -f "\$SSH_KEY" ]; then
                                echo "SSH_KEY file exists: Yes"
                            else
                                echo "SSH_KEY file exists: No"
                            fi
                            
                            # Determine app directory based on username
                            if [ "\$SSH_USER" = "ubuntu" ]; then
                                APP_DIR="/home/ubuntu/app"
                            else
                                APP_DIR="/home/ec2-user/app"
                            fi
                            
                            export EC2_HOST='${env.EC2_HOST}'
                            export EC2_USER="\$SSH_USER"
                            export APP_DIR="\$APP_DIR"
                            export APP_NAME='${env.APP_NAME}'
                            
                            # Verify SSH key file exists and has correct permissions
                            if [ ! -f "\$SSH_KEY" ]; then
                                echo "Error: SSH key file not found: \$SSH_KEY"
                                exit 1
                            fi
                            
                            # Run deployment script
                            SSH_KEY="\$SSH_KEY" ./deploy.sh
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
