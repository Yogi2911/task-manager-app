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

        stage('Debug: Identity & Credential Sanity Check') {
            steps {
                bat 'whoami'
                bat 'echo %USERPROFILE%'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    powershell '''
                        Write-Host "Username value: $env:DOCKER_USERNAME"
                        Write-Host "Username length: $($env:DOCKER_USERNAME.Length)"
                        Write-Host "Password length: $($env:DOCKER_PASSWORD.Length)"
                        Write-Host "Password starts with dckr_pat_: $($env:DOCKER_PASSWORD.StartsWith('dckr_pat_'))"
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .'
            }
        }

        stage('Docker Hub Login Test') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo Username: %DOCKER_USERNAME%
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if %ERRORLEVEL% NEQ 0 (
                            echo Docker Hub login FAILED
                            exit /b 1
                        )

                        echo Docker Hub login SUCCESSFUL
                    '''
                }
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
                        echo Pushing image: %DOCKER_IMAGE%:%BUILD_NUMBER%

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

                        echo Docker images pushed successfully!
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

                    echo Container started successfully.
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