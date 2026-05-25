pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEV_MODE',    defaultValue: false, description: 'Deploy in dev mode (next dev --turbopack)')
        booleanParam(name: 'FORCE_BUILD', defaultValue: false, description: 'Rebuild all images even if they already exist')
        booleanParam(name: 'SKIP_BASE',   defaultValue: false, description: 'Skip base image build (use if already up-to-date)')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 2, unit: 'HOURS')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Base Images') {
            when { expression { !params.SKIP_BASE } }
            steps {
                dir('deployment') {
                    // Builds node-deps and pip-deps (fast, skips if already exists)
                    sh 'python3 deployment.py build base node-deps pip-deps'
                }
            }
        }

        stage('App Images') {
            steps {
                dir('deployment') {
                    script {
                        def forceFlag = params.FORCE_BUILD ? '--force' : ''
                        sh "python3 deployment.py build apps ${forceFlag}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('deployment') {
                    script {
                        def devFlag = params.DEV_MODE ? '--dev' : ''
                        sh "python3 deployment.py stack down ${devFlag} || true"
                        sh "python3 deployment.py stack up ${devFlag}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Stack deployed successfully. Portal: http://localhost:8900"
        }
        failure {
            echo "Deployment failed — check logs above."
        }
    }
}
