# Lambda-per-File Refactoring Progress

**Generated:** 2025-12-29T21:09:00.273Z

## Summary

- **Total files > 150 lines:** 52
- **Pending:** 42
- **In Progress:** 0
- **Completed:** 0
- **Skipped:** 10

## By Category

- **component:** 31
- **test:** 10
- **library:** 4
- **tool:** 4
- **other:** 2
- **dbal:** 1

## Refactoring Queue

Files are prioritized by ease of refactoring and impact.

### High Priority (8 files)

Library and tool files - easiest to refactor

- [ ] `frontends/nextjs/src/lib/db/database-admin/seed-default-data/css/categories/base.ts` (278 lines)
- [ ] `frontends/nextjs/src/lib/nerd-mode-ide/templates/configs/base.ts` (267 lines)
- [ ] `frontends/nextjs/src/lib/schema/default/forms.ts` (244 lines)
- [ ] `frontends/nextjs/src/lib/db/core/operations.ts` (191 lines)
- [ ] `tools/refactoring/cli/orchestrate-refactor.ts` (213 lines)
- [ ] `tools/refactoring/orchestrate-refactor/functions/main.ts` (186 lines)
- [ ] `tools/refactoring/error-as-todo-refactor/index.ts` (163 lines)
- [ ] `dbal/shared/tools/cpp-build-assistant/workflow.ts` (153 lines)

### Medium Priority (32 files)

DBAL and component files - moderate complexity

- [ ] `frontends/nextjs/src/lib/dbal/core/client/dbal-integration/DbalIntegrationUtils.ts` (169 lines)
- [ ] `frontends/nextjs/src/components/misc/data/QuickGuide.tsx` (297 lines)
- [ ] `frontends/nextjs/src/components/misc/data/GenericPage.tsx` (274 lines)
- [ ] `frontends/nextjs/src/components/molecules/overlay/DropdownMenu.tsx` (268 lines)
- [ ] `frontends/nextjs/src/components/managers/database/DatabaseManager.tsx` (261 lines)
- [ ] `frontends/nextjs/src/components/examples/ContactForm.example.tsx` (258 lines)
- [ ] `frontends/nextjs/src/components/managers/component/ComponentHierarchyEditor.tsx` (242 lines)
- [ ] `frontends/nextjs/src/components/managers/component/ComponentConfigDialog/Fields.tsx` (238 lines)
- [ ] `frontends/nextjs/src/components/rendering/FieldRenderer.tsx` (210 lines)
- [ ] `frontends/nextjs/src/components/ui/organisms/data/Form.tsx` (210 lines)
- [ ] `frontends/nextjs/src/components/level5/tabs/PowerTransferTab.tsx` (207 lines)
- [ ] `frontends/nextjs/src/components/misc/auth/UnifiedLogin.tsx` (207 lines)
- [ ] `frontends/nextjs/src/components/ui/molecules/overlay/DropdownMenu.tsx` (207 lines)
- [ ] `frontends/nextjs/src/components/ui/organisms/navigation/NavigationMenuItems.tsx` (203 lines)
- [ ] `frontends/nextjs/src/components/editors/lua/LuaBlocksEditor.tsx` (193 lines)
- [ ] `frontends/nextjs/src/components/molecules/overlay/Dialog.tsx` (191 lines)
- [ ] `frontends/nextjs/src/components/editors/JsonEditor.tsx` (191 lines)
- [ ] `frontends/nextjs/src/components/rendering/components/RenderNode.tsx` (188 lines)
- [ ] `frontends/nextjs/src/components/misc/viewers/AuditLogViewer.tsx` (188 lines)
- [ ] `frontends/nextjs/src/components/misc/viewers/audit-log/Filters.tsx` (188 lines)
- ... and 12 more

### Low Priority (2 files)

- [ ] `frontends/nextjs/src/components/nerd-mode-ide/core/NerdModeIDE/useNerdIdeState.ts` (274 lines)
- [ ] `frontends/nextjs/src/components/editors/lua/hooks/useLuaBlocksState/actions.ts` (208 lines)

### Skipped Files (10)

These files do not need refactoring:

- `frontends/nextjs/src/lib/lua/engine/core/__tests__/lua-engine.execution.test.ts` (297 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/packages/tests/package-glue/validation.test.ts` (284 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/security/scanner/__tests__/security-scanner.detection.test.ts` (234 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/packages/tests/package-glue/execution.test.ts` (229 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/hooks/ui/state/__tests__/useAutoRefresh.polling.test.ts` (229 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/schema/__tests__/schema-utils.serialization.test.ts` (225 lines) - Test files can remain large for comprehensive coverage
- `tools/refactoring/auto-code-extractor-3000.test.ts` (194 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/lib/rendering/tests/declarative-component-renderer.lifecycle.test.ts` (183 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/hooks/__tests__/useAuth.session.test.ts` (177 lines) - Test files can remain large for comprehensive coverage
- `frontends/nextjs/src/hooks/data/__tests__/useKV.store.test.ts` (162 lines) - Test files can remain large for comprehensive coverage

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

