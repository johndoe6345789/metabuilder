# Multi-Tenant System Implementation

Complete multi-tenant support for both blob storage and structured data with access control, quotas, and namespace isolation.

## Features

### Blob Storage (Files)
1. ✅ **Multi-tenant isolation** - Namespace-based data separation
2. ✅ **Access control** - Permission checks (read, write, delete)
3. ✅ **Storage quotas** - Size limits, file count limits, max file size
4. ✅ **Virtual root directories** - Scoped views, path sandboxing

### Structured Data (User/Page/KV/Lists)
1. ✅ **Multi-tenant isolation** - Tenant-scoped data access
2. ✅ **Access control** - Role-based permissions (owner, admin, member, viewer)
3. ✅ **Storage quotas** - Record count limits, data size limits, list length limits

## Architecture

### Components

#### 1. Tenant Context (`tenant-context.ts`)
- **TenantIdentity**: User identity within a tenant (role, permissions)
- **TenantQuota**: Resource limits and current usage
- **TenantContext**: Context for all operations (identity + quota + namespace)
- **TenantManager**: Manages tenants, quotas, and usage tracking

#### 2. Key-Value Store (`kv-store.ts`)
- **Primitive types**: string, number, boolean, null
- **Complex types**: objects, arrays/lists
- **Operations**: get, set, delete, exists
- **List operations**: listAdd, listGet, listRemove, listLength, listClear
- **Batch operations**: mget, mset
- **Query operations**: list, count, clear

#### 3. Tenant-Aware Blob Storage (`tenant-aware-storage.ts`)
- Wraps any BlobStorage implementation
- Automatic namespace scoping
- Permission checking on all operations
- Quota enforcement
- Usage tracking

## Usage Examples

### 1. Initialize Tenant System

```typescript
import {
  InMemoryTenantManager,
  InMemoryKVStore,
  TenantAwareBlobStorage,
  createBlobStorage
} from './dbal/development/src'

// Create tenant manager
const tenantManager = new InMemoryTenantManager()

// Create tenant with quotas
await tenantManager.createTenant('tenant-123', {
  maxBlobStorageBytes: 1024 * 1024 * 1024, // 1GB
  maxBlobCount: 10000,
  maxBlobSizeBytes: 100 * 1024 * 1024, // 100MB per file
  maxRecords: 100000,
  maxDataSizeBytes: 500 * 1024 * 1024, // 500MB
  maxListLength: 10000
})
```

### 2. Blob Storage with Multi-Tenancy

```typescript
// Create base storage
const baseStorage = createBlobStorage({
  type: 's3',
  s3: { bucket: 'shared-bucket', region: 'us-east-1' }
})

// Wrap with tenant-aware storage
const tenantStorage = new TenantAwareBlobStorage(
  baseStorage,
  tenantManager,
  'tenant-123',
  'user-456'
)

// Upload - automatically scoped and quota-checked
await tenantStorage.upload('documents/report.pdf', pdfBuffer, {
  contentType: 'application/pdf'
})
// Actual S3 key: tenants/tenant-123/documents/report.pdf

// List - scoped to tenant
const files = await tenantStorage.list({ prefix: 'documents/' })
// Only returns files under tenants/tenant-123/documents/

// Check usage
const stats = await tenantStorage.getStats()
console.log(`Using ${stats.totalSize} bytes, ${stats.count} files`)
```

### 3. Key-Value Store with Multi-Tenancy

```typescript
const kvStore = new InMemoryKVStore()
const context = await tenantManager.getTenantContext('tenant-123', 'user-456')

// Store primitives
await kvStore.set('config:theme', 'dark', context)
await kvStore.set('config:fontSize', 16, context)
await kvStore.set('config:enabled', true, context)

// Store objects
await kvStore.set('user:profile', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: { notifications: true }
}, context)

// Retrieve
const theme = await kvStore.get('config:theme', context) // 'dark'
const profile = await kvStore.get('user:profile', context)

// Lists
await kvStore.listAdd('tasks', ['Task 1', 'Task 2'], context)
await kvStore.listAdd('tasks', ['Task 3'], context)

const tasks = await kvStore.listGet('tasks', context) // ['Task 1', 'Task 2', 'Task 3']
const length = await kvStore.listLength('tasks', context) // 3

await kvStore.listRemove('tasks', 'Task 2', context)
const updated = await kvStore.listGet('tasks', context) // ['Task 1', 'Task 3']

// TTL support
await kvStore.set('session:token', 'abc123', context, 3600) // Expires in 1 hour

// Batch operations
await kvStore.mset(new Map([
  ['key1', 'value1'],
  ['key2', 42],
  ['key3', true]
]), context)

const values = await kvStore.mget(['key1', 'key2', 'key3'], context)
```

### 4. Access Control

