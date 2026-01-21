# Deployment Guide

## Simplified Docker Setup

The application now uses a simplified single-stage Docker build with Vite's preview server instead of nginx. This eliminates the complexity and glitches associated with the multi-stage nginx deployment.

## Benefits

- **Simpler**: Single-stage build, no nginx configuration needed
- **Smaller**: Alpine-based image (~100MB smaller)
- **More reliable**: Vite preview server handles routing correctly by default
- **Faster builds**: No multi-stage copying overhead
- **Better for SPA**: Vite preview understands React Router automatically

## CapRover Deployment

### Quick Deploy

1. Build and push your image:
   ```bash
   docker build -t your-registry/codeforge:latest .
   docker push your-registry/codeforge:latest
   ```

2. In CapRover, create a new app and deploy using the image

3. CapRover will automatically map port 80

### Environment Variables

The app respects the `PORT` environment variable, which CapRover sets automatically:
- Default: `80`
- CapRover will override this as needed

### Build Notes

- The Dockerfile uses `npm ci --omit=dev` to install only production dependencies after the build
- Console logs are stripped in production via terser
- Assets are served with proper routing via Vite's preview server

## Local Testing

Test the production build locally:

```bash
# Build the app
npm run build

# Preview (simulates production)
npm run preview

# Or with custom port
PORT=3000 npm run preview
```

## Why This Works Better

The previous nginx setup had these issues:
1. Required maintaining separate nginx configuration
2. Multi-stage build complexity
3. Asset path resolution issues with React Router
4. Health check endpoint needs custom nginx config

The Vite preview server:
1. Built-in SPA routing support
2. Handles all asset paths correctly
3. Production-ready and officially supported
4. Simpler configuration via vite.config.ts

## Troubleshooting

If you still experience issues:

1. **Check the base path**: Ensure `base: './'` in vite.config.ts
2. **Verify port**: CapRover should set PORT env var automatically
3. **Check logs**: Use CapRover's log viewer to see startup issues
4. **Test locally**: Run `npm run build && npm run preview` to verify the build
