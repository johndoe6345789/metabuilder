# DBAL Integration Guide

This document explains how the C++ and TypeScript DBAL (Database Abstraction Layer) components are integrated into the MetaBuilder project.

## Overview

The DBAL system provides a unified interface for data storage and retrieval across the MetaBuilder application. It consists of:

1. **C++ DBAL Daemon** - Production-ready HTTP server with database abstraction
2. **TypeScript DBAL Client** - Browser-compatible client for development
3. **Integration Layer** - Bridges the DBAL with existing MetaBuilder components

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MetaBuilder App                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React Hooks  │  │ Integration  │  │   Database   │ │
│  │  (useDBAL)   │→ │    Layer     │→ │    Class     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         ↓                  ↓                            │
│  ┌─────────────────────────────────┐                   │
│  │    TypeScript DBAL Client        │                  │
│  │  - KV Store (In-Memory)          │                  │
│  │  - Blob Storage (In-Memory)      │                  │
│  │  - Tenant Management             │                  │
│  └─────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
                       │
                       │ HTTP API
                       ↓
┌─────────────────────────────────────────────────────────┐
│              C++ DBAL Daemon (Production)                │
│  - HTTP/1.1 Server (Nginx-compatible)                   │
│  - PostgreSQL Adapter                                    │
│  - Blob Storage (S3/Filesystem)                          │
│  - Multi-tenant System                                   │
│  - Access Control & Quotas                               │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
metabuilder/
├── dbal/
│   ├── cpp/                      # C++ DBAL Daemon
│   │   ├── src/
│   │   │   ├── daemon/           # HTTP server & main
│   │   │   ├── core/             # Core DBAL logic
│   │   │   ├── adapters/         # Database adapters
│   │   │   └── blob/             # Blob storage
│   │   ├── include/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── CMakeLists.txt
│   └── ts/                       # TypeScript DBAL Client
│       └── src/
│           ├── core/             # Client, types, validation
│           ├── adapters/         # Memory adapter
│           ├── blob/             # Blob storage implementations
│           └── runtime/          # Runtime utilities
├── src/
│   ├── lib/
│   │   └── dbal-integration.ts   # Integration layer
│   ├── hooks/
│   │   └── useDBAL.ts            # React hooks
│   └── components/
│       └── DBALDemo.tsx          # Demo component
└── deployment/                   # Docker deployment configs
```

## Integration Components

### 1. DBAL Integration Layer (`src/lib/dbal-integration.ts`)

The integration layer provides a singleton interface to the DBAL system:

```typescript
import { dbal } from '@/lib/dbal-integration'

// Initialize DBAL (happens automatically)
await dbal.initialize()

// Key-Value operations
await dbal.kvSet('user-preferences', { theme: 'dark' })
const prefs = await dbal.kvGet('user-preferences')

// Blob storage operations
await dbal.blobUpload('avatar.png', imageData)
const data = await dbal.blobDownload('avatar.png')

// List operations
await dbal.kvListAdd('recent-files', ['file1.txt', 'file2.txt'])
const files = await dbal.kvListGet('recent-files')
```

### 2. React Hooks (`src/hooks/useDBAL.ts`)

React hooks for easy DBAL access in components:

```typescript
import { useKVStore, useBlobStorage, useCachedData } from '@/hooks/useDBAL'

// In your component
function MyComponent() {
  // KV Store hook
  const kv = useKVStore()
  await kv.set('key', 'value')
  const value = await kv.get('key')

  // Blob Storage hook
  const blob = useBlobStorage()
  await blob.upload('file.txt', data)
  const fileData = await blob.download('file.txt')

  // Cached Data hook (automatic serialization)
  const { data, save, clear } = useCachedData('user-settings')
  await save({ theme: 'light' })
}
```

### 3. Demo Component (`src/components/DBALDemo.tsx`)

A comprehensive demonstration component showing all DBAL features:

- Key-Value store operations
- List management
- Blob storage upload/download
- Cached data with React hooks

Access it by importing:

```typescript
import { DBALDemo } from '@/components/DBALDemo'