```typescript
// Set user roles
tenantManager.setUserRole('tenant-123', 'user-owner', 'owner')
tenantManager.setUserRole('tenant-123', 'user-admin', 'admin')
tenantManager.setUserRole('tenant-123', 'user-viewer', 'viewer')

// Owner/admin can do everything
const ownerContext = await tenantManager.getTenantContext('tenant-123', 'user-owner')
await kvStore.set('data', 'value', ownerContext) // ✅ Success

// Viewer can only read
const viewerContext = await tenantManager.getTenantContext('tenant-123', 'user-viewer')
await kvStore.get('data', viewerContext) // ✅ Success
await kvStore.set('data', 'new', viewerContext) // ❌ Permission denied (403)

// Custom permissions
tenantManager.grantPermission('tenant-123', 'user-custom', 'write:kv')
tenantManager.grantPermission('tenant-123', 'user-custom', 'read:blob')
```

### 5. Quota Management

```typescript
// Check current usage
const usage = await tenantManager.getUsage('tenant-123')
console.log({
  blobStorage: `${usage.currentBlobStorageBytes} / ${usage.maxBlobStorageBytes}`,
  blobCount: `${usage.currentBlobCount} / ${usage.maxBlobCount}`,
  records: `${usage.currentRecords} / ${usage.maxRecords}`,
  dataSize: `${usage.currentDataSizeBytes} / ${usage.maxDataSizeBytes}`
})

// Update quotas
await tenantManager.updateQuota('tenant-123', {
  maxBlobStorageBytes: 2 * 1024 * 1024 * 1024, // Increase to 2GB
  maxRecords: 200000 // Increase to 200k records
})

// Quota exceeded handling
try {
  await tenantStorage.upload('large-file.bin', hugeBuffer)
} catch (error) {
  if (error.code === 429) {
    console.error('Quota exceeded:', error.message)
  }
}
```

### 6. Multi-Tenant Patterns

#### Per-User Sandboxing
```typescript
function getUserStorage(userId: string) {
  return new TenantAwareBlobStorage(
    baseStorage,
    tenantManager,
    'app',
    userId
  )
}

const user1Storage = getUserStorage('user-1')
const user2Storage = getUserStorage('user-2')

// Isolated storage
await user1Storage.upload('avatar.jpg', data) // app/users/user-1/avatar.jpg
await user2Storage.upload('avatar.jpg', data) // app/users/user-2/avatar.jpg
```

#### Organization Hierarchy
```typescript
function getOrgStorage(orgId: string, teamId?: string) {
  const tenantId = teamId ? `${orgId}:${teamId}` : orgId
  return new TenantAwareBlobStorage(
    baseStorage,
    tenantManager,
    tenantId,
    'system'
  )
}

const orgStorage = getOrgStorage('acme-corp')
const teamStorage = getOrgStorage('acme-corp', 'engineering')
```

#### Feature-Based Isolation
```typescript
// Separate storage for different features
const documentsStorage = new TenantAwareBlobStorage(
  baseStorage,
  tenantManager,
  'tenant-123',
  'documents-service'
)

const backupsStorage = new TenantAwareBlobStorage(
  baseStorage,
  tenantManager,
  'tenant-123',
  'backup-service'
)
```

## C++ Implementation

The C++ implementation mirrors the TypeScript design:

### Headers

```cpp
// dbal/production/include/dbal/tenant_context.hpp
namespace dbal {
namespace tenant {

struct TenantIdentity {
  std::string tenantId;
  std::string userId;
  std::string role; // owner, admin, member, viewer
  std::set<std::string> permissions;
};

struct TenantQuota {
  // Blob storage quotas
  std::optional<size_t> maxBlobStorageBytes;
  std::optional<size_t> maxBlobCount;
  std::optional<size_t> maxBlobSizeBytes;
  
  // Structured data quotas
  std::optional<size_t> maxRecords;
  std::optional<size_t> maxDataSizeBytes;
  std::optional<size_t> maxListLength;
  
  // Current usage
  size_t currentBlobStorageBytes;
  size_t currentBlobCount;
  size_t currentRecords;
  size_t currentDataSizeBytes;
};

class TenantContext {
public:
  TenantContext(const TenantIdentity& identity, 
                const TenantQuota& quota,
                const std::string& ns);
  
  bool canRead(const std::string& resource) const;
  bool canWrite(const std::string& resource) const;
  bool canDelete(const std::string& resource) const;
  
  bool canUploadBlob(size_t sizeBytes) const;
  bool canCreateRecord() const;
  bool canAddToList(size_t additionalItems) const;
  
  const TenantIdentity& identity() const { return identity_; }
  TenantQuota& quota() { return quota_; }
  const std::string& namespace_() const { return namespace__; }

private:
  TenantIdentity identity_;
  TenantQuota quota_;
  std::string namespace__;
};

} // namespace tenant
} // namespace dbal
```

