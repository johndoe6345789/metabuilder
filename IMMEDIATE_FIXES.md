# MetaBuilder: Immediate Fixes (Next 2 Hours to Functional System)

**Target**: Get Next.js building and styled, then test all 3 frontends

---

## FIX #1: Next.js TypeScript Error (5 minutes)

### File
`/frontends/nextjs/src/app/page.tsx`

### Error (Current)
```
src/app/page.tsx:67 - error TS2322
Type 'unknown' is not assignable to type 'string'
```

### Root Cause
Line 67: `const renderObj = parsed.render as Record<string, unknown> | undefined`

When cast to `unknown`, TypeScript loses the prior `typeof renderObj.type === 'string'` check.

### Solution

**Replace lines 64-76 with:**
```typescript
if (hasValidRender) {
  // Type-safe render object with required 'type' field
  const safeRender: { type: string; template?: unknown } = {
    type: renderObj.type as string,
    template: renderObj.template,
  }
  const componentDef = {
    id: parsed.id,
    name: parsed.name,
    description: typeof parsed.description === 'string' ? parsed.description : undefined,
    props: Array.isArray(parsed.props) ? parsed.props : undefined,
    render: safeRender,
  }
  return <JSONComponentRenderer component={componentDef} />
}
```

### Verification
```bash
cd /frontends/nextjs
npm run typecheck
# Expected output: Compiled successfully
```

---

## FIX #2: Re-enable SCSS Styling (30 minutes)

### File
`/frontends/nextjs/src/main.scss`

### Current State
Lines 3-11 are commented out:
```scss
// @use './styles/core/theme.scss';
// @import '@/fakemui/styles/components.scss';
// @import '@/fakemui/styles/tokens.scss';
// etc.
```

Comment explanation: `// TODO: Fix SCSS imports - causing build errors`

### Investigation Steps

**Step 1**: Check if files exist
```bash
ls -la /frontends/nextjs/src/styles/core/theme.scss
ls -la /frontends/nextjs/src/fakemui/styles/components.scss
# If missing, check alternate paths
find /frontends -name "theme.scss" -o -name "components.scss"
```

**Step 2**: Try uncommenting one import at a time
```bash
# In main.scss, uncomment just the first @use:
@use './styles/core/theme.scss';
# Build and see what error appears
npm run build
```

**Step 3**: Debug the specific error
- If file not found: Adjust path
- If syntax error: Fix SCSS syntax
- If type error: Check Tailwind/SCSS version compatibility

**Step 4**: Fix root cause
Common issues:
- Wrong path (should be relative to main.scss location)
- SCSS version incompatibility (check package.json sass version)
- Tailwind not installed (check package.json)
- TypeScript strictness on CSS imports

**Step 5**: Uncomment all imports once working
```scss
@use './styles/core/theme.scss';
@import '@/fakemui/styles/components.scss';
@import '@/fakemui/styles/tokens.scss';
@import '@/fakemui/styles/overrides.scss';
@import './styles/custom.scss';
```

### Testing
```bash
cd /frontends/nextjs
npm run dev
# Navigate to http://localhost:3000
# Verify Material Design styling is visible:
# - Buttons should have color, shadow
# - Cards should have elevation
# - Text should have proper typography
# - Layout should have proper spacing
```

---

## FIX #3: Uncomment PackageStyleLoader (2 minutes)

### File
`/frontends/nextjs/src/app/layout.tsx`

### Current State
Lines 60-61 are commented out:
```typescript
// const packageStyles = await PackageStyleLoader()
// styleSheets = [...styleSheets, ...packageStyles]
```

### Solution
Simply uncomment once SCSS is working:
```typescript
const packageStyles = await PackageStyleLoader()
styleSheets = [...styleSheets, ...packageStyles]
```

### Verification
- Packages can now apply custom styles
- No additional testing needed (covered by SCSS verification)

---

## VERIFICATION: Build Complete Next.js (10 minutes)

Once all 3 fixes applied:

```bash
cd /frontends/nextjs

# Step 1: Type check
npm run typecheck
# Expected: ✓ Compiled successfully

# Step 2: Build production
npm run build
# Expected: ✓ Successfully built, output available

# Step 3: Run dev server
npm run dev
# Expected: ✓ Ready on http://localhost:3000

# Step 4: Verify UI
# In browser, navigate to http://localhost:3000
# Verify:
# - Page loads without errors
# - Material Design styling visible (buttons have color, cards have shadow)
# - Navigation works
# - Database connection works (check console for any errors)
```

---

## TEST: Next.js E2E (10 minutes)

```bash
cd /frontends/nextjs

# Run E2E test suite
npm run test:e2e

# Expected result:
# ✓ 326+ tests passing
# ✓ 1 failing (auth middleware - different issue)
# Pass rate: 99%+
```

---

## BUILD: CLI Frontend (30 minutes parallel)

While Next.js is building, start CLI:

