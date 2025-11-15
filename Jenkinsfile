pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'basic-jenkins-app'
        // EC2 Deployment Variables
        EC2_HOST = '3.110.158.31'
        EC2_USER = 'ec2-user'
        APP_DIR = '/home/ec2-user/app'
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
                        sh """
                            export EC2_HOST='${EC2_HOST}'
                            export EC2_USER='${EC2_USER}'
                            export APP_DIR='${APP_DIR}'
                            export SSH_KEY='${SSH_KEY}'
                            export APP_NAME='${APP_NAME}'
                            ./deploy.sh
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
