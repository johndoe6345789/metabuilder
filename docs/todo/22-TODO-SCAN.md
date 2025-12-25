# TODO 22 - TODO Scan (Inventory)

This file is a snapshot of TODO-style markers found in the repo. It’s meant to make “what still says TODO?” easy to track without hunting through grep output.

**Generated**: 2025-12-25 21:02:25Z

## How this was scanned

From repo root:

- Code TODO comments: `rg -n "//\\s*TODO\\b" --glob '!docs/**' --glob '!**/node_modules/**' --glob '!**/.git/**' .`
- Docs TODO notes: `rg -n "^TODO:" docs --glob '!docs/todo/**' --glob '!**/node_modules/**' --glob '!**/.git/**'`

## Summary

- **Code** (`// TODO`, excluding `docs/`): **37 matches** in **35 files**
  - Includes **1 false-positive** where `// TODO` appears inside a string literal: `tools/generate-stub-report.ts:138`
- **Docs** (`TODO:` at start of line, excluding `docs/todo/`): **34 matches** in **28 files**

## Code TODOs (excluding `docs/`)

### Frontend (Next.js)

#### Feature / behavior work

- [ ] Auth hook backend integration: `frontends/nextjs/src/hooks/useAuth.ts:28`
- [ ] KV hook persistence (DB/Prisma): `frontends/nextjs/src/hooks/useKV.ts:9`
- [ ] Screenshot analyzer API route (no direct LLM call from client): `frontends/nextjs/src/components/ScreenshotAnalyzer.tsx:64`
- [ ] GitHub Actions fetcher OAuth + API route(s): `frontends/nextjs/src/components/GitHubActionsFetcher.tsx:66`
- [ ] GitHub Actions fetcher API route(s) for LLM calls: `frontends/nextjs/src/components/GitHubActionsFetcher.tsx:140`
- [ ] GitHub Actions fetcher API route(s) for LLM calls: `frontends/nextjs/src/components/GitHubActionsFetcher.tsx:291`
- [ ] Lua sandbox max memory enforcement: `frontends/nextjs/src/lib/lua/sandboxed-lua-engine.ts:19`
- [ ] Audit log storage: `frontends/nextjs/src/lib/security/secure-db/log-operation.ts:28`
- [ ] Audit log query (respect requested limit): `frontends/nextjs/src/lib/security/secure-db/operations/get-audit-logs.ts:14`
- [ ] Track failed login attempts + lockout/backoff: `frontends/nextjs/src/lib/security/secure-db/operations/verify-credentials.ts:16`
- [ ] Load rate-limit settings from config/DB: `frontends/nextjs/src/lib/security/secure-db/rate-limit-store.ts:1`
- [ ] Sonner wrapper: dismiss-by-ID support: `frontends/nextjs/src/components/ui/sonner.tsx:94`

#### Import hygiene (UI re-export wrappers)

- [ ] Update imports to use `@/components/ui` directly, then decide whether these thin re-export files can be removed:
  - `frontends/nextjs/src/components/ui/accordion.ts:2`
  - `frontends/nextjs/src/components/ui/alert-dialog.ts:2`
  - `frontends/nextjs/src/components/ui/alert.ts:2`
  - `frontends/nextjs/src/components/ui/avatar.ts:2`
  - `frontends/nextjs/src/components/ui/badge.ts:2`
  - `frontends/nextjs/src/components/ui/button.ts:2`
  - `frontends/nextjs/src/components/ui/card.ts:2`
  - `frontends/nextjs/src/components/ui/checkbox.ts:2`
  - `frontends/nextjs/src/components/ui/dialog.ts:2`
  - `frontends/nextjs/src/components/ui/dropdown-menu.ts:2`
  - `frontends/nextjs/src/components/ui/input.ts:2`
  - `frontends/nextjs/src/components/ui/label.ts:2`
  - `frontends/nextjs/src/components/ui/progress.ts:2`
  - `frontends/nextjs/src/components/ui/radio-group.ts:2`
  - `frontends/nextjs/src/components/ui/scroll-area.ts:2`
  - `frontends/nextjs/src/components/ui/select.ts:2`
  - `frontends/nextjs/src/components/ui/separator.ts:2`
  - `frontends/nextjs/src/components/ui/sheet.ts:2`
  - `frontends/nextjs/src/components/ui/skeleton.ts:2`
  - `frontends/nextjs/src/components/ui/slider.ts:2`
  - `frontends/nextjs/src/components/ui/switch.ts:2`
  - `frontends/nextjs/src/components/ui/table.ts:2`
  - `frontends/nextjs/src/components/ui/tabs.ts:2`
  - `frontends/nextjs/src/components/ui/textarea.ts:2`

### Tooling (note)

- `tools/generate-stub-report.ts:138` contains `// TODO` inside a string literal used in documentation examples (not a code TODO comment).

## Docs TODO notes (`TODO:` at start of line; excluding `docs/todo/`)

These are mostly “fix broken relative links / outdated paths” notes embedded across docs pages.

- [ ] `docs/START_HERE.md:5`
- [ ] `docs/README.md:5`
- [ ] `docs/README.md:230`
- [ ] `docs/README.md:261`
- [ ] `docs/CONTRIBUTING.md:275`
- [ ] `docs/CONTRIBUTING.md:279`
- [ ] `docs/NAVIGATION.md:144`
- [ ] `docs/DOCS_ORGANIZATION_GUIDE.md:5`
- [ ] `docs/DOCS_ORGANIZATION_COMPLETE.md:8`
- [ ] `docs/deployments/CI_CD_SUMMARY.md:327`
- [ ] `docs/database/PRISMA_SETUP.md:140`
- [ ] `docs/architecture/deployment.md:298`
- [ ] `docs/architecture/security.md:260`
- [ ] `docs/architecture/testing.md:243`
- [ ] `docs/architecture/packages.md:496`
- [ ] `docs/architecture/packages.md:498`
- [ ] `docs/guides/getting-started.md:313`
- [ ] `docs/guides/SASS_QUICK_REFERENCE.md:287`
- [ ] `docs/stub-detection/OVERVIEW.md:77`
- [ ] `docs/reference/DOCUMENTATION_FINDINGS.md:605`
- [ ] `docs/reference/IMPROVEMENT_ROADMAP_INDEX.md:8`
- [ ] `docs/reference/PRIORITY_ACTION_PLAN.md:9`
- [ ] `docs/reference/STUB_DETECTION_IMPLEMENTATION.md:377`
- [ ] `docs/reference/STUB_DETECTION_QUICK_START.md:149`
- [ ] `docs/reference/STUB_DETECTION_SUMMARY.md:230`
- [ ] `docs/reference/TESTING_IMPLEMENTATION_SUMMARY.md:7`
- [ ] `docs/refactoring/REFACTORING_INDEX.md:360`
- [ ] `docs/refactoring/REFACTORING_SUMMARY.md:450`
- [ ] `docs/implementation/DBAL_INTEGRATION.md:391`
- [ ] `docs/implementation/DBAL_INTEGRATION.md:408`
- [ ] `docs/migrations/FILE_RELOCATION_GUIDE.md:83`
- [ ] `docs/migrations/FILE_RELOCATION_GUIDE.md:92`
- [ ] `docs/migrations/RELOCATION_SUMMARY.md:79`
