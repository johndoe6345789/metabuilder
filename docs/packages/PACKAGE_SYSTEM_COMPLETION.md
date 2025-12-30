# 📦 Package System Completion Specification

**Document Date:** December 25, 2025  
**Status:** Currently 70% complete  
**Target:** 100% with asset management, import/export, and pre-built packages

---

## 📊 Current State Assessment

### ✅ What's Working

1. **Basic Package Structure** (100%)
   - Package folders in `/packages`
   - Seed data loading
   - Component registration
   - Script export

2. **Package Loader** (100%)
   - `initializePackageSystem()`
   - `buildPackageRegistry()`
   - `exportAllPackagesForSeed()`
   - Metadata parsing

3. **Seed Data Format** (100%)
   - metadata.json
   - components.json
   - scripts/ folder structure
   - Index exports

---

### ⚠️ What's Missing

1. **Asset Management** (0%)
   - No asset storage
   - No asset handling
   - No asset references
   - No upload/download

2. **Import/Export UI** (0%)
   - No export dialog
   - No import dialog
   - No package selection UI
   - No progress tracking

3. **Pre-built Packages** (0%)
   - No example packages
   - No marketplace
   - No one-click install
   - No version management

4. **Package Publishing** (20%)
   - No ZIP generation
   - No manifest validation
   - No dependency resolution
   - No version control

---

## 🎯 Completion Plan

### Phase 1: Asset System (Weeks 4-5, 12 hours)

#### 1A: Database Schema
**Effort:** 1 hour

```prisma
// prisma/schema.prisma

model Package {
  id            String @id @default(cuid())
  name          String @unique
  version       String @default("1.0.0")
  description   String?
  tenantId      String
  
  // Package metadata
  author        String?
  license       String?
  dependencies  Json   // Package dependencies
  exports       Json   // What this package exports
  
  // Relations
  assets        Asset[]
  components    PackageComponent[]
  scripts       PackageScript[]
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([name, tenantId])
}

model Asset {
  id            String @id @default(cuid())
  packageId     String
  package       Package @relation(fields: [packageId], references: [id])
  
  // Asset metadata
  name          String      // 'logo', 'icon-close', 'font-regular', etc
  type          String      // 'image' | 'icon' | 'font' | 'config' | 'document'
  mimeType      String      // 'image/png', 'font/woff2', etc
  
  // Content storage
  content       Bytes       // Base64 encoded content
  encoding      String @default("base64")
  size          Int         // File size in bytes
  
  // Metadata
  metadata      Json?       // Custom metadata per asset type
  description   String?
  tags          String[]
  
  // Access control
  isPublic      Boolean @default(false)
  tenantId      String
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([packageId, name])
  @@index([packageId])
  @@index([type])
}

model PackageComponent {
  id            String @id @default(cuid())
  packageId     String
  package       Package @relation(fields: [packageId], references: [id])
  
  name          String
  path          String      // Where file is located
  preview       String?     // Storybook/preview HTML
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([packageId, name])
}

model PackageScript {
  id            String @id @default(cuid())
  packageId     String
  package       Package @relation(fields: [packageId], references: [id])
  
  name          String
  path          String      // scripts/category/name.lua
  content       String
  description   String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([packageId, name])
}
```

**Implementation Steps:**
1. Add schema above to `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run migration: `npm run db:migrate -- --name add_packages_assets`

---

#### 1B: Asset Upload Handler
**Effort:** 2 hours

```typescript
// src/app/api/packages/[packageId]/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { Database } from '@/lib/database';

const MAX_ASSET_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'font/woff2',
  'font/woff',
  'application/json',
];

