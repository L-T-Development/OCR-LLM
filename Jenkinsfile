pipeline {
    agent any

    environment {
        // Sets up a virtual environment so we don't mess up the server
        VENV_HOME = "${env.WORKSPACE}/venv"
        PATH = "${VENV_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('📥 Checkout Code') {
            steps {
                echo '🤖 Fetching code from INTERN branch...'
                // 👇 CRITICAL FIX: Changed from 'main' to 'intern'
                git branch: 'interns', url: 'https://github.com/L-T-Development/OCR-LLM.git'
            }
        }

        stage('🛠️ Setup Python Env') {
            steps {
                echo '🐍 Setting up Python Environment...'
                // Windows users use 'bat', Mac/Linux use 'sh'
                bat 'python -m venv venv'
                bat 'call venv\\Scripts\\activate' 
                bat 'pip install -r requirements.txt'
            }
        }

        stage('🧪 Run Tests') {
            steps {
                echo '🔬 Running OCR Tests...'
                // Runs the tests inside the virtual environment
                bat 'venv\\Scripts\\pytest tests/test_ocr.py'
            }
        }
    }
}
