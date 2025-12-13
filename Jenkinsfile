pipeline {
    agent any

    stages {

        stage('🐍 Setup Python Environment') {
            steps {
                echo 'Setting up Python environment...'
                bat 'python -m venv venv'
                bat 'venv\\Scripts\\pip install -r requirements.txt'
            }
        }

        stage('🧪 Run Tests') {
            steps {
                echo 'Running OCR tests...'
                bat 'venv\\Scripts\\pytest tests/test_ocr.py'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