<DBALDemo />
```

## Entity CRUD (In-Memory)

The DBAL also ships lightweight, in-memory entity CRUD helpers for local tooling and tests.

TypeScript (in-memory store + entity modules):

```typescript
import { createInMemoryStore } from '@/core/store/in-memory-store'
import { createUser } from '@/core/entities/user'
import { createLuaScript } from '@/core/entities/lua-script'

const store = createInMemoryStore()
const user = await createUser(store, { username: 'demo', email: 'demo@example.com' })
await createLuaScript(store, {
  name: 'health_check',
  code: 'return true',
  allowedGlobals: ['math'],
  createdBy: user.success ? user.data.id : ''
})
```

C++ (per-entity modules + shared store):

```
dbal/production/src/entities/<entity>/*.hpp
dbal/production/src/store/in_memory_store.hpp
```

## Usage Examples

### Storing User Preferences

```typescript
import { useKVStore } from '@/hooks/useDBAL'

function UserSettings() {
  const kv = useKVStore()

  const savePreferences = async () => {
    await kv.set('user-preferences', {
      theme: 'dark',
      language: 'en',
      notifications: true
    }, 3600) // Cache for 1 hour
  }

  const loadPreferences = async () => {
    const prefs = await kv.get('user-preferences')
    return prefs
  }
}
```

### Uploading Files

```typescript
import { useBlobStorage } from '@/hooks/useDBAL'

function FileUploader() {
  const blob = useBlobStorage()

  const handleUpload = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    await blob.upload(`uploads/${file.name}`, data, {
      'content-type': file.type,
      'uploaded-at': new Date().toISOString()
    })
  }
}
```

### Managing Lists

```typescript
import { useKVStore } from '@/hooks/useDBAL'

function RecentFiles() {
  const kv = useKVStore()

  const addRecentFile = async (filename: string) => {
    await kv.listAdd('recent-files', [filename])
  }

  const getRecentFiles = async () => {
    const files = await kv.listGet('recent-files', 0, 10) // Get first 10
    return files
  }
}
```

### Automatic Caching

```typescript
import { useCachedData } from '@/hooks/useDBAL'

function UserProfile() {
  const { data, loading, save } = useCachedData('user-profile')

  // data is automatically loaded from cache on mount
  // save() automatically updates both cache and local state

  const updateProfile = async (newData) => {
    await save(newData, 7200) // Cache for 2 hours
  }
}
```

## Multi-Tenant Support

The DBAL system includes full multi-tenant support with isolation, access control, and quotas:

```typescript
import { dbal } from '@/lib/dbal-integration'

// Create a new tenant
const tenantManager = dbal.getTenantManager()
await tenantManager.createTenant('company-123', {
  maxBlobStorageBytes: 1024 * 1024 * 1024, // 1GB
  maxBlobCount: 10000,
  maxRecords: 100000
})

// Use tenant-specific storage
const kv = useKVStore('company-123', 'user-456')
await kv.set('company-data', { ... })
```

## Production Deployment

In production, the TypeScript client can connect to the C++ DBAL daemon via HTTP:

```typescript
// Configure DBAL to use remote server
await dbal.initialize({
  adapter: 'http',
  endpoint: 'http://dbal-daemon:8080'
})
```

The C++ daemon provides:
- High-performance HTTP/1.1 server
- PostgreSQL adapter for persistent storage
- S3/Filesystem blob storage
- Nginx-compatible reverse proxy headers
- Health checks and monitoring
- Multi-tenant isolation
- Access control and quotas

## Testing

Run the DBAL demo component to test all features:

```bash
# Start the development server
npm run dev

# Navigate to the DBAL Demo page
# Or import <DBALDemo /> in any component
```

## Configuration

### Environment Variables

```bash
# For TypeScript client
DBAL_ADAPTER=memory  # or 'http' for production
DBAL_ENDPOINT=http://dbal-daemon:8080  # if using HTTP adapter

# TODO: deployment docs live under docs/deployments/; update this reference.
# For C++ daemon (see deployment/README.md)
DBAL_BIND_ADDRESS=0.0.0.0
DBAL_PORT=8080
DBAL_LOG_LEVEL=info
DBAL_MODE=production
DBAL_SQL_ENGINE=postgres  # Override with 'mysql' when targeting the MySQL daemon
DBAL_API_KEY=super-secret-key  # API key shared with trusted frontends and daemon clients
NEXT_PUBLIC_DBAL_API_KEY=super-secret-key  # Expose key to trusted Next frontends only
```

### TypeScript Configuration

The DBAL module is aliased in `tsconfig.json` and `vite.config.ts`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/dbal/*": ["./dbal/*"]
  }
}
```

## API Reference

### DBALIntegration

Main singleton class for DBAL access.

**Methods:**
- `initialize(config?)` - Initialize DBAL system
- `getClient()` - Get DBAL client instance
- `getTenantManager()` - Get tenant manager
- `getKVStore()` - Get KV store instance
- `getBlobStorage()` - Get blob storage instance
- `kvSet(key, value, ttl?, tenantId?, userId?)` - Store key-value data
- `kvGet(key, tenantId?, userId?)` - Retrieve key-value data
- `kvDelete(key, tenantId?, userId?)` - Delete key-value data
- `kvListAdd(key, items, tenantId?, userId?)` - Add items to list
- `kvListGet(key, tenantId?, userId?, start?, end?)` - Get list items
- `blobUpload(key, data, metadata?)` - Upload blob data
- `blobDownload(key)` - Download blob data
- `blobDelete(key)` - Delete blob data
- `blobList(prefix?)` - List all blobs
- `blobGetMetadata(key)` - Get blob metadata

### React Hooks

**useDBAL()**
- Returns: `{ isReady, error }`
- Ensures DBAL is initialized

**useKVStore(tenantId?, userId?)**
- Returns: `{ isReady, set, get, delete, listAdd, listGet }`
- KV store operations with automatic error handling

**useBlobStorage()**
- Returns: `{ isReady, upload, download, delete, list, getMetadata }`
- Blob storage operations with automatic error handling

**useCachedData(key, tenantId?, userId?)**
- Returns: `{ data, loading, error, save, clear, isReady }`
- Automatic caching with React state management

## Troubleshooting

### DBAL not initializing

Check browser console for errors. Common issues:
- Path alias not configured correctly in vite.config.ts
- TypeScript path mapping missing in tsconfig.json

### Can't import DBAL modules

Ensure path aliases are configured:
```typescript
// Should work
import { dbal } from '@/lib/dbal-integration'
import { DBALClient } from '@/dbal/development/src'
```

### Type errors

Run `npm run build` to check for TypeScript errors:
```bash
npm run build
```

### Memory adapter limitations

The in-memory adapter stores data in browser memory:
- Data is lost on page reload
- Limited by browser memory constraints
- For production, use HTTP adapter with C++ daemon

## Future Enhancements

- [ ] HTTP adapter for TypeScript client
- [ ] Prisma integration for SQL queries
- [ ] Real-time sync between clients
- [ ] Offline support with sync
- [ ] Encryption at rest
- [ ] Advanced query builder
- [ ] GraphQL API layer
- [ ] WebSocket support for real-time updates

## Related Documentation

TODO: Fix related doc links (deployments path and local implementation docs).
- [C++ DBAL Documentation](../dbal/production/README.md)
- [TypeScript DBAL Documentation](../dbal/development/README.md)
- [Docker Deployment](../deployment/README.md)
- [Multi-Tenant System](../MULTI_TENANT_SYSTEM.md)
- [Blob Storage](../BLOB_STORAGE_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check this documentation
2. Review the demo component (`src/components/DBALDemo.tsx`)
3. Check the integration tests
4. Create a GitHub issue

## License

TODO: No LICENSE file exists at repo root; update to correct location (e.g., docs/LICENSE) or add one.
See LICENSE file in project root.
