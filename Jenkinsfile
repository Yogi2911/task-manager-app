```groovy
pipeline {

    agent any

    environment {
        DOCKER_IMAGE = "iamyoga/task-manager"
        CONTAINER_NAME = "task-manager-dev"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                    docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .
                """
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {

                    docker.withRegistry(
                        'https://index.docker.io/v1/',
                        'dockerhub-credentials'
                    ) {

                        def image = docker.image(
                            "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        )

                        image.push()
                    }
                }
            }
        }

        stage('Deploy to Development') {
            steps {
                bat """
                    docker stop %CONTAINER_NAME% 2>NUL || exit 0
                    docker rm %CONTAINER_NAME% 2>NUL || exit 0

                    docker pull %DOCKER_IMAGE%:%BUILD_NUMBER%

                    docker run -d ^
                        --name %CONTAINER_NAME% ^
                        -p 4000:4000 ^
                        %DOCKER_IMAGE%:%BUILD_NUMBER%
                """
            }
        }

        stage('Deployment Verification') {
            steps {
                powershell '''
                    $url = "http://localhost:4000/api/health"

                    Write-Host "Checking deployment: $url"

                    $response = Invoke-WebRequest `
                        -Uri $url `
                        -UseBasicParsing `
                        -TimeoutSec 30

                    if ($response.StatusCode -ne 200) {
                        throw "Deployment verification failed"
                    }

                    Write-Host "Deployment verification successful"
                    Write-Host $response.Content
                '''
            }
        }
    }

    post {
        success {
            echo "Task Manager Docker CI/CD completed successfully."
        }

        failure {
            echo "Task Manager Docker CI/CD failed."
        }
    }
}
```
