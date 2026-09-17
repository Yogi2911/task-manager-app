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

        stage('Docker Hub Login Test') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    powershell '''
                        Write-Host "========================================"
                        Write-Host "Docker Hub Credential Test"
                        Write-Host "========================================"

                        Write-Host "Username received: $env:DOCKER_USERNAME"
                        Write-Host "Password length: $($env:DOCKER_PASSWORD.Length)"
                        Write-Host "Token prefix valid: $($env:DOCKER_PASSWORD.StartsWith("dckr_pat_"))"

                        Write-Host ""
                        Write-Host "Testing Docker Hub login..."

                        $env:DOCKER_PASSWORD | docker login `
                            --username $env:DOCKER_USERNAME `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker Hub login FAILED"
                            exit 1
                        }

                        Write-Host ""
                        Write-Host "Docker Hub login SUCCEEDED!"

                        docker logout
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
                    powershell '''
                        Write-Host "Pushing version $env:BUILD_NUMBER..."

                        $env:DOCKER_PASSWORD | docker login `
                            --username $env:DOCKER_USERNAME `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker Hub login failed"
                            exit 1
                        }

                        docker push "$env:DOCKER_IMAGE`:$env:BUILD_NUMBER"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker image push failed"
                            exit 1
                        }

                        docker tag `
                            "$env:DOCKER_IMAGE`:$env:BUILD_NUMBER" `
                            "$env:DOCKER_IMAGE`:latest"

                        docker push "$env:DOCKER_IMAGE`:latest"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Latest image push failed"
                            exit 1
                        }

                        docker logout

                        Write-Host "Docker images pushed successfully!"
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