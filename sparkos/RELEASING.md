# SparkOS Release Guide

This guide explains how to create and publish releases for SparkOS.

## Release Methods

SparkOS supports two ways to create releases:

1. **Automatic (Recommended)**: Push a version tag to trigger GitHub Actions
2. **Manual**: Build locally and upload to GitHub

## Method 1: Automatic Release (Recommended)

This method uses GitHub Actions to automatically build and publish releases.

### Prerequisites

- Push access to the repository
- All changes committed and pushed to `main` branch

### Steps

1. **Ensure everything is ready**
   ```bash
   # Make sure you're on main and up to date
   git checkout main
   git pull origin main
   
   # Verify the build works
   make init
   ```

2. **Create and push a version tag**
   ```bash
   # Create a tag (use semantic versioning: v1.0.0, v2.1.3, etc.)
   git tag v1.0.0
   
   # Push the tag to GitHub
   git push origin v1.0.0
   ```

3. **Wait for GitHub Actions**
   - Go to https://github.com/johndoe6345789/SparkOS/actions
   - Two workflows will run:
     - **"Build and Release"**: Creates the release ZIP
     - **"Docker Build and Publish"**: Publishes Docker images
   - Both should complete successfully (green checkmarks)

4. **Verify the release**
   - Go to https://github.com/johndoe6345789/SparkOS/releases
   - Your new release should appear with `sparkos-release.zip` attached
   - Docker images are available at `ghcr.io/johndoe6345789/sparkos:v1.0.0`

### What Gets Published

When you push a version tag, GitHub Actions automatically:

- ✅ Builds the init binary (statically linked)
- ✅ Creates a release package ZIP containing:
  - Compiled init binary
  - Complete source code
  - Build scripts and configuration
  - Root filesystem structure
  - Full documentation
- ✅ Creates a GitHub Release at `/releases`
- ✅ Builds multi-architecture Docker images (AMD64 + ARM64)
- ✅ Publishes Docker images to GitHub Container Registry
- ✅ Tags Docker images with version number

## Method 2: Manual Release

Use this method if you need to build releases locally without pushing tags.

### Prerequisites

- Docker installed locally
- `zip` utility installed

### Steps

1. **Build the release package using Docker**
   ```bash
   # Build for a specific version
   ./scripts/docker-release.sh v1.0.0
   
   # Or use Make
   make docker-release
   
   # The package will be created at: release/sparkos-release.zip
   ```

2. **Verify the package**
   ```bash
   # Check the file was created
   ls -lh release/sparkos-release.zip
   
   # List contents
   unzip -l release/sparkos-release.zip | head -40
   ```

3. **Create a GitHub Release manually**
   - Go to https://github.com/johndoe6345789/SparkOS/releases/new
   - Fill in:
     - **Tag**: Create a new tag (e.g., `v1.0.0`)
     - **Title**: `SparkOS v1.0.0` (or similar)
     - **Description**: List changes and features
   - **Upload** the `sparkos-release.zip` file
   - Click **"Publish release"**

### What's Included

The Docker-based release script creates the exact same package as GitHub Actions:

- Compiled init binary (statically linked, ready to use)
- Complete source code
- Build scripts (including `docker-release.sh`)
- Configuration files
- Root filesystem structure
- Full documentation (README, ARCHITECTURE, CONTRIBUTING)

## Testing Before Release

Always test your changes before creating a release:

### Test the Build

```bash
# Test compilation
make clean && make init

# Verify the binary
file init
ldd init  # Should show "not a dynamic executable" (static)
```

### Test with Docker

```bash
# Build the Docker image
docker build -t sparkos:test .

# Run the test environment
docker run --rm sparkos:test

# Or use Docker Compose
docker-compose up
```

### Test the Release Script

```bash
# Build a test release package
./scripts/docker-release.sh test

# Verify it was created
ls -lh release/sparkos-release.zip
```

## Release Checklist

Before creating a release:

- [ ] All changes are committed and pushed to `main`
- [ ] Build succeeds: `make init` works
- [ ] Docker build succeeds: `docker build -t sparkos:test .` works
- [ ] Documentation is up to date (README, ARCHITECTURE, etc.)
- [ ] Version follows semantic versioning (vMAJOR.MINOR.PATCH)
- [ ] CHANGELOG or release notes are prepared (if applicable)

## Troubleshooting

### GitHub Actions Fails

1. Check the workflow logs at https://github.com/johndoe6345789/SparkOS/actions
2. Common issues:
   - Build errors: Check if `make init` works locally
   - Permission errors: Ensure `contents: write` permission in workflow
   - Docker errors: Verify Dockerfile builds locally

### Release Not Created

- Ensure you pushed a tag starting with `v` (e.g., `v1.0.0`)
- Check that the workflow has `contents: write` permissions
- Verify the workflow completed successfully (green checkmark)

### Docker Images Not Published

- Check the "Docker Build and Publish" workflow logs
- Ensure the tag was pushed (not just created locally)
- Verify `packages: write` permission in workflow

## Version Numbering

Use semantic versioning for releases:

- **v1.0.0**: First stable release
- **v1.1.0**: New features, backward compatible
- **v1.1.1**: Bug fixes only
- **v2.0.0**: Breaking changes

## Release Artifacts

Each release includes:

1. **GitHub Release Page**
   - Release notes
   - Downloadable `sparkos-release.zip`
   - Link to Docker images

2. **Docker Images** (automatically published)
   - `ghcr.io/johndoe6345789/sparkos:v1.0.0` (specific version)
   - `ghcr.io/johndoe6345789/sparkos:1.0` (minor version)
   - `ghcr.io/johndoe6345789/sparkos:1` (major version)
   - `ghcr.io/johndoe6345789/sparkos:latest` (if released from main)

3. **Multi-Architecture Support**
   - Linux AMD64 (x86_64)
   - Linux ARM64 (aarch64)

## Next Steps

After releasing:

1. Announce the release (if applicable)
2. Update documentation links to point to the new version
3. Test the release on different platforms
4. Monitor for issues and prepare patches if needed

## Support

For questions or issues with releases:
- Open an issue: https://github.com/johndoe6345789/SparkOS/issues
- Check workflow logs: https://github.com/johndoe6345789/SparkOS/actions
