pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    stages {

        stage('Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('Setup Python Environment') {
            steps {
                bat "\"%PYTHON%\" -m venv venv"
                bat "\"%PYTHON%\" -m pip install --upgrade pip"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('Run Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests/test_ocr.py"
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
