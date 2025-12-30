# Dependency Cleanup Plan

**Created:** 2025-12-30
**Status:** Planning Phase
**Goal:** Remove unnecessary dependencies from package.json

---

## Current Dependencies Analysis

### MUI Dependencies (TO REMOVE)

**Location:** `frontends/nextjs/package.json`

```json
"@emotion/react": "^11.14.0",           // MUI peer dependency
"@emotion/styled": "^11.14.1",          // MUI peer dependency
"@mui/icons-material": "^7.3.6",        // ~500KB - Replace with fakemui icons
"@mui/material": "^7.3.6",              // ~1MB - Replace with fakemui
"@mui/x-data-grid": "^8.23.0",          // Replace with custom table
"@mui/x-date-pickers": "^8.23.0",       // Replace with native date input
```

**Total Size:** ~2-3 MB
**Status:** ❌ Ready to remove after migration complete

---

## Dependencies to Keep

### Essential Next.js & React
```json
"next": "16.1.1",                       // ✅ Core framework
"react": "19.2.3",                      // ✅ Core library
"react-dom": "19.2.3",                  // ✅ Core library
```

### Icons
```json
"@phosphor-icons/react": "^2.1.10",     // ❌ Remove - Using fakemui custom icons
```

**✅ DECISION:** Full fakemui custom SVG icon system
**Action:** Remove @phosphor-icons/react after icon migration complete

### Form Handling
```json
"@hookform/resolvers": "^5.2.2",        // ✅ Keep - Zod integration
"react-hook-form": "^7.69.0",           // ✅ Keep - Form state management
"zod": "^4.2.1",                        // ✅ Keep - Schema validation
```

### Data Fetching & State
```json
"@tanstack/react-query": "^5.90.12",    // ✅ Keep - Server state
```

### Database
```json
"@prisma/client": "^7.2.0",             // ✅ Keep - Database ORM
"@prisma/adapter-better-sqlite3": "^7.2.0", // ✅ Keep - SQLite adapter
"better-sqlite3": "^12.5.0",            // ✅ Keep - SQLite driver
```

### Code Editor
```json
"@monaco-editor/react": "^4.7.0",       // ✅ Keep - Code editor
```

### Utilities
```json
"date-fns": "^4.1.0",                   // ✅ Keep - Date utilities
"marked": "^17.0.1",                    // ✅ Keep - Markdown parsing
"uuid": "^13.0.0",                      // ✅ Keep - UUID generation
"jszip": "^3.10.1",                     // ✅ Keep - ZIP handling
```

### Animation & Visualization
```json
"motion": "^12.6.2",                    // ✅ Keep - Animation library
"recharts": "^3.6.0",                   // ✅ Keep - Charts
"d3": "^7.9.0",                         // ✅ Keep - Data visualization
"three": "^0.182.0",                    // ✅ Keep - 3D graphics
```

### Lua Integration
```json
"fengari-web": "^0.1.4",                // ✅ Keep - Lua in browser
"fengari-interop": "^0.1.4",            // ✅ Keep - Lua/JS interop
```

### AWS S3
```json
"@aws-sdk/client-s3": "^3.958.0",       // ✅ Keep - S3 client
"@aws-sdk/lib-storage": "^3.958.0",     // ✅ Keep - Multipart upload
"@aws-sdk/s3-request-presigner": "^3.958.0", // ✅ Keep - Presigned URLs
```

### GitHub Integration
```json
"@octokit/core": "^7.0.6",              // ✅ Keep - GitHub API
"octokit": "^5.0.5",                    // ✅ Keep - GitHub SDK
"@github/spark": ">=0.43.1 <1",         // ⚠️  Evaluate - What is this?
```

**Action Needed:** Verify @github/spark usage

### Error Handling & Notifications
```json
"react-error-boundary": "^6.0.0",       // ✅ Keep - Error boundaries
"sonner": "^2.0.7",                     // ✅ Keep - Toast notifications
```

### Misc
```json
"@next/third-parties": "^16.1.1",       // ⚠️  Evaluate - Scripts loader
"server-only": "^0.0.1",                // ✅ Keep - Server-only marker
"sharp": "^0.34.5",                     // ✅ Keep - Image optimization
```

---

## Removal Plan

### Phase 1: Immediate Removal (After fakemui complete)

**Remove:**
- `@mui/material` ^7.3.6
- `@mui/icons-material` ^7.3.6
- `@emotion/react` ^11.14.0
- `@emotion/styled` ^11.14.1

**Bundle Size Savings:** ~1.5-2 MB

**Prerequisites:**
- ✅ All MUI components migrated to fakemui
- ✅ All MUI icons replaced with fakemui icons
- ✅ Theme system migrated to CSS variables
- ✅ CssBaseline replaced with fakemui reset

