pipeline {
  agent any
  environment {
    DOCKER_IMAGE = "syed6281/myapp:latest"
  }
  stages {
    stage('Clone Repo') {
      steps {
        git 'https://github.com/SYED6281/local.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE .'
      }
    }

    stage('Push Docker Image') {
      steps {
        withDockerRegistry([credentialsId: 'dockerhub-cred-id', url: '']) {
          sh 'docker push $DOCKER_IMAGE'
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh 'kubectl apply -f k8s/deployment.yaml'
      }
    }
  }
}