export async function POST(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  const user = await authenticateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assetName = formData.get('name') as string;
    const assetType = formData.get('type') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_ASSET_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 10 MB)' },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 415 }
      );
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Save to database
    const asset = await Database.createAsset({
      packageId: params.packageId,
      name: assetName,
      type: assetType,
      mimeType: file.type,
      content: base64,
      size: file.size,
      tenantId: user.tenantId,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Asset upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  const user = await authenticateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const assets = await Database.getAssets({
    packageId: params.packageId,
    tenantId: user.tenantId,
  });

  return NextResponse.json(assets);
}
```

**Features:**
- File size validation (max 10 MB)
- MIME type validation
- Base64 encoding
- Database persistence
- Tenant isolation
- Error handling

---

#### 1C: Asset Reference System
**Effort:** 1.5 hours

```typescript
// src/lib/asset-resolver.ts
import { Database } from './database';

interface AssetReference {
  package: string;
  asset: string;
  // Format: "@package-name/asset-name"
}

export async function resolveAssetReference(
  reference: string,
  tenantId: string
): Promise<string | null> {
  // Parse reference: "@package-name/asset-name"
  const match = reference.match(/@([^/]+)\/(.+)/);
  if (!match) {
    return null;
  }

  const [, packageName, assetName] = match;

  // Look up in database
  const asset = await Database.getAsset(
    {
      packageName,
      assetName,
    },
    tenantId
  );

  if (!asset) {
    return null;
  }

  // Return data URL or CDN URL
  return `data:${asset.mimeType};base64,${asset.content}`;
}

export async function resolveAssetReferences(
  obj: Record<string, any>,
  tenantId: string
): Promise<Record<string, any>> {
  const resolved = { ...obj };

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('@')) {
      resolved[key] = await resolveAssetReference(value, tenantId);
    }
  }

  return resolved;
}
```

**Usage in Components:**
```typescript
export function ComponentUsingAssets() {
  const assetUrl = useAssetReference('@dashboard/logo-icon');

  return <img src={assetUrl} alt="Logo" />;
}

// Custom hook
export function useAssetReference(reference: string) {
  const { user } = useAuth();
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || !user) return;

    resolveAssetReference(reference, user.tenantId).then(setAssetUrl);
  }, [reference, user?.tenantId]);

  return assetUrl;
}
```

---

#### 1D: Asset Gallery Component
**Effort:** 2 hours

```typescript
// src/components/AssetGallery.tsx (95 LOC)
import { useState, useCallback } from 'react';
import { useAssets } from '@/hooks/useAssets';

interface AssetGalleryProps {
  packageId: string;
  onSelectAsset: (assetName: string) => void;
}

