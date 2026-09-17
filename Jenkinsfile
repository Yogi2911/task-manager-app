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
                bat 'docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .'
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if %ERRORLEVEL% NEQ 0 (
                            echo Docker Hub login failed
                            exit /b 1
                        )

                        docker push %DOCKER_IMAGE%:%BUILD_NUMBER%

                        if %ERRORLEVEL% NEQ 0 (
                            echo Docker image push failed
                            exit /b 1
                        )

                        docker tag %DOCKER_IMAGE%:%BUILD_NUMBER% %DOCKER_IMAGE%:latest

                        docker push %DOCKER_IMAGE%:latest

                        if %ERRORLEVEL% NEQ 0 (
                            echo Latest image push failed
                            exit /b 1
                        )

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Development') {
            steps {
                bat '''
                    docker stop %CONTAINER_NAME% 2>NUL
                    docker rm %CONTAINER_NAME% 2>NUL

                    docker pull %DOCKER_IMAGE%:%BUILD_NUMBER%

                    if %ERRORLEVEL% NEQ 0 (
                        echo Docker image pull failed
                        exit /b 1
                    )

                    docker run -d ^
                        --name %CONTAINER_NAME% ^
                        -p 4000:4000 ^
                        %DOCKER_IMAGE%:%BUILD_NUMBER%

                    if %ERRORLEVEL% NEQ 0 (
                        echo Docker container failed to start
                        exit /b 1
                    )
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                bat '''
                    powershell -Command "Start-Sleep -Seconds 10"

                    curl -f http://localhost:4000/api/health

                    if %ERRORLEVEL% NEQ 0 (
                        echo Health check failed
                        exit /b 1
                    )

                    echo Health check successful
                '''
            }
        }
    }

    post {
        success {
            echo 'Task Manager Docker CI/CD completed successfully!'
        }

        failure {
            echo 'Task Manager Docker CI/CD failed.'
        }
    }
}