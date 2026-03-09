# Type Checking Strategy

## Current Status

Type checking is currently **disabled during the Next.js build** (`next.config.js: typescript.ignoreBuildErrors: true`) but **enabled in the IDE** for development feedback.

**Reason:** There are currently 60+ type errors across the codebase that would prevent successful builds if type checking were enabled. These errors span:
- Component prop types (Dialog, Button variants)
- E2E test typing issues
- Monaco editor API differences
- Schema mismatches (e.g., `category` field in Snippet type)

## Why Type Checking Is Important

Type checking in the build pipeline provides:
1. **Production safety** - catches errors before deployment
2. **CI/CD consistency** - ensures all code paths are type-safe
3. **Developer confidence** - prevents regressions

## Implementation Plan

### Phase 1: Establish CI/CD Type Checking (SHORT-TERM)
- Add `tsc --noEmit` check to CI pipeline
- Document type checking requirement in contributing guidelines
- This ensures at least one build stage validates types

### Phase 2: Fix Type Errors (MEDIUM-TERM)
1. **Component Prop Types** - Update Dialog, Button, and other component definitions
2. **E2E Test Types** - Fix Playwright API type mismatches
3. **Schema Alignment** - Ensure type definitions match actual data structures
4. **Library Updates** - Resolve Monaco editor and other third-party type conflicts

### Phase 3: Enable Strict Type Checking in Build (LONG-TERM)
- Enable `typescript.ignoreBuildErrors: false` in `next.config.js`
- Integrate type checking into the build process for maximum safety

## Developer Guidelines

### Local Development
- IDE type checking is always active (even with `ignoreBuildErrors: true`)
- Address type errors in your IDE before pushing
- Type errors may not cause build failures, but they're real issues to fix

### Before Creating a PR
Run the type checker locally:
```bash
npx tsc --noEmit
```

Fix any errors before committing.

### CI/CD Requirements (Once Implemented)
The CI/CD pipeline will run:
```bash
npx tsc --noEmit  # Full type check validation
npm run build     # Ensure build succeeds
npm test          # Unit tests
npm run e2e       # E2E tests
```

## Type Error Categories (Current)

| Category | Count | Examples | Effort |
|----------|-------|----------|--------|
| Component Props | ~20 | Dialog `onOpenChange`, Button `variant` | 4-6 hours |
| E2E Tests | ~15 | Playwright `metrics` property, `TouchInit` types | 4-8 hours |
| Schema Mismatches | ~5 | Snippet `category` field | 2-3 hours |
| Library APIs | ~10 | Monaco editor, slider, tooltip props | 3-4 hours |
| Other | ~10 | Ref type mismatches, union type issues | 2-3 hours |

**Total Effort to Full Type Safety:** 15-24 hours

## Recommended Next Steps

1. Add `tsc --noEmit` to GitHub Actions CI workflow
2. Document type checking requirement in CONTRIBUTING.md
3. Incrementally fix type errors (prioritize components, then E2E, then libraries)
4. Once errors are below 5, enable `ignoreBuildErrors: false`

