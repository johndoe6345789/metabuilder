# Front Page Rendering Plan

Render the MetaBuilder front page (`/`) using real package components with Playwright E2E tests, while replicating the look and feel of the old system.

## Objectives

### Objective 1: Render Front Page Using Real Package Components ✅
- Front page loads components from `ui_home` package
- Uses JSON-based component definitions
- Displays properly with fakemui Material Design components
- Works with database-driven PageConfig and InstalledPackage records

### Objective 2: Replicate Old System Look & Feel
- Analyze old system UI/UX (`/old/src/`)
- Extract visual design, layout, and interaction patterns
- Implement similar aesthetics using fakemui components
- Maintain consistency with existing MetaBuilder design system

### Objective 3: Playwright E2E Testing
- Create tests that verify front page rendering
- Test component loading from packages
- Verify user access and permissions
- Test fallback behavior when components not available

## Current State Analysis

### Front Page (`page.tsx`)
```
✅ Already configured for dynamic rendering
✅ DBAL client integration working
✅ PageConfig and InstalledPackage lookup implemented
✅ JSON component rendering available
✅ Package component loading ready
```

**What's missing:**
- Database not yet initialized (no tables)
- No seed data loaded (no PageConfig or InstalledPackage records)
- No bootstrap API endpoint called
- Example components need to be expanded with design

### Old System (`/old/src/`)
**Key patterns to replicate:**
- Hero section with gradient background
- Call-to-action buttons
- Multi-level interface system
- Clean, modern design with Material Design patterns
- Responsive layout

## Execution Plan

### Phase 1: Database Bootstrap (3 steps, ~5 min)

Step 1: Generate Prisma schema from YAML
```bash
npm --prefix dbal/development run codegen:prisma
```

Step 2: Push schema to SQLite database
```bash
npm --prefix dbal/development run db:push
```

Step 3: Bootstrap system with seed data
```bash
curl -X POST http://localhost:3000/api/bootstrap
```

### Phase 2: Update UI Home Components (1 step, ~20 min)

Step 4: Update `/packages/ui_home/component/ui-components.json` to replicate old system design

Key components to enhance:
- Hero section with gradient, heading, subheading, CTA buttons
- Feature grid showing system capabilities
- Get started section
- Footer with navigation

### Phase 3: Playwright E2E Tests (2 steps, ~15 min)

Step 5: Create test suite `/e2e/frontpage.spec.ts`

Step 6: Run tests
```bash
npm run test:e2e
```

### Phase 4: Refinement (~15 min)

Step 7: Visual verification and adjustments
Step 8: Performance optimization
Step 9: Final testing

## What Needs to Happen Now

1. **Bootstrap Database**: Generate schema, push to DB, call bootstrap
2. **Check Components**: Verify ui_home seed data loads correctly
3. **Update Design**: Enhance components to match old system aesthetic
4. **Create Tests**: Write Playwright tests for front page
5. **Verify**: Test that everything renders correctly

---

**Status**: Ready to execute
**Next Step**: Phase 1 - Bootstrap database

