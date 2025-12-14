pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        GIT_LFS_SKIP_SMUDGE = "1"

        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
        REPO_URL = "https://github.com/L-T-Development/OCR-LLM.git"
        BRANCH   = "interns"
    }

    stages {

        stage('🧹 Clean Workspace') {
            steps {
                deleteDir()
                echo '🧼 Workspace cleaned'
            }
        }

        stage('📥 Checkout Source Code (Git LFS Skipped)') {
            steps {
                bat '''
                @echo off
                echo 🔕 Handling Git LFS safely...

                git lfs uninstall > nul 2>&1 || echo Git LFS not installed
                git config --global filter.lfs.required false || echo Git config skipped

                echo 📥 Cloning repository...
                git clone --branch %BRANCH% %REPO_URL%

                exit /b 0
                '''
            }
        }

        stage('🔐 Security Scan (No .env check)') {
            steps {
                dir('OCR-LLM') {
                    bat '''
                    @echo off
                    setlocal

                    REM ---- Hardcoded secrets scan (non-blocking) ----
                    findstr /si /m "password= secret= api_key= token= aws_secret_access_key" *.py *.txt *.yml *.yaml > nul
                    if %errorlevel%==0 (
                        echo ❌ SECURITY ISSUE: Hardcoded secrets detected
                        exit /b 1
                    )

                    echo ✅ Security scan passed
                    exit /b 0
                    '''
                }
            }
        }

        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('⚙ Setup Python Environment') {
            steps {
                dir('OCR-LLM') {
                    bat '''
                    "%PYTHON%" -m venv %VENV_DIR%
                    "%VENV_DIR%\\Scripts\\python.exe" -m pip install --upgrade pip
                    "%VENV_DIR%\\Scripts\\python.exe" -m pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('🧪 Run Tests') {
            steps {
                dir('OCR-LLM') {
                    bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pytest tests/test_ocr.py"
                }
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
