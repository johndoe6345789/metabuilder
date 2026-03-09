# CI/CD Configuration Guide

This project includes comprehensive CI/CD configurations for multiple platforms. Choose the one that best fits your infrastructure.

## Table of Contents

- [GitHub Actions](#github-actions)
- [GitLab CI](#gitlab-ci)
- [Jenkins](#jenkins)
- [CircleCI](#circleci)
- [Docker Setup](#docker-setup)

---

## GitHub Actions

### Location
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/release.yml` - Release automation

### Features
- ✅ Lint and type checking
- ✅ Unit and E2E tests
- ✅ Docker build and push to GHCR
- ✅ Security scanning with Trivy
- ✅ Automated deployments to staging/production
- ✅ Release creation with ZIP artifacts

### Setup

1. **Enable GitHub Actions** in your repository settings

2. **Configure secrets** (Settings → Secrets and variables → Actions):
   ```
   CODECOV_TOKEN          # Optional: for code coverage reporting
   SLACK_WEBHOOK          # Optional: for Slack notifications
   STAGING_WEBHOOK_URL    # Webhook for staging deployment
   PRODUCTION_WEBHOOK_URL # Webhook for production deployment
   ```

3. **Enable GitHub Packages** for Docker image storage (automatically enabled)

4. **Branch Protection** (recommended):
   - Require status checks to pass before merging
   - Require pull request reviews

### Usage

- Push to `develop` → Runs tests and deploys to staging
- Push to `main` → Runs full pipeline and deploys to production
- Create tag `v*` → Triggers release workflow

---

## GitLab CI

### Location
- `.gitlab-ci.yml`

### Features
- ✅ Multi-stage pipeline with dependency caching
- ✅ Parallel test execution
- ✅ Docker build and push to GitLab Registry
- ✅ Security scanning and audit reports
- ✅ Manual approval for production deployments

### Setup

1. **Configure CI/CD variables** (Settings → CI/CD → Variables):
   ```
   STAGING_WEBHOOK_URL     # Webhook for staging deployment
   PRODUCTION_WEBHOOK_URL  # Webhook for production deployment
   ```

2. **Enable GitLab Container Registry** (enabled by default)

3. **Configure runners** with Docker executor:
   ```toml
   [[runners]]
     name = "docker-runner"
     executor = "docker"
     [runners.docker]
       image = "node:20-alpine"
       privileged = true
   ```

### Usage

- Pipeline runs automatically on push
- Jobs are cached for faster execution
- Production deployment requires manual approval

---

## Jenkins

### Location
- `Jenkinsfile`

### Features
- ✅ Declarative pipeline with parallel stages
- ✅ Integration with Slack for notifications
- ✅ Artifact archiving and HTML report publishing
- ✅ Manual approval for production deployments
- ✅ Automatic workspace cleanup

### Setup

1. **Install required plugins**:
   - Pipeline
   - NodeJS
   - Docker Pipeline
   - Slack Notification
   - HTML Publisher

2. **Configure Node.js** (Manage Jenkins → Tools):
   - Add Node.js installation named "Node 20"
   - Version: 20.x

3. **Configure credentials**:
   ```
   docker-registry-credentials # Username/password for GHCR
   ```

4. **Set environment variables** in Jenkins configuration:
   ```
   GIT_REPO_OWNER
   GIT_REPO_NAME
   STAGING_WEBHOOK_URL
   PRODUCTION_WEBHOOK_URL
   SLACK_CHANNEL
   ```

5. **Create multibranch pipeline**:
   - New Item → Multibranch Pipeline
   - Add source: Git/GitHub
   - Script Path: Jenkinsfile

### Usage

- Pipeline triggers on SCM changes (polling or webhooks)
- View results in Blue Ocean interface
- Approve production deployments manually

---

## CircleCI

### Location
- `.circleci/config.yml`

### Features
- ✅ Workflow orchestration with job dependencies
- ✅ Docker layer caching for faster builds
- ✅ Slack notifications via orb
- ✅ Test result and artifact storage
- ✅ Approval step for production deployments

### Setup

1. **Connect repository** to CircleCI

2. **Configure environment variables** (Project Settings → Environment Variables):
   ```
   DOCKER_USERNAME           # GitHub username
   DOCKER_PASSWORD           # GitHub personal access token
   STAGING_WEBHOOK_URL       # Webhook for staging deployment
   PRODUCTION_WEBHOOK_URL    # Webhook for production deployment
   SLACK_ACCESS_TOKEN        # Optional: for Slack notifications
   SLACK_DEFAULT_CHANNEL     # Optional: default Slack channel
   ```

3. **Enable Docker Layer Caching** (requires paid plan):
   - Project Settings → Advanced → Enable Docker Layer Caching

### Usage

- Pipeline runs on every push
- Manual approval required for production on `main` branch
- View detailed insights in CircleCI dashboard

---

## Docker Setup

### Files
- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Local development and deployment
- `nginx.conf` - Nginx configuration for serving app
- `.dockerignore` - Excludes unnecessary files

### Build and Run Locally

```bash
# Build image
docker build -t codeforge:local .

# Run container
docker run -p 3000:80 codeforge:local

# Or use docker-compose
docker-compose up -d
```

### Production Deployment

The Docker image is automatically built and pushed to GHCR:

```bash
# Pull latest image
docker pull ghcr.io/<username>/<repo>:latest

# Run in production
docker run -d \
  -p 80:80 \
  --name codeforge \
  --restart unless-stopped \
  ghcr.io/<username>/<repo>:latest
```

### Health Checks

The container includes a health check endpoint at `/health`:

```bash
curl http://localhost:3000/health
# Response: healthy
```

---

## Common Configuration

### Environment Variables

All CI/CD platforms use these common environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_VERSION` | Node.js version | Yes (default: 20) |
| `REGISTRY` | Docker registry URL | Yes (default: ghcr.io) |
| `IMAGE_NAME` | Docker image name | Yes |
| `STAGING_WEBHOOK_URL` | Staging deployment webhook | Optional |
| `PRODUCTION_WEBHOOK_URL` | Production deployment webhook | Optional |
| `CODECOV_TOKEN` | Codecov integration token | Optional |
| `SLACK_WEBHOOK` | Slack webhook URL | Optional |

### Branch Strategy

- `main` - Production branch, deploys to production
- `develop` - Development branch, deploys to staging
- `feature/*` - Feature branches, runs tests only
- `v*` tags - Triggers release creation

### Pipeline Stages

All pipelines follow a similar structure:

1. **Lint** - ESLint and TypeScript checks
2. **Test** - Unit tests with coverage
3. **Build** - Application build
4. **E2E** - Playwright end-to-end tests
5. **Security** - npm audit and Trivy scan
6. **Docker** - Build and push image
7. **Deploy** - Staging (auto) and Production (manual)

### Deployment Webhooks

Configure deployment webhooks to integrate with your hosting platform:

```bash
# Example webhook payload
{
  "image": "ghcr.io/<username>/<repo>:latest",
  "sha": "abc123",
  "environment": "production"
}
```

Supported platforms:
- Vercel
- Netlify
- AWS ECS/EKS
- Kubernetes
- Custom deployment scripts

---

## Troubleshooting

### GitHub Actions

**Issue**: Docker push fails
```bash
Solution: Check GITHUB_TOKEN permissions in repository settings
Settings → Actions → General → Workflow permissions → Read and write
```

### GitLab CI

**Issue**: Runner fails to pull image
```bash
Solution: Check runner has access to Docker
docker info  # Should work on runner
```

### Jenkins

**Issue**: Pipeline hangs on input step
```bash
Solution: Check Jenkins has sufficient executors
Manage Jenkins → Configure System → # of executors
```

### CircleCI

**Issue**: Build fails with out of memory
```bash
Solution: Increase resource class in config.yml
resource_class: large  # or xlarge
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [CircleCI Documentation](https://circleci.com/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use environment variables** for sensitive data
3. **Enable branch protection** on main/develop branches
4. **Require code reviews** before merging
5. **Run security scans** in every pipeline
6. **Keep dependencies updated** using Dependabot/Renovate
7. **Use signed commits** for production deployments
8. **Implement RBAC** for deployment approvals

---

## License

This CI/CD configuration is part of CodeForge and follows the same license as the main project.
