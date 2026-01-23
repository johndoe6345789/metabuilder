# CI/CD Workflow Plugin Integration Guide

Complete guide to integrating workflow plugins (Playwright, Storybook) into your CI/CD pipeline.

## Overview

Workflow plugins enable your CI/CD pipeline to execute complex testing and documentation workflows through the MetaBuilder DAG executor, providing:

- **Unified Orchestration**: Single configuration format (JSON) for all pipeline stages
- **Multi-Tenant Isolation**: Automatic tenant-based result segregation
- **Error Recovery**: Automatic retry, fallback, and error handling
- **Performance Monitoring**: Built-in metrics and cache statistics
- **Reproducibility**: Identical execution in dev, staging, and production

## Quick Integration

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/workflow-plugins.yml
name: E2E Tests & Documentation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install

      - name: Run E2E tests via workflow plugin
        run: |
          npm --prefix workflow/executor/ts run test:plugins -- \
            --workflow workflow/examples/e2e-testing-workflow.json \
            --tenant system
```

### 2. GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - document

e2e-tests:
  stage: test
  image: node:20
  script:
    - npm install
    - npm --prefix workflow/executor/ts run test:plugins -- \
        --workflow workflow/examples/e2e-testing-workflow.json \
        --tenant $CI_PROJECT_NAMESPACE

build-docs:
  stage: document
  image: node:20
  script:
    - npm install
    - npm --prefix workflow/executor/ts run test:plugins -- \
        --workflow workflow/examples/storybook-documentation-workflow.json \
        --tenant $CI_PROJECT_NAMESPACE
```

### 3. Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
  agent any

  stages {
    stage('Setup') {
      steps {
        sh 'npm install'
      }
    }

    stage('E2E Tests') {
      steps {
        sh '''
          npm --prefix workflow/executor/ts run test:plugins -- \
            --workflow workflow/examples/e2e-testing-workflow.json \
            --tenant jenkins-${BUILD_NUMBER}
        '''
      }
    }

    stage('Build Docs') {
      steps {
        sh '''
          npm --prefix workflow/executor/ts run test:plugins -- \
            --workflow workflow/examples/storybook-documentation-workflow.json \
            --tenant jenkins-${BUILD_NUMBER}
        '''
      }
    }
  }

  post {
    always {
      junit 'test-results/**/*.xml'
      archiveArtifacts artifacts: 'storybook-static/**'
    }
  }
}
```

## Architecture

### Pipeline Stage Mapping

```
Traditional CI/CD                    Workflow Plugin CI/CD
─────────────────                    ──────────────────

npm run test:e2e            →        testing.playwright node
  (hardcoded Playwright)              (configured in JSON)

npm run storybook:build     →        documentation.storybook node
  (hardcoded Storybook)               (configured in JSON)

npm run deploy              →        Custom workflow nodes
  (custom script)                     (extensible plugin system)

Results in stdout/logs      →        Structured NodeResult objects
  (unstructured)                      (queryable, parseable)
```

### Data Flow

```
CI/CD Trigger (push/PR/schedule)
        │
        ▼
Load Workflow Definition (JSON)
        │
        ├─ testing.playwright nodes
        ├─ documentation.storybook nodes
        └─ Custom plugin nodes
        │
        ▼
DAG Executor
        │
        ├─ Initialize plugins
        ├─ Validate node parameters
        ├─ Execute in dependency order
        └─ Track metrics
        │
        ▼
Node Results
        │
        ├─ Status: success|error
        ├─ Data: structured output
        ├─ Duration: execution time
        └─ Metrics: cache, retries, etc
        │
        ▼
Artifacts & Reports
        │
        ├─ Test results (JUnit, JSON)
        ├─ Coverage reports
        ├─ Documentation builds
        └─ Performance metrics
