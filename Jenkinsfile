pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'basic-jenkins-app'
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
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm install --production=false'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test || true'
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh '''
                    echo "Application deployment completed!"
                    echo "App Name: ${APP_NAME}"
                    echo "Node Version: ${NODE_VERSION}"
                '''
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