### Usage

```cpp
#include "dbal/tenant_context.hpp"
#include "dbal/blob_storage.hpp"
#include "dbal/kv_store.hpp"

using namespace dbal;

// Create tenant context
tenant::TenantIdentity identity{
  .tenantId = "tenant-123",
  .userId = "user-456",
  .role = "admin",
  .permissions = {"read:*", "write:*", "delete:*"}
};

tenant::TenantQuota quota{
  .maxBlobStorageBytes = 1024ULL * 1024 * 1024, // 1GB
  .maxBlobCount = 10000,
  .currentBlobStorageBytes = 0,
  .currentBlobCount = 0
};

tenant::TenantContext context(identity, quota, "tenants/tenant-123/");

// Use with blob storage
blob::MemoryStorage baseStorage;
blob::TenantAwareBlobStorage tenantStorage(&baseStorage, context);

std::vector<char> data = {'H', 'e', 'l', 'l', 'o'};
auto result = tenantStorage.upload("test.txt", data, {});

if (result.isOk()) {
  std::cout << "Uploaded successfully\n";
}
```

## Security Considerations

1. **Path Traversal Prevention**: Namespace scoping prevents accessing other tenants' data
2. **Permission Checks**: All operations check permissions before execution
3. **Quota Enforcement**: Hard limits prevent resource abuse
4. **Immutable Context**: Tenant context cannot be modified during operations
5. **Audit Trail**: All operations can be logged with tenant/user info

## Performance

- **In-Memory**: O(1) for get/set operations
- **Blob Storage**: Same as underlying storage (S3/filesystem)
- **Quota Checks**: O(1) constant-time checks
- **Permission Checks**: O(1) for role-based, O(n) for specific permissions (n = permission count)

## Testing

```typescript
import { describe, it, expect } from 'vitest'

describe('Multi-Tenant System', () => {
  it('isolates tenants', async () => {
    const manager = new InMemoryTenantManager()
    const kvStore = new InMemoryKVStore()
    
    await manager.createTenant('tenant-1')
    await manager.createTenant('tenant-2')
    
    const ctx1 = await manager.getTenantContext('tenant-1', 'user-1')
    const ctx2 = await manager.getTenantContext('tenant-2', 'user-2')
    
    await kvStore.set('data', 'value-1', ctx1)
    await kvStore.set('data', 'value-2', ctx2)
    
    expect(await kvStore.get('data', ctx1)).toBe('value-1')
    expect(await kvStore.get('data', ctx2)).toBe('value-2')
  })
  
  it('enforces quotas', async () => {
    const manager = new InMemoryTenantManager()
    await manager.createTenant('tenant-1', { maxRecords: 2 })
    
    const kvStore = new InMemoryKVStore()
    const ctx = await manager.getTenantContext('tenant-1', 'user-1')
    
    await kvStore.set('key1', 'val1', ctx) // OK
    await kvStore.set('key2', 'val2', ctx) // OK
    await expect(kvStore.set('key3', 'val3', ctx)).rejects.toThrow('Quota exceeded')
  })
  
  it('enforces permissions', async () => {
    const manager = new InMemoryTenantManager()
    await manager.createTenant('tenant-1')
    manager.setUserRole('tenant-1', 'viewer', 'viewer')
    
    const kvStore = new InMemoryKVStore()
    const ctx = await manager.getTenantContext('tenant-1', 'viewer')
    
    await kvStore.set('data', 'value', ctx) // Should be OK with member role
    // But viewer role should fail:
    manager.setUserRole('tenant-1', 'viewer', 'viewer')
    const viewerCtx = await manager.getTenantContext('tenant-1', 'viewer')
    await expect(kvStore.set('data', 'new', viewerCtx)).rejects.toThrow('Permission denied')
  })
})
```

## Migration Path

### Existing Applications

1. **Add tenant context**: Inject tenant/user info into all operations
2. **Wrap storage**: Use TenantAwareBlobStorage wrapper
3. **Set quotas**: Configure appropriate limits for each tenant
4. **Test isolation**: Verify data separation between tenants

### Production Deployment

1. **Gradual rollout**: Enable for new tenants first
2. **Monitor usage**: Track quota consumption
3. **Adjust limits**: Tune quotas based on actual usage
4. **Audit access**: Log all permission denials

## Future Enhancements

- [ ] Database persistence for tenant manager
- [ ] Rate limiting per tenant
- [ ] Audit logging
- [ ] Tenant analytics and reporting
- [ ] Automatic quota scaling
- [ ] Cost allocation per tenant
- [ ] Backup/restore per tenant
- [ ] Data export per tenant (GDPR compliance)
