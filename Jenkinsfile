pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    stages {

        stage('📥 Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('🚫 Forbidden Files Check (.env / keys)') {
            steps {
                echo 'Checking for forbidden sensitive files...'
                bat '''
                if exist .env (
                    echo ERROR: .env file detected!
                    exit 1
                )
                if exist *.pem (
                    echo ERROR: Private key file detected!
                    exit 1
                )
                if exist *.key (
                    echo ERROR: Key file detected!
                    exit 1
                )
                echo No forbidden files found.
                '''
            }
        }

        stage('🔐 Hardcoded Secrets Scan') {
            steps {
                echo 'Scanning for hardcoded secrets...'
                bat '''
                git grep -n -i "api_key\\|apikey\\|secret_key\\|password\\|auth_token\\|access_token" ^
                && (
                    echo ERROR: Hardcoded secret detected!
                    exit 1
                ) || (
                    echo No hardcoded secrets found.
                    exit 0
                )
                '''
            }
        }

        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('📦 Setup Python Environment') {
            steps {
                bat "\"%PYTHON%\" -m venv venv"
                bat "\"%PYTHON%\" -m pip install --upgrade pip"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('🧪 Run Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests/test_ocr.py"
            }
        }
    }

    post {
        success {
            echo '✅ OCR-LLM Pipeline SUCCESS'
            echo '🔒 Security checks passed'
        }
        failure {
            echo '❌ OCR-LLM Pipeline FAILED'
            echo '🚨 Possible security or test issue detected'
        }
        always {
            cleanWs()
        }
    }
}