```bash
cd /frontends/cli

# Step 1: Install dependencies
conan install . --output-folder build --build missing
# Expected: Conan downloads cpr, lua, sol2, nlohmann_json

# Step 2: Generate CMake
cmake -S . -B build -G Ninja
# Expected: CMake generates build files

# Step 3: Compile
cmake --build build
# Expected: C++ compilation succeeds, binary in build/bin/metabuilder-cli

# Step 4: Test basic command
./build/bin/metabuilder-cli --version
# Should output version info

# Step 5: Test DBAL commands (requires Next.js running at localhost:3000)
export METABUILDER_BASE_URL=http://localhost:3000
./build/bin/metabuilder-cli dbal ping
# Should output: {"status": "ok"}

./build/bin/metabuilder-cli package list
# Should output: JSON array of installed packages
```

### CLI Verification
```bash
# Test all major commands work
./build/bin/metabuilder-cli auth session
./build/bin/metabuilder-cli user list
./build/bin/metabuilder-cli package run ui_home home_page
```

---

## BUILD: QT6 Frontend (30 minutes parallel)

While Next.js/CLI are building:

```bash
cd /frontends/qt6

# Step 1: Install dependencies
conan install . --output-folder build --build missing
# Expected: Conan downloads Qt6, cpr, libopenmpt

# Step 2: Generate CMake
cmake -S . -B build -G Ninja
# Expected: CMake generates build files

# Step 3: Compile
cmake --build build
# Expected: C++ compilation succeeds, app binary in build/

# Step 4: Run application
./build/metabuilder-qt6
# Expected: Qt6 window opens with landing page

# Step 5: Verify UI
# In the window, check:
# - Material Design colors and styling
# - Navigation works
# - Components render correctly
# - No console errors
```

### QT6 Verification
- Landing page displays
- Material Design visible
- Package manager shows packages
- Storybook shows components

---

## DEPLOYMENT: Docker Stack (20 minutes)

Once all frontends build successfully:

```bash
cd /deployment

# Start development stack
./deploy.sh development

# Expected:
# ✓ PostgreSQL starts
# ✓ Redis starts
# ✓ Nginx starts
# ✓ Next.js app starts
# Services available at:
#   - Frontend: http://localhost:3000
#   - Nginx: http://localhost:80
#   - PostgreSQL: localhost:5432

# Verify services
docker ps
# Should show 4-5 running containers

# Check logs
docker logs metabuilder-app-dev
docker logs metabuilder-postgres-dev

# Test database connection
docker exec metabuilder-postgres-dev psql -U metabuilder -c "SELECT * FROM \"InstalledPackage\" LIMIT 5;"

# Verify bootstrap completed
curl http://localhost:3000/api/bootstrap
# Should return: {"success": true, "packagesInstalled": 12, ...}
```

---

## Summary: Timeline

| Task | Time | Type | Status |
|------|------|------|--------|
| Fix TypeScript error | 5 min | Sequential | Critical |
| Restore SCSS styling | 30 min | Sequential | Critical |
| Uncomment PackageStyleLoader | 2 min | Sequential | Quick |
| Verify Next.js build | 10 min | Sequential | Validation |
| Test Next.js E2E | 10 min | Sequential | Validation |
| **SUBTOTAL (Next.js)** | **57 min** | | |
| **PARALLEL START** | | | |
| Build CLI | 30 min | Parallel | Optional |
| Build QT6 | 30 min | Parallel | Optional |
| Docker deployment | 20 min | After main | Deployment |
| **TOTAL** | **2 hours** | | |

**Critical Path**: TypeScript fix (5) → SCSS fix (30) → Next.js verify (10) → Deploy (20) = **65 minutes minimum**

---

## Troubleshooting

### If TypeScript fix doesn't work
- Verify no other TypeScript errors in page.tsx
- Run: `npm run typecheck 2>&1 | head -20` to see full error
- Check that JSONComponent type definition has `render: { type: string }`

### If SCSS still has errors after uncomment
- Check SCSS syntax (look for unclosed braces, missing semicolons)
- Verify sass version in package.json (should be 1.70+)
- Try CSS @import instead of SCSS @use
- Check Tailwind configuration

### If CLI build fails
- Verify CMake 3.27+ installed: `cmake --version`
- Verify Conan 2.0+ installed: `conan --version`
- Check C++20 compiler available: `g++ --version` or `clang --version`
- Verify internet connection (Conan downloads packages)

### If QT6 build fails
- Verify Qt6 installation via Conan
- Check platform (Linux/Mac/Windows) supported
- Verify OpenGL/graphics libraries available

### If Docker fails
- Verify Docker daemon running: `docker ps`
- Check port conflicts: `lsof -i :3000`
- Verify .env variables set in docker-compose

---

## Success Criteria

✅ **Next.js**
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts server
- [ ] UI loads at http://localhost:3000 with styling
- [ ] Tests pass: `npm run test:e2e`

✅ **CLI**
- [ ] Builds without errors
- [ ] `metabuilder-cli --version` works
- [ ] `metabuilder-cli dbal ping` succeeds
- [ ] `metabuilder-cli package list` returns packages

✅ **QT6**
- [ ] Builds without errors
- [ ] Application window opens
- [ ] Material Design styling visible
- [ ] Components render correctly

✅ **Docker**
- [ ] All containers start
- [ ] Database initialized
- [ ] Bootstrap completes
- [ ] API endpoints responsive

---

**When all criteria met: System is production-ready**
