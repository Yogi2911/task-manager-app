pipeline {
    agent any

    environment {
        DOCKER_IMAGE      = "iamyoga/task-manager"
        IMAGE_TAG         = "${BUILD_NUMBER}"
        DOCKERHUB_CREDS   = credentials('dockerhub-credentials') // Jenkins credential ID
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Yogi2911/task-manager-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% -t %DOCKER_IMAGE%:latest ."
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    bat '''
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USER% --password-stdin
                        if %ERRORLEVEL% NEQ 0 (
                            echo Docker Hub login failed
                            exit /b 1
                        )
                        docker push %DOCKER_IMAGE%:%IMAGE_TAG%
                        docker push %DOCKER_IMAGE%:latest
                    '''
                }
            }
        }

        stage('Deploy to Development') {
            steps {
                bat '''
                    docker rm -f task-manager-dev || exit 0
                    docker run -d --name task-manager-dev -p 4000:4000 %DOCKER_IMAGE%:latest
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                bat '''
                    ping -n 6 127.0.0.1 > nul
                    curl -f http://localhost:4000/api/health || exit /b 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Task Manager Docker CI/CD succeeded.'
        }
        failure {
            echo 'Task Manager Docker CI/CD failed.'
        }
        always {
            bat 'docker logout || exit 0'
        }
    }
}