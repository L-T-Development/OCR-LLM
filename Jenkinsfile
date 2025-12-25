pipeline {
    agent any

    environment {
        PYTHON   = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
        VENV_DIR = "venv"
    }

    stages {

        /* -------------------- CHECKOUT -------------------- */
        stage('📥 Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        /* -------------------- SECURITY: .env -------------------- */
        stage('🚫 .env File Check') {
            steps {
                bat '''
                @echo off
                echo 🔍 Checking for committed .env file...

                if exist .env (
                    echo ❌ SECURITY ISSUE: .env file found in repository
                    exit /b 1
                )

                echo ✅ No .env file found
                '''
            }
        }

        /* -------------------- SECURITY: HARDCODED SECRETS -------------------- */
        stage('🔐 Security Scan (Demo-Friendly)') {
            steps {
                bat '''
                @echo off
                echo 🔍 Running security scan (excluding venv, allowing demo values)...

                for /r %%f in (*.py *.yml *.yaml *.txt *.env) do (
                    echo %%f | findstr /i "\\\\venv\\\\" >nul
                    if errorlevel 1 (

                        REM Match credential-like assignments
                        findstr /i /r "password *= *['\\\"][^'\"]+ api_key *= *['\\\"][^'\"]+ token *= *['\\\"][^'\"]+ aws_secret_access_key *= *['\\\"][^'\"]+" "%%f" ^
                        | findstr /v /i "demo test dummy placeholder example sample" >nul

                        if not errorlevel 1 (
                            echo ❌ SECURITY ISSUE FOUND IN %%f
                            exit /b 1
                        )
                    )
                )

                echo ✅ Security scan passed
                '''
            }
        }

        /* -------------------- PYTHON CHECK -------------------- */
        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
            }
        }

        /* -------------------- SETUP VENV -------------------- */
        stage('⚙ Setup Python Environment') {
            steps {
                bat '''
                @echo off
                if not exist %VENV_DIR% (
                    echo 📦 Creating virtual environment...
                    "%PYTHON%" -m venv %VENV_DIR%
                )

                echo ⬆ Upgrading pip...
                "%VENV_DIR%\\Scripts\\python.exe" -m pip install --upgrade pip

                echo 📥 Installing dependencies...
                "%VENV_DIR%\\Scripts\\python.exe" -m pip install -r requirements.txt
                '''
            }
        }

        /* -------------------- TESTS -------------------- */
        stage('🧪 Run Tests') {
            steps {
                bat "\"%VENV_DIR%\\Scripts\\python.exe\" -m pytest tests/test_ocr.py"
            }
        }
    }

    /* -------------------- POST ACTIONS -------------------- */
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
