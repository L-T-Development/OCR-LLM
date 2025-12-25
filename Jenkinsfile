pipeline {
    agent any

    environment {
        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
    }

    stages {

        stage('📥 Checkout Source Code') {
            steps {
                // Jenkins-managed checkout (enables change detection)
                checkout scm
            }
        }

        stage('🔐 Security Scan (Hardcoded Secrets Check)') {
            steps {
                bat '''
                @echo off
                echo 🔍 Running security scan...

                findstr /si /m "password= secret= api_key= token= aws_secret_access_key" *.py *.txt *.yml *.yaml
                if %errorlevel%==0 (
                    echo ❌ SECURITY ISSUE: Hardcoded secrets detected
                    exit /b 1
                )

                echo ✅ Security scan passed
                '''
            }
        }

        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('⚙ Setup Python Environment') {
            steps {
                bat '''
                if not exist %VENV_DIR% (
                    "%PYTHON%" -m venv %VENV_DIR%
                )

                "%VENV_DIR%\\Scripts\\python.exe" -m pip install --upgrade pip
                "%VENV_DIR%\\Scripts\\python.exe" -m pip install -r requirements.txt
                '''
            }
        }

        stage('🧪 Run Tests') {
            steps {
                bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pytest tests/test_ocr.py"
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
