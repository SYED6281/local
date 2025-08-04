pipeline {
  agent any
  environment {
    IMAGE_NAME = "syed6281/myapp:latest"
  }
  stages {
    stage('Clone') {
      steps {
        git 'https://github.com/SYED6281/local.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME .'
      }
    }

    stage('Run Docker Container') {
      steps {
        sh 'docker stop myapp || true && docker rm myapp || true'
        sh 'docker run -d -p 3000:3000 --name myapp $IMAGE_NAME'
      }
    }
  }
}
