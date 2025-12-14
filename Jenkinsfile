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
                git lfs uninstall > nul 2>&1 || echo Git LFS not installed
                git config --global filter.lfs.required false || echo Git config skipped
                git clone --branch %BRANCH% %REPO_URL%
                exit /b 0
                '''
            }
        }

        stage('🔐 Security Scan – Hardcoded Secrets') {
            steps {
                dir('OCR-LLM') {
                    powershell '''
                    Write-Host "🔍 Scanning for hardcoded secrets..."

                    $patterns = @(
                        'password\\s*[=:]\\s*["\\''][^"\\'']+["\\'']',
                        'api[_-]?key\\s*[=:]\\s*["\\''][^"\\'']+["\\'']',
                        'secret\\s*[=:]\\s*["\\''][^"\\'']+["\\'']',
                        'token\\s*[=:]\\s*["\\''][^"\\'']+["\\'']'
                    )

                    $exclude = @(
                        'vocab.json',
                        'tokenizer',
                        'models',
                        'node_modules',
                        'package-lock.json'
                    )

                    $found = $false

                    foreach ($pattern in $patterns) {
                        $results = Get-ChildItem -Recurse -File |
                                   Where-Object {
                                       $exclude -notcontains $_.Name
                                   } |
                                   Select-String -Pattern $pattern -CaseSensitive:$false

                        if ($results) {
                            Write-Host "❌ Match found for pattern: $pattern"
                            $results | ForEach-Object {
                                Write-Host "$($_.Path):$($_.LineNumber): $($_.Line)"
                            }
                            $found = $true
                        }
                    }

                    if ($found) {
                        Write-Error "❌ Hardcoded secrets detected"
                        exit 1
                    }

                    Write-Host "✅ Security scan passed (no hardcoded secrets)"
                    exit 0
                    '''
                }
            }
        }
        
        stage('🐍 Check Python') {
            steps {
                bat "\"%PYTHON%\" --version"
