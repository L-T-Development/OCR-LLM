pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        // 🔕 Skip Git LFS completely
        GIT_LFS_SKIP_SMUDGE = "1"

        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
        REPO_URL = "https://github.com/L-T-Development/OCR-LLM.git"
        BRANCH   = "interns"
    }

    stages {

        // 🧹 SOLUTION 1B: Clean workspace to remove old .env and cached files
        stage('🧹 Clean Workspace') {
            steps {
                deleteDir()
                echo '🧼 Workspace cleaned successfully'
            }
        }

        stage('📥 Checkout Source Code (Git LFS Skipped)') {
            steps {
                bat '''
                @echo off
                echo 🔕 Disabling Git LFS...

                git lfs uninstall > nul 2>&1
                git config --global filter.lfs.required false

                echo 📥 Cloning repository WITHOUT Git LFS...
                git clone --branch %BRANCH% %REPO_URL%
                '''
            }
        }

        stage('🔐 Security Scan') {
            steps {
                dir('OCR-LLM') {
                    bat '''
                    @echo off
                    setlocal

                    REM ---- .env file check ----
                    for /r %%f in (.env) do (
                        echo ❌ SECURITY ISSUE: .env file found at %%f
                        exit /b 1
                    )

                    REM ---- Hardcoded secrets check ----
                    findstr /si /m "password= secret= api_key= token= aws_secret_access_key" *.py *.env *.txt *.yml *.yaml > nul
                    if %errorlevel%==0 (
                        echo ❌ SECURITY ISSUE: Hardcoded secrets detected
                        exit /b 1
                    )

                    echo ✅ Security scan passed
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
                    bat "\"%PYTHON%\" -m venv %VENV_DIR%"
                    bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install --upgrade pip"
                    bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install -r requirements.txt"
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
