pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
    }

    stages {

        stage('🧹 Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('📥 Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('🔐 Security Scan') {
            steps {
                bat '''
                findstr /si /m "password= secret= api_key= token=" *.py *.txt *.yml *.yaml > nul
                if %errorlevel%==0 exit /b 1
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
                "%PYTHON%" -m venv %VENV_DIR%
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
    }
}
