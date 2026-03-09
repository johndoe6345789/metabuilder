# CI/CD Workflows

This repository includes automated CI/CD workflows for building, testing, and deploying the CodeSnippet application.

## Workflows

### 1. Docker Build and Push to GHCR (`docker-publish.yml`)

This workflow automatically builds **two separate Docker images** (backend and frontend) and pushes them to GitHub Container Registry (GHCR).

**Triggers:**
- Push to `main` branch
- Push of version tags (e.g., `v1.0.0`)
- Pull requests to `main` (build only, no push)

**Features:**
- Two clearly marked build jobs:
  - **Backend**: Python/Flask API (`ghcr.io/<owner>/<repo>-backend`)
  - **Frontend**: React/Vite application (`ghcr.io/<owner>/<repo>-frontend`)
- Multi-platform Docker image building (AMD64 and ARM64)
- Automatic tagging strategy:
  - `latest` - Latest build from main branch
  - `v1.0.0` - Semantic version tags
  - `v1.0` - Major.minor version
  - `v1` - Major version
  - `main-<sha>` - Branch with commit SHA
- Separate Docker layer caching for each image
- Parallel builds for faster CI/CD

**Configuration:**
- The workflow uses the `GITHUB_TOKEN` for authentication (automatic)
- Optional: Set `VITE_FLASK_BACKEND_URL` as a repository variable for frontend backend configuration

**Using the Docker Images:**

```bash
# Backend - Pull and run
docker pull ghcr.io/<owner>/<repo>-backend:latest
docker run -p 5000:5000 ghcr.io/<owner>/<repo>-backend:latest

# Frontend - Pull and run
docker pull ghcr.io/<owner>/<repo>-frontend:latest
docker run -p 3000:3000 ghcr.io/<owner>/<repo>-frontend:latest

# Pull specific versions
docker pull ghcr.io/<owner>/<repo>-backend:v1.0.0
docker pull ghcr.io/<owner>/<repo>-frontend:v1.0.0

# Pull for a specific architecture (optional)
docker pull --platform linux/amd64 ghcr.io/<owner>/<repo>-backend:latest
docker pull --platform linux/arm64 ghcr.io/<owner>/<repo>-frontend:latest

# Run full stack with docker-compose
# Create a docker-compose.yml referencing GHCR images:
# backend:
#   image: ghcr.io/<owner>/<repo>-backend:latest
# frontend:
#   image: ghcr.io/<owner>/<repo>-frontend:latest
```

**Making Images Public:**
1. Go to your packages at `https://github.com/users/<username>/packages`
2. For each image (`<repo>-backend` and `<repo>-frontend`):
   - Click on the package
   - Go to "Package settings"
   - Change visibility to "Public" if you want the image to be publicly accessible

### 2. Deploy to GitHub Pages (`deploy-pages.yml`)

This workflow builds the frontend application and deploys it to GitHub Pages.

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow dispatch

**Features:**
- Automatic build using Node.js 20 and npm
- Uploads build artifacts to GitHub Pages
- Automatic deployment to `https://<username>.github.io/<repo>/`

**Setup Requirements:**

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Under "Build and deployment", select "Source: GitHub Actions"

2. **Configure Base Path:**
   
   Set the `VITE_BASE_PATH` repository variable for proper asset loading:
   - For deployment at `https://<username>.github.io/<repo>/`, set: `/<repo>/`
   - For custom domain or root deployment, set: `/`
   
   Go to Settings → Secrets and variables → Actions → Variables → New repository variable
   - Name: `VITE_BASE_PATH`
   - Value: `/<repo>/` (or your repository name)

3. **Optional Configuration:**
   - Set `VITE_FLASK_BACKEND_URL` as a repository variable if you want to connect to a backend

**Accessing the Deployed Site:**

After the workflow runs successfully, your site will be available at:
- `https://<username>.github.io/<repo>/`
- The URL is also shown in the workflow run details

## Configuration

### Repository Variables

