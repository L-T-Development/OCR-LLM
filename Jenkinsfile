pipeline {
    agent any

    stages {
        stage('📥 Checkout Code') {
            steps {
                // Gets code from your GitHub
                git branch: 'main', url: 'https://github.com/L-T-Development/OCR-LLM.git'
            }
        }

        stage('📦 Install Python Libs') {
            steps {
                // Windows users: use 'bat'. Mac/Linux users: use 'sh'
                bat 'pip install -r requirements.txt' 
            }
        }

        stage('🧪 Run Tests') {
            steps {
                echo 'Running OCR Tests...'
                // This runs the test file we created
                bat 'pytest tests/test_ocr.py'
            }
        }
    }
}
