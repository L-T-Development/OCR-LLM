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

        stage('🔐 Security Scan – Hardcoded Secrets') {
            steps {
                dir('OCR-LLM') {
                    bat '''
                    @echo off
                    setlocal EnableDelayedExpansion

                    echo 🔍 Scanning for hardcoded secrets...

                    REM ---- Search patterns ----
                    set PATTERNS=password= password: passwd api_key token secret aws_secret_access_key

                    set FOUND=0

                    for %%p in (%PATTERNS%) do (
                        echo 🔎 Checking for %%p
                        findstr /S /N /I "%%p" *.py *.txt *.yml *.yaml *.json 2>nul
                        if !errorlevel! == 0 (
                            set FOUND=1
                        )
                    )

                    if !FOUND! == 1 (
                        echo ❌ SECURITY ISSUE: Hardcoded secret(s) found above
                        exit /b 1
                    )

                    echo ✅ Security scan passed (no hardcoded secrets found)
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
