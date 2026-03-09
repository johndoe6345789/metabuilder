# Tier 2-3 Cleanup & Remaining Migrations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete remaining component migrations, eliminate duplicate TSX/JSON implementations, fix orphaned registry entries, and achieve 95%+ JSON coverage.

**Architecture:** Three parallel work streams: (1) Fix registry inconsistencies, (2) Migrate remaining molecules/organisms with duplicates, (3) Delete legacy TSX files and consolidate to pure JSON.

**Tech Stack:** TypeScript, React, JSON Schema, Git, npm

---

## Work Stream 1: Registry Cleanup (5 tasks)

### Task 1: Fix Orphaned JSON Registry Entries

**Files:**
- Modify: `json-components-registry.json`

**Step 1: Add missing registry entries for orphaned JSON types**

The audit found 6 orphaned JSON files referencing types not in the registry. Add entries for:
- `single` (layout component)
- `kv` (data source component)
- `create` (action type)
- `delete` (action type)
- `navigate` (action type)
- `update` (action type)

Add to `json-components-registry.json`:
```json
{
  "type": "single",
  "source": "layouts",
  "jsonCompatible": true
},
{
  "type": "kv",
  "source": "dataSources",
  "jsonCompatible": true
},
{
  "type": "create",
  "source": "actions",
  "jsonCompatible": true
},
{
  "type": "delete",
  "source": "actions",
  "jsonCompatible": true
},
{
  "type": "navigate",
  "source": "actions",
  "jsonCompatible": true
},
{
  "type": "update",
  "source": "actions",
  "jsonCompatible": true
}
```

**Step 2: Verify registry is valid JSON**

Run: `jq empty json-components-registry.json && echo "✓ Registry is valid JSON"`
Expected: ✓ Registry is valid JSON

**Step 3: Run audit to verify orphaned entries are resolved**

Run: `npm run audit:json 2>&1 | grep "ORPHANED JSON" | wc -l`
Expected: 0 (no orphaned JSON errors)

**Step 4: Commit**

```bash
git add json-components-registry.json
git commit -m "fix: add missing registry entries for orphaned JSON types (single, kv, create, delete, navigate, update)"
```

---

### Task 2: Fix Broken Load Paths in Registry

**Files:**
- Modify: `json-components-registry.json`

**Step 1: Identify and fix broken load paths**

The audit found 5 components with broken load paths:
- Chart: "@/components/ui/chart/chart-container.tsx"
- ComponentTreeManager: "@/components/ComponentTreeManager"
- JSONUIShowcase: "@/components/JSONUIShowcase.tsx"
- Resizable: "@/components/ui/resizable.tsx"
- StyleDesigner: "@/components/StyleDesigner"

For each:
1. Check if the component exists elsewhere with a correct path
2. If exists: Update load.path to correct location
3. If doesn't exist: Remove load.path (let it resolve through JSON)
4. If it's a third-party component (Resizable): Mark `jsonCompatible: false`

```bash
# Check for these files
find src -name "chart*.tsx" -o -name "*ComponentTreeManager*" -o -name "*JSONUIShowcase*" -o -name "*resizable*" -o -name "*StyleDesigner*"
```

**Step 2: Remove load.path for components that should use JSON**

For each broken entry, if no TSX file exists, remove the `load` property entirely:

```json
{
  "type": "Chart",
  "source": "ui",
  "jsonCompatible": true
  // Remove: "load": { "path": "...", "export": "..." }
}
```

**Step 3: Run audit to verify broken paths are resolved**

Run: `npm run audit:json 2>&1 | grep "BROKEN LOAD PATH" | wc -l`
Expected: 0 (no broken path errors)

**Step 4: Commit**

```bash
git add json-components-registry.json
git commit -m "fix: resolve broken load paths in registry (remove paths for JSON-only components)"
```

---

### Task 3: Mark Third-Party Components in Registry

**Files:**
- Modify: `json-components-registry.json`

**Step 1: Identify components that are third-party (Shadcn, Recharts, etc.)**

Run: `grep -r "from '@/components/ui'" src --include="*.tsx" | head -20`

Add `jsonCompatible: false` for:
- Resizable (from Shadcn)
- Chart (from Recharts or custom wrapper)
- Any other third-party components

**Step 2: Update registry entries**

```json
{
  "type": "Resizable",
  "source": "ui",
  "jsonCompatible": false,
  "load": {
    "path": "@/components/ui/resizable",
    "export": "Resizable"
  }
}
```

**Step 3: Verify no build errors**

Run: `npm run build 2>&1 | grep -E "error|Error"`
Expected: No errors

**Step 4: Commit**

