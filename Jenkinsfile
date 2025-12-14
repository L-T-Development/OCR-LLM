pipeline {
    agent any

    options {
        // ✅ Disable Jenkins automatic checkout
        skipDefaultCheckout(true)
    }

    environment {
        // ✅ Skip Git LFS download BEFORE checkout
        GIT_LFS_SKIP_SMUDGE = "1"

        // ✅ Python config
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                echo '📥 Checking out source code (Git LFS skipped)...'
                checkout scm
            }
        }

        stage('🔐 Security Scan') {
            steps {
                echo '🔍 Scanning for .env files and hardcoded secrets...'
                bat '''
                @echo off
                setlocal enabledelayedexpansion

                REM ---- Check for .env files ----
                for /r %%f in (.env) do (
                    echo ❌ SECURITY VIOLATION: .env file found at %%f
                    exit /b 1
                )

                REM ---- Check for hardcoded secrets ----
                findstr /si /m "password= secret= api_key= token= aws_secret_access_key" *.py *.env *.txt *.yml *.yaml > nul
                if %errorlevel%==0 (
                    echo ❌ SECURITY VIOLATION: Hardcoded secrets detected
                    exit /b 1
                )

                echo ✅ Security scan passed
                '''
            }
        }

        stage('Check Python') {
            steps {
                echo '🐍 Checking Python version...'
                bat "\"%PYTHON%\" --version"
            }
        }

        stage('Setup Python Environment') {
            steps {
                echo '📦 Setting up virtual environment...'
                bat "\"%PYTHON%\" -m venv %VENV_DIR%"
                bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install --upgrade pip"
                bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pip install -r requirements.txt"
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pytest tests/test_ocr.py"
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
