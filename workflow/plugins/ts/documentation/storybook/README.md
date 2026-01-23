# Storybook Documentation Plugin

Generate and manage component documentation using Storybook as workflow nodes. Build, serve, and deploy documentation through the workflow system.

## Features

- **Commands**: dev (server), build (static), test
- **Configuration**: Custom ports, output directories, static assets
- **Documentation**: Build with docs enabled
- **Output tracking**: Capture build output and errors

## Usage in Workflows

```json
{
  "id": "build_docs",
  "name": "Build Storybook",
  "type": "documentation.storybook",
  "parameters": {
    "command": "build",
    "outputDir": "storybook-static",
    "docs": true
  }
}
```

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| command | string | build | build, dev, or test |
| port | number | 6006 | Port for dev server (dev only) |
| outputDir | string | storybook-static | Output directory |
| configDir | string | .storybook | Storybook config directory |
| staticDir | string | - | Static assets directory |
| docs | boolean | true | Build documentation |

## Example Workflow

See `storybook-documentation-workflow.json` for a complete documentation pipeline that:
1. Checks out repository
2. Installs dependencies
3. Builds static Storybook and docs
4. Uploads to S3
5. Invalidates CDN cache
6. Notifies team

## Integration

Can be integrated with:
- Git operations (clone, pull)
- Package management (npm install)
- AWS (S3, CloudFront)
- Notifications (Slack)
- Deployment systems

## Deployment

The plugin works in a workflow pipeline for:
- Continuous documentation generation
- Automated deployment to S3
- CDN cache invalidation
- Team notifications