```bash
git add json-components-registry.json
git commit -m "fix: mark third-party components as not JSON-compatible in registry"
```

---

### Task 4: Consolidate Duplicate Implementation Warnings

**Files:**
- Modify: `json-components-registry.json`

**Step 1: Mark all 125 duplicate components for deletion**

For each duplicate TSX file with JSON equivalent, set `deleteOldTSX: true` flag:

```json
{
  "type": "AppHeader",
  "source": "organisms",
  "jsonCompatible": true,
  "deleteOldTSX": true
}
```

This documents which TSX files should be removed after JSON verification.

Run script to add flags:
```bash
# Find all duplicates and add deleteOldTSX flag
node -e "
const registry = require('./json-components-registry.json');
const fs = require('fs');

// Add to all organisms/molecules/atoms with JSON equivalents
const duplicates = [
  'AppHeader', 'EmptyCanvasState', 'NavigationMenu', 'PageHeader', 'SchemaCodeViewer',
  // ... (load full list from audit output)
];

duplicates.forEach(type => {
  const entry = registry.find(e => e.type === type);
  if (entry) entry.deleteOldTSX = true;
});

fs.writeFileSync('./json-components-registry.json', JSON.stringify(registry, null, 2));
"
```

**Step 2: Verify registry is still valid**

Run: `jq empty json-components-registry.json && echo "✓ Registry valid"`
Expected: ✓ Registry valid

**Step 3: Run audit to document status**

Run: `npm run audit:json 2>&1 | grep "DUPLICATE IMPLEMENTATION" | wc -l`
Expected: 125 (these will be deleted in next phase)

**Step 4: Commit**

```bash
git add json-components-registry.json
git commit -m "docs: mark 125 duplicate TSX files for deletion (JSON equivalents exist)"
```

---

### Task 5: Generate Updated Audit Report

**Files:**
- Create: `MIGRATION_STATUS_REPORT.md`

**Step 1: Run full audit and capture output**

Run: `npm run audit:json > audit-current.txt 2>&1`

**Step 2: Create summary report**

```bash
cat > MIGRATION_STATUS_REPORT.md << 'EOF'
# Migration Status Report - 2026-01-21

## Registry Cleanup Complete ✓

### Fixed Issues
- ✓ 6 orphaned JSON entries added to registry
- ✓ 5 broken load paths resolved
- ✓ 125 duplicates documented for deletion

### Current Status
- Total JSON components: 119
- Total TSX files: 538
- Registry entries: 347
- Duplicates marked for deletion: 125

### Next Phase
Delete 125 duplicate TSX files now that JSON equivalents are verified and properly registered.
EOF
```

**Step 3: Commit report**

```bash
git add MIGRATION_STATUS_REPORT.md audit-current.txt
git commit -m "docs: add migration status report after registry cleanup"
```

---

## Work Stream 2: Migrate Remaining Molecules & Organisms (3 tasks in parallel)

### Task 6: Migrate Remaining Molecules (AppBranding, CanvasRenderer, etc.)

**Files:**
- Create: `src/components/json-definitions/app-branding.json`
- Create: `src/lib/json-ui/interfaces/app-branding.ts`
- Modify: `src/lib/json-ui/json-components.ts`
- Modify: `src/lib/json-ui/hooks-registry.ts` (if stateful)
- Modify: `json-components-registry.json`

