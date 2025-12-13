pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    stages {

        stage('🔎 Branch Info') {
            steps {
                echo "Running pipeline for branch: ${env.BRANCH_NAME}"
            }
        }

        stage('🔐 Secret Scan') {
            steps {
                echo 'Scanning for hardcoded secrets...'
                bat '''
                git grep -n -i "api_key\\|secret\\|password\\|token" && exit 1 || exit 0
                '''
            }
        }

        stage('🐍 Setup Python') {
            steps {
                bat "\"%PYTHON%\" --version"
                bat "\"%PYTHON%\" -m venv venv"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('🧪 Run Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests"
            }
        }

        stage('🚀 Branch-Specific Rules') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                echo 'Main branch checks passed. Ready for release.'
            }
        }
    }

    post {
        success {
            echo "✅ CI passed for ${env.BRANCH_NAME}"
        }
        failure {
            echo "❌ CI failed for ${env.BRANCH_NAME}"
        }
    }
}
