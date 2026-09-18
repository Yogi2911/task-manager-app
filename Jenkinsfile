pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "iamyoga/task-manager"
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                bat '''
                    docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% -t %DOCKER_IMAGE%:latest .

                    if %ERRORLEVEL% NEQ 0 (
                        echo Docker image build failed
                        exit /b 1
                    )

                    echo Docker image built successfully.
                    echo Image: %DOCKER_IMAGE%:%IMAGE_TAG%
                    echo Image: %DOCKER_IMAGE%:latest
                '''
            }
        }

        stage('Docker Credential Diagnostic') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo ========================================
                        echo Jenkins Docker Credential Diagnostic
                        echo ========================================

                        echo Username: %DOCKER_USER%

                        powershell -NoProfile -Command "$p=$env:DOCKER_PASSWORD; Write-Host ('Password length: ' + $p.Length); Write-Host ('First character code: ' + [int][char]$p[0]); Write-Host ('Last character code: ' + [int][char]$p[$p.Length-1])"

                        echo ========================================
                        echo Testing Docker Hub Login
                        echo ========================================

                        powershell -NoProfile -Command "$env:DOCKER_PASSWORD | docker login --username $env:DOCKER_USER --password-stdin"

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
                bat '''
                    echo ========================================
                    echo Pushing Docker Images to Docker Hub
                    echo ========================================

                    echo Pushing version image:
                    echo %DOCKER_IMAGE%:%IMAGE_TAG%

                    docker push %DOCKER_IMAGE%:%IMAGE_TAG%

                    if %ERRORLEVEL% NEQ 0 (
                        echo Version image push failed
                        exit /b 1
                    )

                    echo Version image pushed successfully.

                    echo ========================================
                    echo Pushing latest image:
                    echo %DOCKER_IMAGE%:latest

                    docker push %DOCKER_IMAGE%:latest

                    if %ERRORLEVEL% NEQ 0 (
                        echo Latest image push failed
                        exit /b 1
                    )

                    echo Latest image pushed successfully.
                    echo Docker images pushed successfully.
                '''
            }
        }

        stage('Deploy to Development') {
            steps {
                bat '''
                    echo ========================================
                    echo Deploying to Development
                    echo ========================================

                    docker rm -f task-manager-dev 2>NUL

                    docker run -d ^
                        --name task-manager-dev ^
                        -p 4000:4000 ^
                        %DOCKER_IMAGE%:latest

                    if %ERRORLEVEL% NEQ 0 (
                        echo Docker container failed to start
                        exit /b 1
                    )

                    echo Container started successfully.

                    docker ps --filter "name=task-manager-dev"
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                bat '''
                    echo ========================================
                    echo Deployment Verification
                    echo ========================================

                    echo Waiting for application to start...
                    ping -n 6 127.0.0.1 > nul

                    echo Checking health endpoint...
                    curl -f http://localhost:4000/api/health

                    if %ERRORLEVEL% NEQ 0 (
                        echo Health check failed
                        exit /b 1
                    )

                    echo.
                    echo Health check successful.
                    echo Application is running at:
                    echo http://localhost:4000/api/health
                '''
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo 'Task Manager Docker CI/CD succeeded.'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'Task Manager Docker CI/CD failed.'
            echo '========================================'
        }

        always {
            bat 'docker logout || exit 0'
        }
    }
}