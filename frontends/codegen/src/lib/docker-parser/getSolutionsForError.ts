import { DockerError, Solution } from '@/types/docker'

export function getSolutionsForError(error: DockerError): Solution[] {
  const solutions: Solution[] = []

  const type = error.type.toLowerCase()

  if (type.includes('missing dependency') || type.includes('module')) {
    if (error.message.includes('@rollup/rollup') || error.message.includes('rollup')) {
      solutions.push({
        title: 'Install Platform-Specific Rollup Dependencies',
        description:
          'The Rollup bundler requires platform-specific native binaries. For multi-platform Docker builds, you need to ensure optional dependencies are installed.',
        steps: [
          'Update your Dockerfile to force install optional dependencies',
          'Use --platform flag to ensure correct architecture binaries',
          'Consider using --legacy-peer-deps flag'
        ],
        code: `# In your Dockerfile, change the npm install line to:
RUN npm install --legacy-peer-deps --include=optional

# Or explicitly install the missing package:
RUN npm install @rollup/rollup-linux-arm64-musl --save-optional`,
        codeLanguage: 'dockerfile'
      })

      solutions.push({
        title: 'Update package.json optionalDependencies',
        description: 'Explicitly declare platform-specific Rollup dependencies as optional.',
        steps: [
          'Add optionalDependencies section to package.json',
          'Include all platform variants of Rollup',
          'Rebuild your Docker image'
        ],
        code: `{
  "optionalDependencies": {
    "@rollup/rollup-linux-arm64-musl": "^4.53.3",
    "@rollup/rollup-linux-x64-musl": "^4.53.3",
    "@rollup/rollup-darwin-arm64": "^4.53.3",
    "@rollup/rollup-darwin-x64": "^4.53.3"
  }
}`,
        codeLanguage: 'json'
      })
    } else {
      solutions.push({
        title: 'Install Missing Node Module',
        description: 'A required npm package is not installed in your Docker image.',
        steps: [
          'Verify the package is listed in package.json',
          'Ensure npm install runs before the build step',
          'Check for typos in import statements'
        ],
        code: `# Make sure your Dockerfile includes:
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build`,
        codeLanguage: 'dockerfile'
      })
    }
  }

  if (type.includes('platform') || type.includes('architecture')) {
    solutions.push({
      title: 'Build for Single Platform',
      description:
        "If you don't need multi-platform support, build for a single architecture to avoid complexity.",
      steps: [
        'Remove --platform flag from docker build command',
        'Or specify only one platform: --platform linux/amd64',
        'This will speed up builds and avoid architecture-specific issues'
      ],
      code: `# Instead of:
docker buildx build --platform linux/amd64,linux/arm64 .

# Use:
docker buildx build --platform linux/amd64 .`,
      codeLanguage: 'bash'
    })

    solutions.push({
      title: 'Use QEMU for Cross-Platform Builds',
      description: 'Set up proper emulation for building ARM images on x64 hosts.',
      steps: [
        'Install QEMU binfmt support',
        'Create a new buildx builder instance',
        'Verify the builder supports multiple platforms'
      ],
      code: `# Set up buildx with QEMU
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx create --name multiplatform --driver docker-container --use
docker buildx inspect --bootstrap`,
      codeLanguage: 'bash'
    })
  }

  if (type.includes('file not found')) {
    solutions.push({
      title: 'Check File Paths and .dockerignore',
      description: 'Verify that all required files are copied into the Docker build context.',
      steps: [
        "Check .dockerignore to ensure needed files aren't excluded",
        'Verify COPY commands use correct paths',
        'Ensure files exist in your repository'
      ],
      code: `# In .dockerignore, make sure you're not ignoring needed files
# Remove these if they're blocking required files:
# node_modules
# dist
# build`,
      codeLanguage: 'text'
    })
  }

  if (type.includes('permission')) {
    solutions.push({
      title: 'Fix File Permissions',
      description: "The Docker build process doesn't have permission to access required files.",
      steps: [
        'Check file permissions in your repository',
        'Add RUN chmod commands if needed',
        'Consider using a non-root user correctly'
      ],
      code: `# In Dockerfile, add permission fixes:
RUN chmod +x /app/scripts/*.sh
RUN chown -R node:node /app`,
      codeLanguage: 'dockerfile'
    })
  }

  if (solutions.length === 0) {
    solutions.push({
      title: 'General Docker Build Troubleshooting',
      description: 'Try these common fixes for Docker build issues.',
      steps: [
        'Clear Docker build cache: docker builder prune',
        'Rebuild without cache: docker build --no-cache',
        'Check Docker daemon logs for more details',
        'Verify your Dockerfile syntax is correct',
        'Ensure base images are accessible and up to date'
      ]
    })
  }

  return solutions
}
