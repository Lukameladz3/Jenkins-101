// Runs Playwright tests directly on the Jenkins agent.
// Requirements on the agent: Node.js 18+ and npm on the PATH (git is needed by Jenkins anyway).
// Works on both Linux/macOS (sh) and Windows (bat) agents.

def run(String cmd) {
    if (isUnix()) { sh cmd } else { bat cmd }
}

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Check tools') {
            steps {
                run 'node --version'
                run 'npm --version'
            }
        }

        stage('Install dependencies') {
            steps {
                run 'npm ci'
            }
        }

        stage('Install browsers') {
            steps {
                script {
                    if (isUnix()) {
                        // --with-deps installs Linux system libraries and needs root.
                        // If Jenkins is not root, just download the browser
                        // (an admin must then run "npx playwright install-deps" once on the agent).
                        sh '''
                            if [ "$(id -u)" = "0" ]; then
                                npx playwright install --with-deps chromium
                            else
                                npx playwright install chromium
                            fi
                        '''
                    } else {
                        bat 'npx playwright install chromium'
                    }
                }
            }
        }

        stage('Run tests') {
            steps {
                run 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Test results tab + trend graph (JUnit plugin, included in "suggested plugins")
            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
            // HTML report, screenshots, videos and traces, downloadable from the build page
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        }
    }
}
