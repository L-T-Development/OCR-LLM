pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\rites\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        /* =======================
           CHECKOUT
           ======================= */
        stage('📥 Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        /* =======================
           SECRET SCANNING
           ======================= */
        stage('🔐 Secret Detection (Gitleaks)') {
            steps {
                echo 'Running Gitleaks secret scan...'
                bat '''
                gitleaks detect --source . --no-git --exit-code 1 || exit 1
                '''
            }
        }

        /* =======================
           DEPENDENCY SCAN
           ======================= */
        stage('🛡 Dependency Scan (Trivy)') {
            steps {
                echo 'Running Trivy filesystem scan...'
                bat '''
                trivy fs --severity HIGH,CRITICAL --exit-code 1 .
                '''
            }
        }

        /* =======================
           PYTHON SETUP
           ======================= */
        stage('🐍 Python Setup') {
            steps {
                bat "\"%PYTHON%\" --version"
                bat "\"%PYTHON%\" -m pip install --upgrade pip"
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
                bat "\"%PYTHON%\" -m pip install flake8"
            }
        }

        /* =======================
           LINTING
           ======================= */
        stage('🧹 Linting') {
            steps {
                echo 'Running flake8 linting...'
                bat "\"%PYTHON%\" -m flake8 ."
            }
        }

        /* =======================
           UNIT TESTS
           ======================= */
        stage('🧪 Unit Tests') {
            steps {
                bat "\"%PYTHON%\" -m pytest tests --junitxml=pytest-report.xml"
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'pytest-report.xml'
                }
            }
        }

        /* =======================
           BUILD
           ======================= */
        stage('📦 Build') {
            steps {
                echo 'Building application...'
                bat "\"%PYTHON%\" setup.py sdist || echo 'No setup.py found, skipping build'"
            }
        }

        /* =======================
           ARTIFACT ARCHIVAL
           ======================= */
        stage('📁 Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/dist/*', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ CI PIPELINE COMPLETED SUCCESSFULLY'
        }
        failure {
            echo '❌ CI PIPELINE FAILED — CHECK STAGE LOGS'
        }
        always {
            cleanWs()
        }
    }
}
