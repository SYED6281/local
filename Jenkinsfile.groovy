pipeline {
    agent any

    environment {
        IMAGE_NAME = "yourdockerhubusername/your-image-name"
    }

    stages {
        stage('Clone Repo') {
            steps {
                echo "Cloning your repo..."
                git 'https://github.com/SYED6281/local.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Run in Kubernetes') {
            steps {
                sh '''
                kubectl delete deployment website-deploy --ignore-not-found
                kubectl create deployment website-deploy --image=$IMAGE_NAME
                kubectl expose deployment website-deploy --type=NodePort --port=80
                '''
            }
        }

        stage('Show URL') {
            steps {
                sh 'minikube service website-deploy --url'
            }
        }
    }
}