**Step 1: Research remaining molecules in src/components/molecules/**

Run: `ls -1 src/components/molecules/*.tsx | wc -l`

Identify 5-10 key molecules that are NOT yet migrated.

**Step 2: For each molecule: Create JSON definition**

Example for AppBranding:

```json
{
  "id": "app-branding-container",
  "type": "div",
  "props": {
    "className": "flex items-center gap-3"
  },
  "children": [
    {
      "id": "branding-logo",
      "type": "img",
      "bindings": {
        "src": { "source": "props.logoSrc" },
        "alt": { "source": "props.logoAlt" },
        "className": "h-8 w-8"
      }
    },
    {
      "id": "branding-text",
      "type": "span",
      "bindings": {
        "children": { "source": "props.appName" },
        "className": "font-semibold text-lg"
      }
    }
  ]
}
```

**Step 3: Create interface file**

```typescript
// src/lib/json-ui/interfaces/app-branding.ts
export interface AppBrandingProps {
  logoSrc: string
  logoAlt?: string
  appName: string
}
```

**Step 4: Export from json-components.ts**

```typescript
import appBrandingDef from '@/components/json-definitions/app-branding.json'
export const AppBranding = createJsonComponent<AppBrandingProps>(appBrandingDef)
```

**Step 5: Update registry**

```json
{
  "type": "AppBranding",
  "source": "molecules",
  "jsonCompatible": true,
  "deleteOldTSX": true
}
```

**Step 6: Build and verify**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 7: Commit**

```bash
git add src/components/json-definitions/app-branding.json src/lib/json-ui/interfaces/app-branding.ts src/lib/json-ui/json-components.ts json-components-registry.json
git commit -m "feat: migrate AppBranding molecule to JSON"
```

Repeat for 5-10 remaining molecules in parallel batches.

---

### Task 7: Migrate Remaining Organisms (Schema Viewers, Canvas Components, etc.)

**Files:**
- Create: `src/components/json-definitions/schema-code-viewer.json`
- Create: `src/lib/json-ui/interfaces/schema-code-viewer.ts`
- Modify: `src/lib/json-ui/json-components.ts`
- Modify: `src/lib/json-ui/hooks-registry.ts` (for stateful organisms)
- Modify: `json-components-registry.json`

**Step 1: Identify 3-5 key organisms to migrate**

From audit: SchemaCodeViewer, SchemaEditorLayout, CanvasRenderer, etc.

**Step 2: Create JSON definitions with hook integration**

For organisms with complex state (SchemaEditorLayout):

```typescript
// Create hook
export const useSchemaEditorLayout = () => {
  const [activePanel, setActivePanel] = useState('code')
  const [schema, setSchema] = useState({})

  return {
    activePanel,
    setActivePanel,
    schema,
    setSchema
  }
}

// Register in hooks-registry.ts
hooksRegistry['useSchemaEditorLayout'] = useSchemaEditorLayout

// Use in JSON
export const SchemaEditorLayout = createJsonComponentWithHooks<Props>(
  schemaEditorLayoutDef,
  {
    hooks: {
      editor: { hookName: 'useSchemaEditorLayout', args: () => [] }
    }
  }
)
```

**Step 3: Create interface files**

```typescript
export interface SchemaCodeViewerProps {
  code: string
  language?: string
  readonly?: boolean
}
```

**Step 4: Update registry and build**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 5: Commit each organism**

```bash
git commit -m "feat: migrate SchemaCodeViewer to JSON with hook support"
```

---

### Task 8: Consolidate and Verify All Exports

**Files:**
- Modify: `src/lib/json-ui/json-components.ts`
- Modify: `src/lib/json-ui/interfaces/index.ts`
- Verify: All exports match registry

**Step 1: Run type check**

Run: `npm run components:generate-types 2>&1`
Expected: Successful type generation

**Step 2: Verify all registry entries are exported**

Run: `node -e "const reg = require('./json-components-registry.json'); console.log('Total entries:', reg.length); console.log('JSON-compatible:', reg.filter(e => e.jsonCompatible).length)"`

**Step 3: Check for missing exports**

```bash
# Compare registry entries against actual exports in json-components.ts
node scripts/verify-exports.ts
```

**Step 4: Build and verify**

Run: `npm run build 2>&1 | grep -E "error|✓"`
Expected: ✓ built in X.XXs (no errors)

**Step 5: Commit**

```bash
git commit -m "fix: verify all JSON-compatible components are exported and registered"
```

---

## Work Stream 3: Delete Legacy TSX Files (4 tasks)

### Task 9: Delete 125 Duplicate TSX Files - Batch 1

**Files:**
- Delete: 30-40 TSX files from src/components/atoms/ and src/components/molecules/

**Step 1: Generate deletion script**

```bash
cat > scripts/delete-duplicates-batch-1.sh << 'EOF'
#!/bin/bash

# Delete atoms batch 1 (marked as deleted in latest commit)
rm -f src/components/atoms/ActionCard.tsx
rm -f src/components/atoms/AppLogo.tsx
rm -f src/components/atoms/BindingIndicator.tsx
rm -f src/components/atoms/Breadcrumb.tsx
rm -f src/components/atoms/Calendar.tsx
# ... etc for 30-40 files

echo "✓ Deleted 30 TSX files (atoms batch 1)"
EOF
chmod +x scripts/delete-duplicates-batch-1.sh
```

**Step 2: Run deletion script**

Run: `bash scripts/delete-duplicates-batch-1.sh`

**Step 3: Verify deletions with git**

Run: `git status | grep "deleted:" | wc -l`
Expected: ~30

**Step 4: Build to verify no import errors**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: delete 30 duplicate TSX atoms (JSON equivalents exist)"
```

---

### Task 10: Delete 125 Duplicate TSX Files - Batch 2

**Files:**
- Delete: 30-40 TSX files from src/components/molecules/ and src/components/organisms/

**Step 1: Generate and run deletion script**

```bash
bash scripts/delete-duplicates-batch-2.sh
```

**Step 2: Verify and build**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 3: Commit**

```bash
git commit -m "refactor: delete 30 duplicate TSX molecules and organisms (JSON equivalents exist)"
```

---

### Task 11: Delete Remaining TSX Files - Batch 3

**Files:**
- Delete: ~40-50 remaining duplicate TSX files

**Step 1: Run final deletion batch**

```bash
bash scripts/delete-duplicates-batch-3.sh
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 3: Final audit**

Run: `npm run audit:json 2>&1 | grep "DUPLICATE IMPLEMENTATION" | wc -l`
Expected: 0 (all duplicates removed)

**Step 4: Commit**

```bash
git commit -m "refactor: delete final batch of duplicate TSX files - 95% JSON migration complete"
```

---

### Task 12: Update Index Files for Remaining Components

**Files:**
- Modify: `src/components/atoms/index.ts`
- Modify: `src/components/molecules/index.ts`
- Modify: `src/components/organisms/index.ts`

**Step 1: Verify remaining TSX exports**

Run: `ls -1 src/components/atoms/*.tsx | grep -v json-ui`

Only remaining TSX files should be those NOT marked for JSON conversion (framework providers, complex integrations, etc.)

**Step 2: Update index files to only export non-JSON components**

```typescript
// src/components/atoms/index.ts - only export non-JSON atoms
export { SomeFrameworkComponent } from './SomeFrameworkComponent'
// ... remove all that have JSON equivalents
```

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -5`
Expected: ✓ built in X.XXs

**Step 4: Run audit**

Run: `npm run audit:json`
Expected: 0 errors, 0 duplicate warnings, only framework providers remain

**Step 5: Commit**

```bash
git commit -m "fix: update component index files after TSX cleanup"
```

---

## Final Verification (1 task)

### Task 13: Run Full Test Suite and Final Audit

**Files:**
- Create: `FINAL_MIGRATION_REPORT.md`

**Step 1: Run build**

Run: `npm run build 2>&1 | tail -10`
Expected: ✓ built in X.XXs (no errors)

**Step 2: Run full audit**

Run: `npm run audit:json > final-audit.txt 2>&1`

**Step 3: Verify migration targets met**

```bash
node -e "
const fs = require('fs');
const registry = require('./json-components-registry.json');

const stats = {
  total: registry.length,
  jsonCompatible: registry.filter(e => e.jsonCompatible).length,
  coverage: (registry.filter(e => e.jsonCompatible).length / registry.length * 100).toFixed(1)
};

console.log('Migration Coverage:', stats.coverage + '%');
console.log('Total Components:', stats.total);
console.log('JSON Components:', stats.jsonCompatible);
"
```

Expected: Coverage ≥ 95%

**Step 4: Create final report**

```markdown
# Final Migration Report - 2026-01-21

## Migration Complete ✓

### Statistics
- Total components migrated: 150+
- JSON compatibility: 95%+
- Registry cleaned: 11 errors fixed
- Duplicate TSX files deleted: 125
- Build status: PASSING

### Components by Type
- Atoms: ~85% migrated
- Molecules: ~80% migrated
- Organisms: ~85% migrated
- Framework providers: Kept as TSX (not JSON-renderable)

### Key Achievements
1. Eliminated 125 duplicate implementations
2. Fixed all registry inconsistencies
3. Established scalable JSON migration patterns
4. Achieved 95%+ JSON component coverage
5. Zero build failures or regressions

### Remaining Work
- Future phases can focus on remaining 5% framework-specific components
- Additional optimizations possible (code splitting, chunking improvements)
```

**Step 5: Commit final report**

```bash
git add FINAL_MIGRATION_REPORT.md final-audit.txt
git commit -m "docs: add final migration report - 95%+ JSON coverage achieved"
```

---

## Summary

This plan represents three parallel work streams over 13 focused tasks:
1. **Registry Cleanup** (5 tasks): Fix inconsistencies, mark duplicates, generate reports
2. **Component Migrations** (3 tasks): Migrate remaining molecules/organisms in parallel
3. **Cleanup & Verification** (4 tasks): Delete duplicate TSX, update indexes, final audit

**Expected Outcomes:**
- ✓ 0 registry errors
- ✓ 95%+ JSON component coverage
- ✓ 125 duplicate TSX files deleted
- ✓ All imports consolidated through JSON architecture
- ✓ Build passing with no errors
- ✓ Clear foundation for future migrations

**Execution Model:** Parallel subagents on independent work streams + periodic consolidation commits.
