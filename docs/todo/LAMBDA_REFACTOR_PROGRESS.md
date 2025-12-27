# Lambda-per-File Refactoring Progress

**Generated:** 2025-12-27T15:35:24.150Z

## Summary

- **Total files > 150 lines:** 106
- **Pending:** 91
- **In Progress:** 0
- **Completed:** 3
- **Skipped:** 12

## By Category

- **component:** 60
- **dbal:** 12
- **library:** 11
- **tool:** 10
- **test:** 10
- **type:** 2
- **other:** 1

## Refactoring Queue

Files are prioritized by ease of refactoring and impact.

### High Priority (20 files)

Library and tool files - easiest to refactor

- [ ] `frontends/nextjs/src/lib/nerd-mode-ide/templates/template-configs.ts` (267 lines)
- [ ] `frontends/nextjs/src/lib/db/core/index.ts` (216 lines)
- [ ] `frontends/nextjs/src/lib/security/functions/patterns/javascript-patterns.ts` (184 lines)
- [ ] `frontends/nextjs/src/lib/rendering/page/page-renderer.ts` (178 lines)
- [ ] `frontends/nextjs/src/lib/github/workflows/analysis/runs/analyze-workflow-runs.ts` (164 lines)
- [ ] `frontends/nextjs/src/lib/rendering/page/page-definition-builder.ts` (483 lines)
- [ ] `frontends/nextjs/src/lib/db/database-admin/seed-default-data.ts` (471 lines)
- [ ] `frontends/nextjs/src/lib/components/component-catalog.ts` (337 lines)
- [ ] `frontends/nextjs/src/lib/schema/default-schema.ts` (308 lines)
- [ ] `frontends/nextjs/src/lib/lua/snippets/lua-snippets-data.ts` (983 lines)
- [x] `tools/analysis/code/analyze-render-performance.ts` (294 lines)
- [x] `tools/misc/metrics/enforce-size-limits.ts` (249 lines)
- [ ] `tools/refactoring/refactor-to-lambda.ts` (243 lines)
- [x] `tools/analysis/test/analyze-implementation-completeness.ts` (230 lines)
- [ ] `tools/detection/detect-stub-implementations.ts` (215 lines)
- [ ] `tools/generation/generate-stub-report.ts` (204 lines)
- [ ] `tools/quality/code/check-code-complexity.ts` (175 lines)
- [ ] `tools/generation/generate-quality-summary.ts` (159 lines)
- [ ] `dbal/shared/tools/cpp-build-assistant.ts` (342 lines)
- [ ] `tools/analysis/test/analyze-test-coverage.ts` (332 lines)

### Medium Priority (68 files)

DBAL and component files - moderate complexity

- [ ] `frontends/nextjs/src/lib/packages/core/package-catalog.ts` (1169 lines)
- [ ] `dbal/development/src/blob/providers/tenant-aware-storage.ts` (260 lines)
- [ ] `dbal/development/src/adapters/acl-adapter.ts` (258 lines)
- [ ] `dbal/development/src/blob/providers/memory-storage.ts` (230 lines)
- [ ] `dbal/development/src/core/foundation/types.ts` (216 lines)
- [ ] `dbal/development/src/core/entities/operations/core/user-operations.ts` (185 lines)
- [ ] `dbal/development/src/core/entities/operations/system/package-operations.ts` (185 lines)
- [ ] `dbal/development/src/bridges/websocket-bridge.ts` (168 lines)
- [ ] `dbal/development/src/blob/providers/filesystem-storage.ts` (410 lines)
- [ ] `dbal/development/src/blob/providers/s3-storage.ts` (361 lines)
- [ ] `dbal/development/src/adapters/prisma-adapter.ts` (350 lines)
- [ ] `frontends/nextjs/src/lib/dbal/core/client/dbal-integration.ts` (313 lines)
- [ ] `dbal/development/src/core/foundation/kv-store.ts` (307 lines)
- [ ] `frontends/nextjs/src/components/misc/data/QuickGuide.tsx` (297 lines)
- [ ] `frontends/nextjs/src/components/editors/ThemeEditor.tsx` (294 lines)
- [ ] `frontends/nextjs/src/components/managers/PageRoutesManager.tsx` (290 lines)
- [ ] `frontends/nextjs/src/components/managers/component/ComponentConfigDialog.tsx` (290 lines)
- [ ] `frontends/nextjs/src/components/level/levels/Level5.tsx` (289 lines)
- [ ] `frontends/nextjs/src/components/editors/lua/LuaSnippetLibrary.tsx` (285 lines)
- [ ] `frontends/nextjs/src/components/misc/data/GenericPage.tsx` (274 lines)
- ... and 48 more

### Low Priority (6 files)

- [ ] `frontends/nextjs/src/components/editors/lua/LuaEditor.tsx` (681 lines)
- [ ] `frontends/nextjs/src/components/managers/package/PackageImportExport.tsx` (594 lines)
- [ ] `frontends/nextjs/src/components/workflow/WorkflowEditor.tsx` (508 lines)
- [ ] `frontends/nextjs/src/components/ui/index.ts` (263 lines)
- [ ] `frontends/nextjs/src/components/misc/github/GitHubActionsFetcher.tsx` (1069 lines)
- [ ] `frontends/nextjs/src/components/editors/lua/LuaBlocksEditor.tsx` (1048 lines)

### Skipped Files (12)

These files do not need refactoring:

- `frontends/nextjs/src/hooks/ui/state/useAutoRefresh.test.ts` (268 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/rendering/tests/page-renderer.test.ts` (265 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/security/scanner/security-scanner.test.ts` (257 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/theme/types/theme.d.ts` (200 lines) - Type definition files are typically large
- `frontends/nextjs/src/hooks/data/useKV.test.ts` (196 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/hooks/useAuth.test.ts` (181 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/types/dbal.d.ts` (154 lines) - Type definition files are typically large
- `frontends/nextjs/src/lib/schema/schema-utils.test.ts` (440 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/workflow/engine/workflow-engine.test.ts` (388 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/lua/engine/core/lua-engine.test.ts` (357 lines) - Test files can remain large for comprehensive coverage
- ... and 2 more

## Refactoring Patterns

### For Library Files
1. Create a `functions/` subdirectory
2. Extract each function to its own file
3. Create a class wrapper (like SchemaUtils)
4. Update main file to re-export
5. Verify tests still pass

### For Components
1. Extract hooks into separate files
2. Extract sub-components
3. Extract utility functions
4. Keep main component < 150 lines

### For DBAL Files
1. Split adapters by operation type
2. Extract provider implementations
3. Keep interfaces separate from implementations

## Example: SchemaUtils Pattern

The `frontends/nextjs/src/lib/schema/` directory demonstrates the lambda-per-file pattern:

```
schema/
├── functions/
│   ├── field/
│   │   ├── get-field-label.ts
│   │   ├── validate-field.ts
│   │   └── ...
│   ├── model/
│   │   ├── find-model.ts
│   │   └── ...
│   └── index.ts (re-exports all)
├── SchemaUtils.ts (class wrapper)
└── schema-utils.ts (backward compat re-exports)
```

