# S3 Blob Storage Configuration

This document describes how to configure and use S3-compatible blob storage with the DBAL.

## Overview

The DBAL supports multiple blob storage backends:
- **Filesystem** - Local file storage (default for development)
- **Memory** - In-memory storage (for testing)
- **S3** - AWS S3 or S3-compatible storage (for production)
- **Tenant-aware** - Multi-tenant wrapper for any backend

## Installing S3 Support

The AWS SDK is an **optional dependency** to keep the bundle size small when S3 is not needed.

### Installation

```bash
cd dbal/development
npm install @aws-sdk/client-s3
```

### Why Optional?

- Reduces bundle size for projects not using S3
- Prevents unnecessary dependency downloads
- Allows frontend builds without AWS SDK installed
- Runtime error if S3 is configured but SDK not installed

## S3 Configuration

### Environment Variables

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# For S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
S3_ENDPOINT=https://your-endpoint.com
S3_FORCE_PATH_STYLE=true
```

### DBAL Configuration

```typescript
import { DBALClient } from '@/dbal'

const client = new DBALClient({
  mode: 'production',
  adapter: 'prisma',
  database: {
    url: process.env.DATABASE_URL,
  },
  blob: {
    provider: 's3',
    s3: {
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    },
  },
})
```

## S3-Compatible Services

### MinIO (Self-Hosted)

```bash
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=dbal-blobs
```

### DigitalOcean Spaces

```bash
AWS_REGION=nyc3
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_ACCESS_KEY_ID=your-spaces-key
AWS_SECRET_ACCESS_KEY=your-spaces-secret
S3_BUCKET=your-space-name
```

### Cloudflare R2

```bash
AWS_REGION=auto
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
S3_BUCKET=your-bucket-name
```

## Usage Example

```typescript
import { getDBAL } from '@/lib/dbal/database-dbal/core/get-dbal.server'

// Initialize DBAL with S3 configuration
await initializeDBAL()
const dbal = await getDBAL()

// Upload a file
await dbal.blob.upload({
  key: 'uploads/document.pdf',
  data: fileBuffer,
  metadata: {
    contentType: 'application/pdf',
    uploadedBy: userId,
  },
})

// Download a file
const fileData = await dbal.blob.download('uploads/document.pdf')

// List files
const files = await dbal.blob.list({ prefix: 'uploads/' })

// Delete a file
await dbal.blob.delete('uploads/document.pdf')
```

## Tenant-Aware Storage

For multi-tenant applications, use tenant-aware storage:

```typescript
const client = new DBALClient({
  // ... other config
  blob: {
    provider: 'tenant-aware',
    tenantAware: {
      baseProvider: 's3',
      s3: {
        region: 'us-east-1',
        bucket: 'tenant-blobs',
        // ... other S3 config
      },
    },
  },
})
```

All blob operations will be automatically scoped to the tenant:
- Keys prefixed with `tenants/{tenantId}/`
- Prevents cross-tenant access
- Simplifies multi-tenant blob management

## Troubleshooting

### Error: `@aws-sdk/client-s3 is not installed`

**Solution**: Install the AWS SDK:
```bash
cd dbal/development
npm install @aws-sdk/client-s3
```

### Error: `Access Denied`

**Solution**: Check IAM permissions for your AWS credentials. Required permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

### Error: `Bucket not found`

**Solution**: 
1. Verify bucket name is correct
2. Ensure bucket exists in the specified region
3. Check access key has permission to access the bucket

### Connection timeout with custom endpoint

**Solution**: Verify `S3_FORCE_PATH_STYLE=true` for S3-compatible services like MinIO.

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use IAM roles** - When running on AWS (EC2, ECS, Lambda)
3. **Restrict bucket policies** - Limit access to specific prefixes
4. **Enable versioning** - For audit trails and recovery
5. **Use encryption** - Enable S3 server-side encryption
6. **Implement lifecycle policies** - Auto-delete old files

## Performance Tips

1. **Use CloudFront** - CDN for frequently accessed files
2. **Implement caching** - Cache blob metadata and URLs
3. **Batch operations** - Upload/delete multiple files at once
4. **Use multipart upload** - For large files (>5GB)
5. **Configure CORS** - For browser-based uploads

## See Also

- [DBAL Blob Storage API](../api/blob-storage.md)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