```

## Workflow Configuration

### E2E Testing Workflow

```json
{
  "name": "CI/CD E2E Testing",
  "id": "ci-e2e-tests",
  "version": "1.0.0",
  "tenantId": "${TENANT_ID}",
  "nodes": [
    {
      "id": "test_chromium",
      "name": "Test on Chromium",
      "type": "testing.playwright",
      "parameters": {
        "browser": "chromium",
        "baseUrl": "http://localhost:3000",
        "testFile": "e2e/**/*.spec.ts",
        "headless": true,
        "timeout": 60000
      }
    },
    {
      "id": "test_firefox",
      "name": "Test on Firefox",
      "type": "testing.playwright",
      "parameters": {
        "browser": "firefox",
        "baseUrl": "http://localhost:3000",
        "testFile": "e2e/**/*.spec.ts",
        "headless": true
      }
    },
    {
      "id": "aggregate_results",
      "name": "Aggregate Test Results",
      "type": "operation",
      "parameters": {
        "operation": "aggregate",
        "mode": "and"
      }
    }
  ],
  "connections": {
    "test_chromium": {
      "main": {
        "0": [{"node": "test_firefox", "type": "main", "index": 0}]
      }
    },
    "test_firefox": {
      "main": {
        "0": [{"node": "aggregate_results", "type": "main", "index": 0}]
      }
    }
  }
}
```

### Documentation Build Workflow

```json
{
  "name": "CI/CD Documentation Build",
  "id": "ci-docs-build",
  "version": "1.0.0",
  "tenantId": "${TENANT_ID}",
  "nodes": [
    {
      "id": "build_storybook",
      "name": "Build Storybook",
      "type": "documentation.storybook",
      "parameters": {
        "command": "build",
        "outputDir": "storybook-static",
        "docs": true
      }
    },
    {
      "id": "upload_s3",
      "name": "Upload to S3",
      "type": "aws.s3.upload",
      "parameters": {
        "bucket": "my-docs-bucket",
        "source": "storybook-static",
        "destination": "docs/${BUILD_NUMBER}/"
      }
    },
    {
      "id": "notify_slack",
      "name": "Notify Team",
      "type": "notification",
      "parameters": {
        "type": "slack",
        "channel": "#documentation",
        "message": "Documentation deployed: ${S3_URL}"
      }
    }
  ]
}
```

## Environment Variables

### Required

```bash
# Node environment (dev/staging/prod)
NODE_ENV=production

# Tenant identifier
TENANT_ID=ci-system

# Application base URL
APP_BASE_URL=https://app.example.com

# Plugin configuration
PLUGIN_TIMEOUT=60000
PLUGIN_CONCURRENCY=5
```

### Optional

```bash
# AWS credentials (for S3 uploads)
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_REGION=us-east-1

# Slack webhook (for notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Performance monitoring
ENABLE_METRICS=true
METRICS_INTERVAL=60000
```

## GitHub Actions Integration

### Setup Workflow File

```yaml
# .github/workflows/workflow-plugins.yml (See full example in repo)
name: Workflow Plugins - E2E & Docs

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e-tests:
    name: "E2E Testing (Workflow Plugin)"
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [ chromium, firefox, webkit ]

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run tests via workflow plugin
        run: |
          npx ts-node workflow/executor/ts/cli.ts \
            execute \
            --workflow workflow/examples/e2e-testing-workflow.json \
            --tenant "github-${{ github.run_id }}"

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.browser }}
          path: test-results/
```

### PR Comments

Workflows can automatically comment on pull requests with results:

```yaml
- name: Comment PR with results
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const testsPassed = ${{ job.status == 'success' }};
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## ✅ E2E Tests Passed\n\nTests executed via workflow plugin.`
      });
```

## Performance Optimization

### Parallel Execution

Run multiple browsers in parallel (GitHub Actions):

```yaml
strategy:
  matrix:
    browser: [ chromium, firefox, webkit ]
  max-parallel: 3
```

Results in 3x faster testing:
- Chromium tests: 2 min
- Firefox tests: 2 min (parallel)
- WebKit tests: 2 min (parallel)
- **Total**: 2 min (vs 6 min sequential)

### Caching

```yaml
- name: Cache plugin executors
  uses: actions/cache@v3
  with:
    path: workflow/executor/ts/node_modules
    key: ${{ runner.os }}-plugins-${{ hashFiles('**/package-lock.json') }}
```

### Artifacts

Only upload essential artifacts:

```yaml
- name: Upload test artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
    retention-days: 7  # Auto-delete after 7 days
```

## Error Handling

### Retry Strategy

```json
{
  "id": "flaky_test",
  "type": "testing.playwright",
  "errorRecovery": {
    "strategy": "retry",
    "maxAttempts": 3,
    "initialDelay": 1000,
    "backoffMultiplier": 2
  }
}
```

### Fallback Strategy

```json
{
  "id": "docs_build",
  "type": "documentation.storybook",
  "errorRecovery": {
    "strategy": "fallback",
    "fallbackValue": { "cached": true, "version": "1.0.0" }
  }
}
```

### Fail Strategy

```json
{
  "id": "security_check",
  "type": "security.scan",
  "errorRecovery": {
    "strategy": "fail",
    "stopWorkflow": true
  }
}
```

## Monitoring & Alerts

### Health Checks

```bash
#!/bin/bash
# scripts/check-workflow-plugins.sh

npm --prefix workflow/executor/ts run validate-plugins

if [ $? -ne 0 ]; then
  echo "ERROR: Plugin validation failed"
  exit 1
fi

