# TODO 5 - Frontend (Next.js Application)

## Component Architecture

- [ ] Audit components over 150 LOC and refactor to smaller, declarative components
- [ ] Convert hardcoded JSX to use `RenderComponent` pattern where applicable
- [ ] Create reusable component library with consistent prop interfaces
- [ ] Add Storybook stories for all UI components
- [ ] Implement proper error boundaries for all major component trees

## Authentication & Authorization

- [ ] Complete auth hook implementation (`frontends/nextjs/src/hooks/useAuth.ts`, TODO at `frontends/nextjs/src/hooks/useAuth.ts:28`)
- [ ] Add OAuth provider support (GitHub, Google, etc.)
- [ ] Implement session refresh logic with token rotation
- [ ] Add multi-factor authentication support
- [ ] Create protected route wrapper with level-based access control
- [x] Persist and surface power-transfer requests via the new API + Level 5 UI for auditability

## State Management

- [ ] Complete KV store hook implementation (`frontends/nextjs/src/hooks/useKV.ts`, TODO at `frontends/nextjs/src/hooks/useKV.ts:9`)
- [ ] Add optimistic updates for better UX
- [ ] Implement proper cache invalidation strategies
- [ ] Add offline support with local storage fallback
- [ ] Create state synchronization between tabs

## Page Rendering

- [ ] Complete page renderer implementation (`src/lib/page-renderer.ts`)
- [ ] Add server-side rendering optimization for initial load
- [ ] Implement dynamic imports for code splitting
- [ ] Add preloading for predictive navigation
- [ ] Create layout composition system

## Workflow Engine

- [x] Add unit tests for workflow execution paths (`src/lib/workflow-engine.ts`) ✅ (22 tests)
- [ ] Implement workflow step retry logic
- [ ] Add parallel node execution support
- [ ] Create workflow debugging/tracing tools
- [ ] Implement workflow versioning and rollback

## Screenshots & Analysis

- [ ] Complete ScreenshotAnalyzer component implementation (`frontends/nextjs/src/components/ScreenshotAnalyzer.tsx`, TODO at `frontends/nextjs/src/components/ScreenshotAnalyzer.tsx:64`)
- [ ] Add image optimization pipeline
- [ ] Implement visual diff comparison
- [ ] Create annotation overlay system

## GitHub Actions Integration

- [ ] Complete GitHubActionsFetcher component (`frontends/nextjs/src/components/GitHubActionsFetcher.tsx`, TODOs at `:66`, `:140`, `:291`)
- [ ] Add webhook integration for real-time updates
- [ ] Implement action log streaming
- [ ] Create action re-run functionality

## UI Component Wrappers

- [ ] Remove TODO markers in `frontends/nextjs/src/components/ui/*` re-export files (import conventions)
- [ ] Implement `sonner` dismiss-by-ID (`frontends/nextjs/src/components/ui/sonner.tsx:94`)

## References

- Scan results: [TODO_SCAN_REPORT.md](TODO_SCAN_REPORT.md)

## Build & Performance

- [x] Fix TypeScript configuration error (strictNullChecks) (dbd8e49)
- [ ] Resolve build failures in Next.js frontend
- [ ] Add bundle size monitoring and alerts
- [ ] Implement tree-shaking optimization
- [ ] Add performance budgets and enforcement
