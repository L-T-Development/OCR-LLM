pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        PYTHON   = "python3"
        VENV_DIR = "venv"
    }

    stages {

        stage('📥 Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('🚫 .env File Check') {
            steps {
                sh '''
                echo "🔍 Checking for committed .env file..."
                if [ -f ".env" ]; then
                    echo "❌ SECURITY ISSUE: .env file found"
                    exit 1
                fi
                echo "✅ No .env file found"
                '''
            }
        }

        stage('🔐 Security Scan (Demo-Friendly)') {
            steps {
                sh '''
                echo "🔍 Running security scan..."

                grep -R --exclude-dir=venv \
                    -E "password *=|api_key *=|token *=|aws_secret_access_key *=" . \
                    | grep -viE "demo|test|dummy|placeholder|example|sample" \
                    && exit 1 || exit 0
                '''
            }
        }

        stage('🐍 Check Python') {
            steps {
                sh 'python3 --version'
            }
        }

        stage('⚙ Setup Python Environment') {
            steps {
                sh '''
                if [ ! -d "$VENV_DIR" ]; then
                    echo "📦 Creating virtual environment..."
                    python3 -m venv $VENV_DIR
                fi

                source $VENV_DIR/bin/activate
                pip install --upgrade pip
                pip install -r requirements.txt
                '''
            }
        }

        stage('🧪 Run Tests') {
            steps {
                sh '''
                source venv/bin/activate
                pytest tests/test_ocr.py
                '''
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
