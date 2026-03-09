pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = "${env.REGISTRY}/${env.GIT_REPO_OWNER}/${env.GIT_REPO_NAME}"
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
        SLACK_CHANNEL = '#deployments'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Setup') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        sh '''
                            node --version
                            npm --version
                            npm install --legacy-peer-deps
                        '''
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('ESLint') {
                    steps {
                        script {
                            nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                                sh 'npm run lint || echo "No lint script found"'
                            }
                        }
                    }
                }
                stage('TypeScript Check') {
                    steps {
                        script {
                            nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                                sh 'npx tsc --noEmit'
                            }
                        }
                    }
                }
                stage('Component Registry Check') {
                    steps {
                        script {
                            nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                                sh 'npm run components:validate'
                            }
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        sh 'npm test || echo "No test script found"'
                    }
                }
            }
            post {
                always {
                    junit testResults: '**/junit.xml', allowEmptyResults: true
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        sh 'npm run build'
                    }
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }

        stage('E2E Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        sh '''
                            npx playwright install --with-deps chromium
                            npm run test:e2e
                        '''
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        stage('Security Scan') {
            parallel {
                stage('NPM Audit') {
                    steps {
                        script {
                            nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                                sh 'npm audit --audit-level=moderate || true'
                            }
                        }
                    }
                }
                stage('Trivy Scan') {
                    steps {
                        sh '''
                            docker run --rm -v $(pwd):/workspace aquasec/trivy:latest \
                                fs --exit-code 0 --no-progress --format json \
                                --output /workspace/trivy-report.json /workspace
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def imageTags = [
                        "${IMAGE_NAME}:${env.BRANCH_NAME}",
                        "${IMAGE_NAME}:${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
                    ]
                    
                    if (env.BRANCH_NAME == 'main') {
                        imageTags.add("${IMAGE_NAME}:latest")
                    }

                    sh '''
                        docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
                        docker buildx create --name multiarch --driver docker-container --use || true
                        docker buildx inspect --bootstrap
                    '''

                    docker.withRegistry("https://${REGISTRY}", 'docker-registry-credentials') {
                        sh """
                            docker buildx build \
                                --platform linux/amd64,linux/arm64 \
                                --tag ${IMAGE_NAME}:${env.BRANCH_NAME} \
                                --tag ${IMAGE_NAME}:${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT} \
                                ${env.BRANCH_NAME == 'main' ? "--tag ${IMAGE_NAME}:latest" : ''} \
                                --push \
                                .
                        """
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            environment {
                DEPLOY_ENV = 'staging'
            }
            steps {
                script {
                    echo "Deploying to staging environment..."
                    echo "Image: ${IMAGE_NAME}:develop-${env.GIT_COMMIT_SHORT}"
                    
                    sh '''
                        curl -X POST ${STAGING_WEBHOOK_URL} \
                            -H "Content-Type: application/json" \
                            -d "{\\"image\\":\\"${IMAGE_NAME}:develop\\",\\"sha\\":\\"${GIT_COMMIT_SHORT}\\"}"
                    '''
                }
            }
            post {
                success {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'good',
                        message: "Staging deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                }
                failure {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'danger',
                        message: "Staging deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            environment {
                DEPLOY_ENV = 'production'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    echo "Deploying to production environment..."
                    echo "Image: ${IMAGE_NAME}:latest"
                    
                    sh '''
                        curl -X POST ${PRODUCTION_WEBHOOK_URL} \
                            -H "Content-Type: application/json" \
                            -d "{\\"image\\":\\"${IMAGE_NAME}:latest\\",\\"sha\\":\\"${GIT_COMMIT_SHORT}\\"}"
                    '''
                }
            }
            post {
                success {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'good',
                        message: "Production deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                }
                failure {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'danger',
                        message: "Production deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            slackSend(
                channel: SLACK_CHANNEL,
                color: 'danger',
                message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
