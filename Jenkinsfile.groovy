pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                echo 'Cloning your repo...'
                git 'https://github.com/SYED6281/local.git'
            }
        }
        stage('Build') {
            steps {
                echo 'This is the Build stage.'
            }
        }
        stage('Test') {
            steps {
                echo 'Running some basic tests...'
                sh 'echo Hello from Jenkins!'
            }
        }
    }
}
