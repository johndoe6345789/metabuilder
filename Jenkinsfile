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

        stage('Style Quality') {
            steps {
                sh '''
                    python3 scripts/style-quality.py \
                        2>&1 | tee style-quality-report.txt
                    python3 scripts/style-quality.py --save
                '''
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: 'style-quality-report.txt',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('Refactor Compliance') {
            steps {
                sh '''
                    python3 scripts/refactor-coverage.py \
                        --fail-below 80 --gate 80 \
                        --save \
                        2>&1 | tee refactor-coverage-report.txt
                '''
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: 'refactor-coverage-report.txt',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('Test Coverage') {
            steps {
                script {
                    def frontends = ['nextjs', 'codegen', 'workflowui', 'dbal', 'exploded-diagrams', 'pastebin', 'postgres']
                    def threshold = 80

                    frontends.each { frontend ->
                        def pkgJson = "frontends/${frontend}/package.json"
                        if (!fileExists(pkgJson)) {
                            echo "Skipping ${frontend} — no package.json"
                            return
                        }

                        def hasScript = sh(
                            script: "node -e \"const p=require('./${pkgJson}'); process.stdout.write(p.scripts && p.scripts['test:coverage'] ? 'yes' : 'no')\"",
                            returnStdout: true
                        ).trim()

                        if (hasScript == 'yes') {
                            echo "Running coverage for frontends/${frontend}"
                            dir("frontends/${frontend}") {
                                sh "npm run test:coverage"
                            }
                        } else {
                            echo "Skipping ${frontend} — no test:coverage script defined"
                        }
                    }

                    // Check thresholds for any coverage-summary.json that was generated
                    frontends.each { frontend ->
                        def summary = "frontends/${frontend}/coverage/coverage-summary.json"
                        if (fileExists(summary)) {
                            def result = sh(
                                script: """
                                    node -e "
                                    const fs = require('fs');
                                    const data = JSON.parse(fs.readFileSync('${summary}'));
                                    const total = data.total;
                                    const threshold = ${threshold};
                                    const metrics = ['lines', 'functions', 'branches', 'statements'];
                                    const failed = [];
                                    metrics.forEach(m => {
                                        const pct = total[m].pct;
                                        console.log('  ${frontend} ' + m + ': ' + pct + '%');
                                        if (pct < threshold) failed.push(m + ' (' + pct + '% < ' + threshold + '%)');
                                    });
                                    if (failed.length > 0) {
                                        console.error('COVERAGE FAILED for ${frontend}: ' + failed.join(', '));
                                        process.exit(1);
                                    }
                                    console.log('  ${frontend}: all metrics >= ' + threshold + '% PASSED');
                                    "
                                """,
                                returnStatus: true
                            )
                            if (result != 0) {
                                error("Coverage threshold not met for ${frontend} (minimum ${threshold}%)")
                            }
                        }
                    }
                }
            }
            post {
                always {
                    // Publish HTML coverage reports as artifacts
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/nextjs/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: nextjs'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/codegen/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: codegen'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/workflowui/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: workflowui'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/dbal/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: dbal'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/exploded-diagrams/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: exploded-diagrams'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/pastebin/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: pastebin'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontends/postgres/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage: postgres'
                    ])
                    archiveArtifacts(
                        artifacts: 'frontends/*/coverage/coverage-summary.json',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
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