export function AssetGallery({
  packageId,
  onSelectAsset,
}: AssetGalleryProps) {
  const { assets, upload, delete: deleteAsset } = useAssets(packageId);
  const [filter, setFilter] = useState<string>('');

  const filteredAssets = assets?.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUpload = useCallback(
    async (file: File) => {
      await upload({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        type: file.type.startsWith('image') ? 'image' : 'other',
      });
    },
    [upload]
  );

  return (
    <div className="asset-gallery">
      <div className="toolbar">
        <input
          type="file"
          onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          accept="image/*,.woff2,.woff,application/json"
        />
        <input
          placeholder="Filter assets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid">
        {filteredAssets?.map((asset) => (
          <div key={asset.id} className="asset-item">
            {asset.type === 'image' && (
              <img
                src={`data:${asset.mimeType};base64,${asset.content}`}
                alt={asset.name}
              />
            )}
            <p>{asset.name}</p>
            <div className="actions">
              <button onClick={() => onSelectAsset(asset.name)}>
                Select
              </button>
              <button onClick={() => deleteAsset(asset.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Hook:**
```typescript
// src/hooks/useAssets.ts
export function useAssets(packageId: string) {
  const { user } = useAuth();
  const { data: assets, refetch } = useQuery({
    queryKey: ['assets', packageId],
    queryFn: () =>
      fetch(
        `/api/packages/${packageId}/assets`
      ).then((r) => r.json()),
  });

  const upload = useCallback(
    async (data: { file: File; name: string; type: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('type', data.type);

      await fetch(`/api/packages/${packageId}/assets`, {
        method: 'POST',
        body: formData,
      });

      refetch();
    },
    [packageId, refetch]
  );

  const delete_ = useCallback(
    async (assetId: string) => {
      await fetch(`/api/packages/${packageId}/assets/${assetId}`, {
        method: 'DELETE',
      });
      refetch();
    },
    [packageId, refetch]
  );

  return { assets, upload, delete: delete_ };
}
```

---

#### 1E: Testing
**Effort:** 1 hour

```typescript
// src/app/api/packages/[packageId]/assets/route.test.ts
describe('Asset API', () => {
  it('should upload image asset', async () => {
    const file = new File(['...'], 'logo.png', { type: 'image/png' });
    // Test upload
  });

  it('should reject oversized files', async () => {
    // Test size validation
  });

  it('should list assets for package', async () => {
    // Test GET endpoint
  });

  it('should enforce tenant isolation', async () => {
    // Test multi-tenancy
  });
});
```

---

### Phase 2: Import/Export UI (Weeks 5-6, 14 hours)

#### 2A: Export Dialog Component
**Effort:** 3 hours

```typescript
// src/components/PackageExportDialog.tsx (85 LOC)
import { useState, useCallback } from 'react';
import { useExportPackage } from '@/hooks/useExportPackage';

interface PackageExportDialogProps {
  packageId: string;
  onClose: () => void;
}

export function PackageExportDialog({
  packageId,
  onClose,
}: PackageExportDialogProps) {
  const { export: exportPackage, isLoading } = useExportPackage();
  const [options, setOptions] = useState({
    includeComponents: true,
    includeScripts: true,
    includeAssets: true,
    includeSchema: true,
    version: '1.0.0',
  });

  const handleExport = useCallback(async () => {
    const result = await exportPackage({
      packageId,
      options,
    });

    if (result) {
      // Trigger download
      downloadFile(result, `package-${packageId}.zip`);
      onClose();
    }
  }, [packageId, options, exportPackage, onClose]);

  return (
    <div className="dialog">
      <h2>Export Package</h2>

      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={options.includeComponents}
            onChange={(e) =>
              setOptions({
                ...options,
                includeComponents: e.target.checked,
              })
            }
          />
          Include Components
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.includeScripts}
            onChange={(e) =>
              setOptions({
                ...options,
                includeScripts: e.target.checked,
              })
            }
          />
          Include Lua Scripts
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.includeAssets}
            onChange={(e) =>
              setOptions({
                ...options,
                includeAssets: e.target.checked,
              })
            }
          />
          Include Assets
        </label>

        <label>
          Version:
          <input
            type="text"
            value={options.version}
            onChange={(e) =>
              setOptions({ ...options, version: e.target.value })
            }
          />
        </label>
      </div>

      <div className="actions">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={handleExport}
          disabled={isLoading}
        >
          {isLoading ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

#### 2B: Import Dialog Component
**Effort:** 3.5 hours

```typescript
// src/components/PackageImportDialog.tsx (110 LOC)
import { useState, useCallback } from 'react';
import { useImportPackage } from '@/hooks/useImportPackage';

interface ImportPreview {
  name: string;
  components: number;
  scripts: number;
  assets: number;
}

export function PackageImportDialog() {
  const { import: importPackage, isLoading } = useImportPackage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [conflictResolution, setConflictResolution] = useState<
    'overwrite' | 'skip'
  >('skip');

  const handleFileSelect = useCallback(async (file: File) => {
    setFile(file);

    // Parse ZIP and show preview
    const preview = await parsePackageZip(file);
    setPreview(preview);

    // Check for conflicts
    const conflicts = await checkConflicts(preview);
    setConflicts(conflicts);
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    const result = await importPackage({
      file,
      conflictResolution,
    });

    if (result.success) {
      // Show success message
      // Close dialog
    } else {
      // Show error
    }
  }, [file, conflictResolution, importPackage]);

  return (
    <div className="dialog">
      <h2>Import Package</h2>

      {!file ? (
        <div className="upload-area">
          <input
            type="file"
            accept=".zip"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          />
          <p>or drag and drop</p>
        </div>
      ) : (
        <>
          <div className="preview">
            <h3>Package Contents</h3>
            <div className="details">
              <p>Name: {preview?.name}</p>
              <p>Components: {preview?.components}</p>
              <p>Scripts: {preview?.scripts}</p>
              <p>Assets: {preview?.assets}</p>
            </div>

            {conflicts.length > 0 && (
              <div className="conflicts">
                <h4>Conflicts Found</h4>
                <select
                  value={conflictResolution}
                  onChange={(e) =>
                    setConflictResolution(
                      e.target.value as 'overwrite' | 'skip'
                    )
                  }
                >
                  <option value="skip">Skip existing</option>
                  <option value="overwrite">Overwrite</option>
                </select>
                <ul>
                  {conflicts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="actions">
            <button onClick={() => setFile(null)}>Choose Another</button>
            <button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

async function parsePackageZip(file: File): Promise<ImportPreview> {
  // Use JSZip to parse package structure
  // Return preview info
  return {
    name: 'package-name',
    components: 5,
    scripts: 3,
    assets: 12,
  };
}

async function checkConflicts(preview: ImportPreview): Promise<string[]> {
  // Check if components/scripts already exist
  return ['existing-component', 'existing-script'];
}
```

---

#### 2C: Export/Import API Handlers
**Effort:** 3 hours

```typescript
// src/app/api/packages/[packageId]/export/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  const user = await authenticateUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const { options } = body;

  try {
    // Load package data
    const pkg = await Database.getPackage(params.packageId, user.tenantId);
    if (!pkg) {
      return new Response('Package not found', { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add metadata
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: pkg.name,
          version: options.version || pkg.version,
          description: pkg.description,
          author: pkg.author,
        },
        null,
        2
      )
    );

    // Add components
    if (options.includeComponents) {
      const components = await Database.getPackageComponents(
        params.packageId
      );
      zip.folder('components');
      components.forEach((c) => {
        zip.file(`components/${c.name}.tsx`, c.content);
      });
    }

    // Add scripts
    if (options.includeScripts) {
      const scripts = await Database.getPackageScripts(params.packageId);
      zip.folder('scripts');
      scripts.forEach((s) => {
        zip.file(`scripts/${s.name}.lua`, s.content);
      });
    }

    // Add assets
    if (options.includeAssets) {
      const assets = await Database.getAssets({
        packageId: params.packageId,
      });
      zip.folder('assets');
      assets.forEach((a) => {
        zip.file(`assets/${a.name}`, Buffer.from(a.content, 'base64'));
      });
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="package-${pkg.name}.zip"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response('Export failed', { status: 500 });
  }
}
```

```typescript
// src/app/api/packages/import/route.ts
export async function POST(request: NextRequest) {
  const user = await authenticateUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conflictResolution = formData.get('conflictResolution') as string;

    // Parse ZIP
    const zip = new JSZip();
    const content = await file.arrayBuffer();
    await zip.loadAsync(content);

    // Read package.json
    const pkgJson = await zip.file('package.json')?.async('string');
    const packageMetadata = JSON.parse(pkgJson || '{}');

    // Check if package exists
    const existingPkg = await Database.getPackageByName(
      packageMetadata.name,
      user.tenantId
    );

    if (existingPkg && conflictResolution === 'skip') {
      return new Response('Package already exists', { status: 409 });
    }

    // Create new package
    const pkg = await Database.createPackage(
      {
        name: packageMetadata.name,
        version: packageMetadata.version,
        description: packageMetadata.description,
        author: packageMetadata.author,
        tenantId: user.tenantId,
      }
    );

    // Import components
    const components = zip.folder('components');
    if (components) {
      for (const [filename, file] of Object.entries(components.files)) {
        if (!filename.includes('/')) {
          const content = await file.async('string');
          await Database.createPackageComponent({
            packageId: pkg.id,
            name: filename.replace('.tsx', ''),
            path: `components/${filename}`,
            content,
          });
        }
      }
    }

    // Similar for scripts and assets...

    return new Response(JSON.stringify({ success: true, package: pkg }));
  } catch (error) {
    console.error('Import error:', error);
    return new Response('Import failed', { status: 500 });
  }
}
```

---

#### 2D: Hooks for Export/Import
**Effort:** 1.5 hours

```typescript
// src/hooks/useExportPackage.ts
export function useExportPackage() {
  const [isLoading, setIsLoading] = useState(false);

  const export_ = useCallback(
    async (params: {
      packageId: string;
      options: ExportOptions;
    }): Promise<Blob | null> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/packages/${params.packageId}/export`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ options: params.options }),
          }
        );

        if (!response.ok) throw new Error('Export failed');

        return response.blob();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { export: export_, isLoading };
}

// src/hooks/useImportPackage.ts
export function useImportPackage() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const import_ = useCallback(
    async (params: {
      file: File;
      conflictResolution: 'overwrite' | 'skip';
    }) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', params.file);
        formData.append('conflictResolution', params.conflictResolution);

        const response = await fetch('/api/packages/import', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Import failed');

        // Invalidate package queries
        await queryClient.invalidateQueries({ queryKey: ['packages'] });

        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  return { import: import_, isLoading };
}
```

---

#### 2E: Testing
**Effort:** 2.5 hours

---

### Phase 3: Pre-built Packages (Weeks 6-7, 10 hours)

Each pre-built package should be a complete, production-ready module.

#### Package 1: DataGrid Package

```
packages/datagrid/
├── seed/
│   ├── metadata.json
│   ├── components.json
│   └── scripts/
│       ├── formatters.lua
│       ├── validators.lua
│       └── aggregations.lua
├── src/
│   ├── DataGrid.tsx (120 LOC)
│   ├─components/
│   │   ├── DataGridHeader.tsx (45 LOC)
│   │   ├── DataGridRow.tsx (55 LOC)
│   │   └── DataGridCell.tsx (30 LOC)
│   └── hooks/
│       ├── useDataGridState.ts (85 LOC)
│       └── useDataGridExport.ts (40 LOC)
└── README.md
```

**Features:**
- Column configuration (name, type, width, sortable, filterable)
- Sorting (single/multi)
- Filtering (by column values)
- Pagination
- Export to CSV
- Themeable

**Effort:** 4 hours

---

#### Package 2: FormBuilder Package

```
packages/form_builder/
├── seed/
│   ├── metadata.json
│   ├── components.json
│   └── scripts/
│       ├── validators.lua
│       ├── transforms.lua
│       └── calculations.lua
└── src/
    ├── FormBuilder.tsx (110 LOC)
    ├── Field Types
    │   ├── TextInput.tsx (30 LOC)
    │   ├── Checkbox.tsx (25 LOC)
    │   ├── Select.tsx (35 LOC)
    │   ├── DatePicker.tsx (45 LOC)
    │   └── FileUpload.tsx (40 LOC)
    └── hooks/
        └── useFormState.ts (95 LOC)
```

**Features:**
- 10+ field types
- Validation rules
- Conditional fields
- Multi-step forms
- Error messages
- Form submission

**Effort:** 4 hours

---

#### Package 3: ChartPackage

```
packages/charts/
├── seed/
│   ├── metadata.json
│   ├── components.json
│   └── scripts/
│       └── data-transforms.lua
└── src/
    ├── ChartLibrary.tsx (80 LOC)
    ├── Charts/
    │   ├── BarChart.tsx (60 LOC)
    │   ├── LineChart.tsx (60 LOC)
    │   ├── PieChart.tsx (55 LOC)
    │   └── AreaChart.tsx (65 LOC)
    └── hooks/
        └── useChartData.ts (50 LOC)
```

**Features:**
- Multiple chart types
- Real-time data binding
- Theming
- Export as image
- Interactive tooltips

**Effort:** 3 hours

---

#### Package 4: AuthPackage

```
packages/auth/
├── seed/
│   ├── metadata.json
│   └── components.json
└── src/
    ├── LoginPage.tsx (85 LOC)
    ├── SignupForm.tsx (90 LOC)
    ├── PasswordReset.tsx (70 LOC)
    └── hooks/
        └── useAuth.ts (50 LOC)
```

**Features:**
- Login form
- Signup form
- Password reset
- OAuth integration
- Email verification

**Effort:** 3 hours

---

#### Package 5: NotificationPackage

```
packages/notifications/
├── seed/
│   ├── metadata.json
│   └── components.json
└── src/
    ├── NotificationProvider.tsx (65 LOC)
    ├── ToastContainer.tsx (50 LOC)
    ├── NotificationCenter.tsx (85 LOC)
    └── hooks/
        └── useNotifications.ts (40 LOC)
```

**Features:**
- Toast notifications
- Notification center
- Email notifications
- Dismissal
- Auto-dismiss timeout

**Effort:** 2 hours

---

### Phase 4: Documentation

#### 4A: Package Development Guide
**Effort:** 3 hours

- How to structure a package
- Seed data format
- Registering components
- Adding Lua scripts
- Publishing packages

#### 4B: Asset System Guide
**Effort:** 2 hours

- Asset types
- Upload/download
- References
- Best practices

#### 4C: Import/Export Guide
**Effort:** 1.5 hours

- Export packages
- Import packages
- Conflict resolution
- Versioning

---

## 📊 Timeline Summary

| Phase | Task | Weeks | Hours |
|-------|------|-------|-------|
| 1 | Asset System | 4-5 | 12 |
| 2 | Import/Export | 5-6 | 14 |
| 3 | Pre-built Packages | 6-7 | 10 |
| 4 | Documentation | 7-8 | 6.5 |
| 5 | Testing | 8-9 | 10 |
| | **TOTAL** | **9 weeks** | **52.5 hours** |

---

## ✅ Completion Checklist

### Asset System
- [ ] Database schema created
- [ ] Asset upload API functional
- [ ] Asset resolver working
- [ ] Asset gallery component
- [ ] Tests passing (>90% coverage)

### Import/Export
- [ ] Export dialog component
- [ ] Import dialog component
- [ ] Export API handler
- [ ] Import API handler
- [ ] Conflict resolution
- [ ] Tests passing

### Pre-built Packages
- [ ] DataGrid package complete
- [ ] FormBuilder package complete
- [ ] ChartPackage complete
- [ ] AuthPackage complete
- [ ] NotificationPackage complete
- [ ] Each package documented
- [ ] Each package has examples

### Documentation
- [ ] Package development guide
- [ ] Asset system guide
- [ ] Import/export guide
- [ ] API documentation
- [ ] Examples for each feature

---

**Generated:** December 25, 2025  
**Next Review:** After Phase 3A completion
