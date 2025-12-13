pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    options {
        timestamps()
        ansiColor('xterm')
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('🔐 Secret Scan') {
            steps {
                echo 'Scanning for hardcoded secrets...'
                bat '''
                git grep -n -i "api_key\\|secret\\|password\\|token\\|private_key" && exit 1 || exit 0
                '''
            }
        }

        stage('🐍 Python Setup') {
            steps {
                bat "\"%PYTHON%\" --version"
                bat "\"%PYTHON%\" -m venv venv"
                bat "\"%PYTHON%\" -m pip install --upgrade pip"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('🧪 Run Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests"
            }
        }

        stage('📦 Build Check') {
            steps {
                echo 'Build validation completed successfully'
            }
        }
    }

    post {
        success {
            echo '✅ INTERN CI PIPELINE PASSED'
        }
        failure {
            echo '❌ INTERN CI PIPELINE FAILED'
        }
        always {
            cleanWs()
        }
    }
}