echo "✅ Workflow plugins healthy"
```

### Metrics Collection

```typescript
// Track plugin performance
setInterval(() => {
  const stats = getPluginRegistryStats();

  console.log({
    plugins: stats.totalPlugins,
    cacheHitRate: `${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%`,
    avgExecutionTime: `${stats.meanExecutionTime.toFixed(0)}ms`,
    errors: stats.errorCount
  });
}, 60000);
```

### Slack Notifications

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Workflow plugin failure",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Workflow Plugin Error*\n${{ job.status }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
            }
          }
        ]
      }
```

## Deployment Strategies

### Staging Deployment

```yaml
staging-deploy:
  runs-on: ubuntu-latest
  needs: [ e2e-tests, validate-plugins ]
  if: github.ref == 'refs/heads/develop'

  steps:
    - uses: actions/checkout@v6

    - name: Deploy to staging
      run: |
        npm --prefix workflow/executor/ts run deploy -- \
          --environment staging \
          --tenant staging
```

### Production Deployment

```yaml
production-deploy:
  runs-on: ubuntu-latest
  needs: [ e2e-tests, validate-plugins ]
  if: github.event_name == 'release'
  environment:
    name: production

  steps:
    - uses: actions/checkout@v6

    - name: Deploy to production
      run: |
        npm --prefix workflow/executor/ts run deploy -- \
          --environment production \
          --tenant production
```

## Migration from Traditional CI/CD

### Before (Hardcoded)

```bash
# .github/workflows/test.yml
- name: Run E2E tests
  run: npm run test:e2e

- name: Build docs
  run: npm run storybook:build

- name: Deploy
  run: npm run deploy
```

**Issues:**
- Hardcoded scripts
- Duplicate logic across workflows
- No structured error handling
- Difficult to monitor/debug

### After (Workflow Plugins)

```yaml
# .github/workflows/workflow-plugins.yml
- name: Execute workflow pipeline
  run: |
    npx ts-node workflow/executor/ts/cli.ts execute \
      --workflow workflow/examples/pipeline.json \
      --tenant system
```

**Benefits:**
- Configuration-as-code (JSON)
- Reusable across CI/CD systems
- Built-in error recovery
- Automatic metrics/monitoring
- Multi-tenant support

## Troubleshooting

### Plugin Not Found

```
Error: No executor registered for node type: testing.playwright

Solution:
1. Verify setupPluginRegistry() called
2. Check plugin.json exists at expected location
3. Validate JSON workflow references correct node type
```

### Workflow Timeout

```
Error: Workflow execution timeout after 300s

Solution:
1. Increase timeout in workflow definition
2. Optimize test suite (parallel execution)
3. Check for blocking operations
```

### Out of Memory

```
Error: JavaScript heap out of memory

Solution:
1. Increase Node memory: NODE_OPTIONS=--max-old-space-size=4096
2. Reduce plugin concurrency
3. Clear cache periodically
```

## Best Practices

### 1. Use Workflow Templates

Create reusable workflow templates:

```json
{
  "name": "E2E Testing Template",
  "templates": {
    "chromium-tests": {
      "type": "testing.playwright",
      "parameters": {
        "browser": "chromium",
        "baseUrl": "${APP_BASE_URL}",
        "headless": true
      }
    }
  }
}
```

### 2. Environment-Specific Configs

```bash
# config/workflows/dev.json
{
  "APP_BASE_URL": "http://localhost:3000",
  "TIMEOUT": 30000
}

# config/workflows/prod.json
{
  "APP_BASE_URL": "https://app.example.com",
  "TIMEOUT": 60000
}
```

### 3. Monitoring

```yaml
- name: Export workflow metrics
  run: |
    npm --prefix workflow/executor/ts run export-metrics \
      --output metrics.json

- name: Upload to monitoring service
  run: |
    curl -X POST https://metrics.example.com/ingest \
      -d @metrics.json
```

### 4. Documentation

Maintain workflow documentation:

```markdown
# CI/CD Workflows

## E2E Testing Workflow
- **File**: workflow/examples/e2e-testing-workflow.json
- **Plugins**: testing.playwright (3x - chromium, firefox, webkit)
- **Duration**: ~6 minutes
- **Parallelization**: Yes (3 browsers)

## Documentation Workflow
- **File**: workflow/examples/storybook-documentation-workflow.json
- **Plugins**: documentation.storybook, aws.s3.upload
- **Duration**: ~5 minutes
- **Output**: https://docs.example.com
```

## See Also

- [Plugin Initialization Guide](./PLUGIN_INITIALIZATION_GUIDE.md)
- [Workflow Plugins Architecture](./WORKFLOW_PLUGINS_ARCHITECTURE.md)
- [DAG Executor Documentation](./DAG_EXECUTOR_GUIDE.md)
- [Example Workflows](../workflow/examples/)