Set these variables in your repository settings (Settings → Secrets and variables → Actions → Variables):

- `VITE_BASE_PATH` (recommended for GitHub Pages): Base path for the application
  - Example: `/<repo>/` for `username.github.io/<repo>/`
  - Use `/` for custom domains or root deployment
- `VITE_FLASK_BACKEND_URL` (optional): URL of your Flask backend API
  - Example: `https://api.example.com`
  - If not set, the app will use local IndexedDB storage

### Repository Secrets

The workflows use the following automatically available secrets:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions (no setup needed)

## Workflow Permissions

Both workflows require the following permissions (already configured):

**docker-publish.yml:**
- `contents: read` - Read repository contents
- `packages: write` - Push to GitHub Container Registry (for both backend and frontend images)
- `id-token: write` - OIDC token for security

**deploy-pages.yml:**
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for security

## Manual Triggering

### GitHub Pages Deployment

You can manually trigger the GitHub Pages deployment:

1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Creating a Release

To trigger a Docker build with version tags:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will build and push the Docker image with tags: `v1.0.0`, `v1.0`, `v1`, and `latest`.

## Troubleshooting

### Docker Build Fails

1. Check the build logs in the Actions tab
2. Ensure the Dockerfile is valid
3. Test the build locally: `docker build -t test .`
4. For multi-arch builds locally, use: `docker buildx build --platform linux/amd64,linux/arm64 -t test .`

### GitHub Pages Deployment Fails

1. Ensure GitHub Pages is enabled in repository settings
2. Check that the build completes successfully
3. Verify the `dist` folder is created during build
4. Check workflow permissions are correctly set

### Image Not Pushing to GHCR

1. Verify workflow permissions include `packages: write`
2. Check that the workflow is running on push to main (not a PR)
3. Ensure the repository owner has enabled GHCR

## Local Development

To test the workflows locally, you can:

1. **Build the Backend Docker image:**
   ```bash
   cd backend
   docker build -t <repo>-backend .
   docker run -p 5000:5000 <repo>-backend
   ```

2. **Build the Frontend Docker image:**
   ```bash
   docker build -t <repo>-frontend .
   docker run -p 3000:3000 <repo>-frontend
   ```

3. **Build for multiple architectures (requires Docker Buildx):**
   ```bash
   # Create a new builder instance (one-time setup)
   docker buildx create --use
   
   # Build backend for both AMD64 and ARM64
   docker buildx build --platform linux/amd64,linux/arm64 -t <repo>-backend ./backend
   
   # Build frontend for both AMD64 and ARM64
   docker buildx build --platform linux/amd64,linux/arm64 -t <repo>-frontend .
   
   # Build and load for your current architecture
   docker buildx build --platform linux/amd64 -t <repo>-backend --load ./backend
   docker buildx build --platform linux/amd64 -t <repo>-frontend --load .
   ```

4. **Build for GitHub Pages:**
   ```bash
   npm ci
   npm run build
   # Serve the dist folder
   npx serve dist
   ```

## Workflow Status Badges

Add these badges to your README.md (replace `<owner>` and `<repo>` with your values):

```markdown
[![Docker Build](https://github.com/<owner>/<repo>/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/docker-publish.yml)
[![Deploy to Pages](https://github.com/<owner>/<repo>/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/deploy-pages.yml)
```

## Further Customization

### Adding Tests

To add automated testing before deployment, modify the workflows to include a test step:

```yaml
- name: Run tests
  run: npm test
```

### Multi-stage Deployments

For staging and production environments, consider:
- Creating separate workflows for different branches
- Using environment protection rules
- Configuring different backend URLs per environment

### Backend Deployment

The workflow now includes automated backend deployment to GHCR:
- Backend image is automatically built from the `/backend` directory
- Image is available at `ghcr.io/<owner>/<repo>-backend`
- Deploy backend to a service like Heroku, DigitalOcean, or AWS using the GHCR image
- Update `VITE_FLASK_BACKEND_URL` to point to your deployed backend