### Phase 2: Advanced Components (After Lua packages)

**Remove:**
- `@mui/x-data-grid` ^8.23.0
- `@mui/x-date-pickers` ^8.23.0

**Bundle Size Savings:** ~500 KB

**Prerequisites:**
- ✅ DataGrid replaced with fakemui Table or Lua package
- ✅ DatePickers replaced with native HTML5 or Lua package

### Phase 3: Icon Consolidation ✅ APPROVED

**Remove:**
- `@phosphor-icons/react` ^2.1.10

**Bundle Size Savings:** ~200 KB

**Decision:** Using fakemui custom SVG icons only (no third-party icon library)

**Prerequisites:**
- ✅ All icons migrated to fakemui/icons
- ✅ Icon inventory complete (50-100 icons)
- ✅ Pattern established for adding new icons as needed

---

## Dependencies to Evaluate

### @github/spark
**Current Version:** >=0.43.1 <1
**Purpose:** Unknown - needs investigation
**Action:** Search codebase for usage
**Decision:** Keep or remove based on usage

### @next/third-parties
**Current Version:** ^16.1.1
**Purpose:** Third-party script loading (Google Analytics, etc.)
**Action:** Check if actively used
**Decision:** Keep if used, remove if not

---

## Post-Migration package.json

**Estimated Dependencies After Cleanup:** 35-40 packages (down from 45)
**Estimated Bundle Size Reduction:** 2-3 MB (15-25%)

### Final State
```json
{
  "dependencies": {
    // Core
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",

    // Forms & Validation
    "@hookform/resolvers": "^5.2.2",
    "react-hook-form": "^7.69.0",
    "zod": "^4.2.1",

    // Data & State
    "@tanstack/react-query": "^5.90.12",
    "@prisma/client": "^7.2.0",
    "@prisma/adapter-better-sqlite3": "^7.2.0",
    "better-sqlite3": "^12.5.0",

    // Editor & Code
    "@monaco-editor/react": "^4.7.0",

    // Utilities
    "date-fns": "^4.1.0",
    "marked": "^17.0.1",
    "uuid": "^13.0.0",
    "jszip": "^3.10.1",

    // Visualization
    "motion": "^12.6.2",
    "recharts": "^3.6.0",
    "d3": "^7.9.0",
    "three": "^0.182.0",

    // Lua
    "fengari-web": "^0.1.4",
    "fengari-interop": "^0.1.4",

    // AWS
    "@aws-sdk/client-s3": "^3.958.0",
    "@aws-sdk/lib-storage": "^3.958.0",
    "@aws-sdk/s3-request-presigner": "^3.958.0",

    // GitHub
    "@octokit/core": "^7.0.6",
    "octokit": "^5.0.5",

    // UI & Feedback
    "react-error-boundary": "^6.0.0",
    "sonner": "^2.0.7",

    // Misc
    "server-only": "^0.0.1",
    "sharp": "^0.34.5"
  }
}
```

---

## Removal Commands

### Phase 1: MUI Removal
```bash
cd frontends/nextjs
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Phase 2: MUI X Components
```bash
npm uninstall @mui/x-data-grid @mui/x-date-pickers
```

### Phase 3: Phosphor Icons
```bash
npm uninstall @phosphor-icons/react
```

---

## Verification Steps

After each removal phase:

1. **Build Test**
   ```bash
   npm run build
   ```

2. **Type Check**
   ```bash
   npm run typecheck
   ```

3. **Unit Tests**
   ```bash
   npm run test:unit
   ```

4. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

5. **Bundle Analysis**
   ```bash
   # Check bundle size
   npm run build
   # Compare .next/static/chunks sizes
   ```

---

## Risk Mitigation

### Backup Strategy
```bash
# Before removal
git checkout -b mui-removal-phase-1
cp package.json package.json.backup
npm list > installed-packages.txt
```

### Rollback Plan
```bash
# If issues arise
git checkout main
npm install
```

### Staged Rollout
1. Remove MUI deps but keep code
2. Test thoroughly
3. If successful, proceed
4. If issues, restore deps and investigate

---

## Success Metrics

- ✅ Zero MUI imports in codebase
- ✅ All tests passing
- ✅ No build errors
- ✅ Bundle size reduced 15-25%
- ✅ No visual regressions
- ✅ Performance metrics maintained or improved

---

**Next Actions:**
1. Complete MUI migration (see MUI_ELIMINATION_PLAN.md)
2. Search for @github/spark usage
3. Check @next/third-parties usage
4. Execute Phase 1 removal
5. Verify and test
6. Proceed to Phase 2

**Last Updated:** 2025-12-30
