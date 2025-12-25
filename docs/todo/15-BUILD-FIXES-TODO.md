# TODO 15 - Build & Configuration Fixes

## Critical Build Issues

- [x] Fix TypeScript config error: `exactOptionalPropertyTypes` requires `strictNullChecks` (dbd8e49)
- [x] Resolve Next.js build failures in `frontends/nextjs` (Dec 25 2025 - fixed MUI component issues)
- [x] Fix module resolution issues preventing successful build (Dec 25 2025 - fixed lib exports)
- [ ] Address any circular dependency issues
- [x] Resolve import path errors (Dec 25 2025 - fixed WorkflowEditor, page-renderer test mocks)

## TypeScript Configuration

- [x] Enable `strictNullChecks` in tsconfig.json (dbd8e49)
- [x] Review and fix all null/undefined type errors (Dec 25 2025 - typecheck passes)
- [ ] Update type definitions for strict mode
- [ ] Add strict mode to all sub-packages
- [ ] Configure path aliases consistently

## ESLint Configuration

- [ ] Update ESLint config for latest rules
- [ ] Fix all linting errors in codebase
- [ ] Add pre-commit linting hooks
- [ ] Configure ESLint for TypeScript strict mode
- [ ] Add custom rules for project conventions

## Vite Configuration

- [ ] Optimize Vite build configuration
- [ ] Configure proper code splitting
- [ ] Add build performance optimizations
- [ ] Configure proper source maps
- [ ] Add bundle analysis

## Next.js Configuration

- [ ] Review next.config.ts for issues
- [ ] Configure proper image optimization
- [ ] Add internationalization setup
- [ ] Configure API routes properly
- [ ] Set up proper environment handling

## Package Dependencies

- [ ] Audit and update outdated dependencies
- [ ] Remove unused dependencies
- [ ] Resolve dependency version conflicts
- [ ] Add missing peer dependencies
- [ ] Configure dependency update automation

## Monorepo Configuration

- [ ] Configure workspace dependencies properly
- [ ] Set up proper build order
- [ ] Add shared configuration packages
- [ ] Configure proper module resolution
- [ ] Add workspace-level scripts

## CI/CD Build

- [ ] Fix GitHub Actions build workflow
- [ ] Add build caching for faster CI
- [ ] Configure parallel build jobs
- [ ] Add build artifact management
- [ ] Implement incremental builds
