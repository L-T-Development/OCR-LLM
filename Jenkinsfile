pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        PYTHON   = "python3"
        VENV_DIR = "venv"
    }

    stages {

        /* ==================== CHECKOUT ==================== */
        stage('📥 Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        /* ==================== .env PROTECTION ==================== */
        stage('🚫 .env File Check') {
            steps {
                sh '''
                echo "🔍 Checking for committed .env file..."

                if [ -f ".env" ]; then
                    echo "❌ SECURITY ISSUE: .env file found in repository"
                    exit 1
                fi

                echo "✅ No .env file found"
                '''
            }
        }

        /* ==================== SECRET SCAN ==================== */
        stage('🔐 Security Scan (Hardcoded Secrets Only)') {
            steps {
                sh '''
                echo "🔍 Running security scan (hardcoded secrets only)..."

                grep -R --exclude-dir=venv \
                    -E "(password|api_key|token|aws_secret_access_key) *= *['\\\"][^'\\\"]+['\\\"]" . \
                | grep -viE "process.env|import.meta.env|Bearer|demo|test|dummy|placeholder|example|sample" \
                && {
                    echo "❌ SECURITY ISSUE: Hardcoded secret detected"
                    exit 1
                } || {
                    echo "✅ Security scan passed"
                }
                '''
            }
        }

        /* ==================== PYTHON CHECK ==================== */
        stage('🐍 Check Python') {
            steps {
                sh 'python3 --version'
            }
        }

        /* ==================== PYTHON ENV ==================== */
        stage('⚙ Setup Python Environment') {
            steps {
                sh '''
                if [ ! -d "$VENV_DIR" ]; then
                    echo "📦 Creating virtual environment..."
                    python3 -m venv $VENV_DIR
                fi

                . $VENV_DIR/bin/activate
                pip install --upgrade pip
                pip install -r requirements.txt
                '''
            }
        }

        /* ==================== TESTS ==================== */
        stage('🧪 Run Tests') {
            steps {
                sh '''
                . $VENV_DIR/bin/activate
                pytest tests/test_ocr.py
                '''
            }
        }
    }

    /* ==================== POST ACTIONS ==================== */
    post {
        success {
            echo '✅ OCR-LLM Pipeline SUCCESS'
        }
        failure {
            echo '❌ OCR-LLM
