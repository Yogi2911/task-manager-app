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

        stage('Test Docker Hub Credential') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo ========================================
                        echo Docker Hub Credential Test
                        echo ========================================

                        echo Docker Username: %DOCKER_USERNAME%

                        powershell -NoProfile -Command "Write-Host ('Password length received by Jenkins: ' + $env:DOCKER_PASSWORD.Length)"

                        echo.
                        echo Testing Docker Hub login...
                        echo.

                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if %ERRORLEVEL% NEQ 0 (
                            echo.
                            echo Docker Hub login failed
                            exit /b 1
                        )

                        echo.
                        echo ========================================
                        echo Docker Hub login succeeded!
                        echo ========================================

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Docker Hub credential test completed successfully!'
        }

        failure {
            echo 'Docker Hub credential test failed.'
        }
    }
}