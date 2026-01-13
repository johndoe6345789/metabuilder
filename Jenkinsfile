pipeline {
  agent any

  environment {
    NODE_VERSION = '20.11.1'
    NODE_DIST = "node-v${NODE_VERSION}-linux-x64"
    NODE_HOME = "${WORKSPACE}/${NODE_DIST}"
    PATH = "${NODE_HOME}/bin:${env.PATH}"
  }

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Download Node') {
      steps {
        sh '''
          curl -fsSLO https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.xz
          tar -xJf ${NODE_DIST}.tar.xz
          node --version
          npm --version
        '''
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Typecheck') {
      steps {
        sh 'npm run typecheck'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}
