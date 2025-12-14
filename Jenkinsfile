pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    stages {

        /* =======================
           CHECKOUT
           ======================= */
        stage('📥 Checkout Code') {
            steps {
                checkout scm
            }
        }

        /* =======================
           SECURITY: FORBIDDEN FILES
           ======================= */
        stage('🚫 Forbidden Files Check') {
            steps {
                echo 'Checking for forbidden sensitive files (.env, keys)...'
                bat '''
                if exist .env (
                    echo ERROR: .env file detected!
                    exit 1
                )
                if exist *.pem (
                    echo ERROR: .pem key file detected!
                    exit 1
                )
                if exist *.key (
                    echo ERROR: .key file detected!
                    exit 1
                )
                echo No forbidden files found.
                '''
            }
        }

        /* =======================
           SECURITY: HARDCODED SECRETS
           ======================= */
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

        /* =======================
           PYTHON CHECK
           ======================= */
        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        /* =======================
           DEPENDENCIES
           ======================= */
        stage('📦 Setup Python Environment') {
            steps {
                bat "\"%PYTHON%\" -m pip install --upgrade pip"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        /* =======================
           TESTS
           ======================= */
        stage('🧪 Run Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests/test_ocr.py"
            }
        }
    }

    post {
        success {
            echo '✅ OCR-LLM CI PIPELINE SUCCESS'
            echo '🔒 Basic security checks passed'
        }
        failure {
            echo '❌ OCR-LLM CI PIPELINE FAILED'
            echo '🚨 Security or test failure detected'
        }
        always {
            cleanWs()
        }
    }
}
