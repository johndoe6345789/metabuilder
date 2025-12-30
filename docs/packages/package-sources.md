# Package Source System

The MetaBuilder package system supports loading packages from multiple sources:

- **Local packages**: Packages bundled with the application in `/packages/`
- **Remote packages**: Packages from a remote registry API
- **Git packages**: Packages from Git repositories (future support)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PackageSourceManager                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ LocalSource  │  │ RemoteSource │  │  GitSource   │          │
│  │  (priority 0)│  │  (priority 10│  │ (priority 20)│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────┬────────┘                   │
│                      ▼             ▼                            │
│              ┌─────────────────────────┐                        │
│              │    Merged Package Index │                        │
│              │  (conflict resolution)  │                        │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

- `NEXT_PUBLIC_ENABLE_REMOTE_PACKAGES=true` - Enable remote package sources
- `PACKAGE_REGISTRY_AUTH_TOKEN=xxx` - Authentication token for remote registry

### Programmatic Configuration

```typescript
import { 
  createPackageSourceManager,
  LocalPackageSource,
  RemotePackageSource 
} from '@/lib/packages/package-glue'

// Simple setup with local only
const manager = createPackageSourceManager()

// With remote source
const managerWithRemote = createPackageSourceManager({
  enableRemote: true,
  remoteUrl: 'https://registry.metabuilder.dev/api/v1',
  remoteAuthToken: 'your-token',
  conflictResolution: 'priority'
})

// Custom configuration
const customManager = new PackageSourceManager({
  conflictResolution: 'latest-version'
})
customManager.addSource(new LocalPackageSource())
customManager.addSource(new RemotePackageSource({
  id: 'custom-registry',
  name: 'Custom Registry',
  type: 'remote',
  url: 'https://custom.registry.com/api',
  priority: 5,
  enabled: true,
  authToken: 'token'
}))
```

## Conflict Resolution

When the same package exists in multiple sources, the system resolves conflicts using one of these strategies:

| Strategy | Description |
|----------|-------------|
| `priority` | Lower priority number wins (default) |
| `latest-version` | Highest semver version wins |
| `local-first` | Always prefer local packages |
| `remote-first` | Always prefer remote packages |

## Package Source Interface

All package sources implement:

```typescript
interface PackageSource {
  getConfig(): PackageSourceConfig
  fetchIndex(): Promise<PackageIndexEntry[]>
  loadPackage(packageId: string): Promise<PackageData | null>
  hasPackage(packageId: string): Promise<boolean>
  getVersions(packageId: string): Promise<string[]>
}
```

## API Endpoints

### GET /api/packages/index

Returns the local package index:

```json
{
  "packages": [
    {
      "packageId": "dashboard",
      "name": "Dashboard",
      "version": "1.0.0",
      "minLevel": 2,
      "dependencies": ["ui_core"]
    }
  ]
}
```

### Remote Registry API (Expected Format)

The remote registry should implement:

```
GET /api/v1/packages - List all packages
GET /api/v1/packages/:id - Get package details
GET /api/v1/packages/:id/versions - List versions
GET /api/v1/packages/search?q=query - Search packages
```

## Example Usage

```typescript
// Get merged package list
const packages = await manager.fetchMergedIndex()

// Load a specific package
const dashboard = await manager.loadPackage('dashboard')

// Check package availability
const exists = await manager.hasPackage('some-package')

// Get all versions across sources
const versions = await manager.getAllVersions('dashboard')
// Map { 'local' => ['1.0.0'], 'remote' => ['1.0.0', '1.1.0', '2.0.0'] }

// Load from specific source
const remotePkg = await manager.loadPackageFromSource('dashboard', 'remote')
```

## Permission Integration

Packages specify a `minLevel` that integrates with the 6-level permission system:

| Level | Name | Example Packages |
|-------|------|------------------|
| 1 | Public | ui_pages, landing components |
| 2 | User | dashboard, data_table |
| 3 | Moderator | forum_forge moderation tools |
| 4 | Admin | admin_dialog, system settings |
| 5 | God | advanced configuration |
| 6 | Supergod | ui_level6, tenant management |

```typescript
import { getAccessiblePackages } from '@/lib/packages/package-glue'

// Filter packages by user level
const userPackages = getAccessiblePackages(registry, userLevel)
```

## Caching

- Local source: Caches index and packages in memory
- Remote source: 5-minute cache with stale-while-revalidate
- Manager: Caches merged index until `clearAllCaches()` called

## Future Enhancements

1. **Git source**: Clone packages from Git repos
2. **S3 source**: Load from S3 buckets
3. **Package publishing**: Push local packages to registry
4. **Version pinning**: Lock package versions
5. **Dependency resolution**: Auto-resolve compatible versions
