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
                echo Jenkins Docker Hub Credential Test
                echo ========================================

                echo Username received: %DOCKER_USERNAME%

                powershell -NoProfile -Command ^
                "$p=$env:DOCKER_PASSWORD; Write-Host ('Password length: ' + $p.Length); Write-Host ('Password starts with dckr_pat_: ' + $p.StartsWith('dckr_pat_'))"

                echo.
                echo Testing Docker Hub login...
                echo.

                powershell -NoProfile -Command ^
                "$env:DOCKER_PASSWORD | docker login -u $env:DOCKER_USERNAME --password-stdin"

                if %ERRORLEVEL% NEQ 0 (
                    echo Docker Hub login FAILED
                    exit /b 1
                )

                echo Docker Hub login SUCCEEDED!

                docker logout
            '''
        }
    }
}