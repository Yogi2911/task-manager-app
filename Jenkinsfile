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

                echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USER% --password-stdin

                if %ERRORLEVEL% NEQ 0 (
                    echo Docker Hub login FAILED
                    exit /b 1
                )

                echo Docker Hub login SUCCESSFUL
            '''
        }
    }
}