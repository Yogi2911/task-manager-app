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
                bat 'docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% -t %DOCKER_IMAGE%:latest .'
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
                        echo Testing Docker login
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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    powershell '''
                        $env:DOCKER_PASSWORD | docker login --username $env:DOCKER_USER --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker Hub login failed"
                            exit 1
                        }

                        Write-Host "Docker Hub login successful"

                        docker push "$env:DOCKER_IMAGE`:$env:IMAGE_TAG"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Version image push failed"
                            exit 1
                        }

                        docker push "$env:DOCKER_IMAGE`:latest"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Latest image push failed"
                            exit 1
                        }

                        Write-Host "Docker images pushed successfully."
                    '''
                }
            }
        }

        stage('Deploy to Development') {
            steps {
                bat '''
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
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                bat '''
                    ping -n 6 127.0.0.1 > nul

                    curl -f http://localhost:4000/api/health

                    if %ERRORLEVEL% NEQ 0 (
                        echo Health check failed
                        exit /b 1
                    )

                    echo Health check successful.
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