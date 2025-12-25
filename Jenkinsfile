pipeline {
    agent any

    environment {
        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
    }

    stages {

        stage('📥 Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('🔐 Security Scan (Project Code Only)') {
            steps {
                bat '''
                @echo off
                echo 🔍 Running security scan (excluding venv)...

                REM ---- Scan only project files ----
                findstr /si /m "password= secret= api_key= token= aws_secret_access_key" ^
                    *.py ^
                    src\\*.py ^
                    app\\*.py ^
                    config\\*.yml ^
                    config\\*.yaml

                if %errorlevel%==0 (
                    echo ❌ SECURITY ISSUE: Hardcoded secrets found in project code
                    exit /b 1
                )

                echo ✅ Security scan passed
                exit /b 0
                '''
            }
        }

        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('⚙ Setup Python Virtual Environment') {
            steps {
                bat '''
                if not exist %VENV_DIR% (
                    echo 📦 Creating virtual environment...
                    "%PYTHON%" -m venv %VENV_DIR%
                )

                echo ⬆️ Upgrading pip...
                "%VENV_DIR%\\Scripts\\python.exe" -m pip install --upgrade pip

                echo 📦 Installing dependencies...
                "%VENV_DIR%\\Scripts\\python.exe" -m pip install -r requirements.txt
                '''
            }
        }

        stage('🧪 Run Tests') {
            steps {
                bat '''
                echo 🧪 Running tests...
                "%VENV_DIR%\\Scripts\\python.exe" -m pytest
                '''
            }
        }
    }

    post {
        success {
            echo '✅ OCR-LLM Pipeline SUCCESS'
        }
        failure {
            echo '❌ OCR-LLM Pipeline FAILED'
        }
        always {
            echo '📦 Pipeline execution completed'
        }
    }
}
