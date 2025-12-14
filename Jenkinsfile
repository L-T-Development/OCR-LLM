pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
        REPO_URL = "https://github.com/L-T-Development/OCR-LLM.git"
        BRANCH = "interns"
    }

    stages {

        stage('Checkout Source Code (LFS Disabled)') {
            steps {
                echo '📥 Cloning repository with Git LFS disabled...'
                bat '''
                @echo off
                set GIT_LFS_SKIP_SMUDGE=1

                if exist OCR-LLM rmdir /s /q OCR-LLM

                git clone --branch %BRANCH% %REPO_URL%
                cd OCR-LLM
                '''
            }
        }

        stage('🔐 Security Scan') {
            steps {
                dir('OCR-LLM') {
                    bat '''
                    @echo off
                    setlocal

                    REM ---- .env check ----
                    for /r %%f in (.env) do (
                        echo ❌ SECURITY VIOLATION: .env file found at %%f
                        exit /b 1
                    )

                    REM ---- hardcoded secret scan ----
                    findstr /si /m "password= secret= api_key= token= aws_secret_access_key" *.py *.env *.txt *.yml *.yaml > nul
                    if %errorlevel%==0 (
                        echo ❌ SECURITY VIOLATION: Hardcoded secrets detected
                        exit /b 1
                    )

                    echo ✅ Security scan passed
                    '''
                }
            }
        }

        stage('Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('Setup Python Environment') {
            steps {
                dir('OCR-LLM') {
                    bat "\"%PYTHON%\" -m venv %VENV_DIR%"
                    bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install --upgrade pip"
                    bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install -r requirements.txt"
                }
            }
        }

        stage('Run Tests') {
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
