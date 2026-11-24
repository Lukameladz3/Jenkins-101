// Runs Playwright tests on a Windows Jenkins node.
// Requirements on the node: Node.js 18+ and npm on the PATH, plus git.
// Works as "Pipeline script from SCM" and when pasted into the job's "Pipeline script" box.

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        skipDefaultCheckout()   // we clone the repo ourselves in the Checkout stage
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Lukameladz3/Jenkins-101.git'
            }
        }

        stage('Check tools') {
            steps {
                bat 'node --version && npm --version'
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install browsers') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run tests') {
            steps {
                bat 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Test results tab + trend graph (JUnit plugin)
            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
            // HTML report, screenshots, videos and traces, downloadable from the build page
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        }
    }
}
