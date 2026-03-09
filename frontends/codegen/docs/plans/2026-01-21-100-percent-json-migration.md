# 100% JSON Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute this plan with parallel subagents.

**Goal:** Migrate all 412 remaining TSX components to JSON definitions with custom hooks, leaving only 8 framework-essential files in src/components/.

**Architecture:**
- **Phase 1**: Categorize & prepare (8 essential TSX files stay, 404 components to convert)
- **Phase 2**: Batch components into 10-15 logical groups
- **Phase 3**: Dispatch parallel subagents to convert each batch (JSON defs + hooks + registry updates)
- **Phase 4**: Consolidate, test, and verify 100% JSON coverage
- **Result**: Only App.tsx, App.router.tsx, and 6 app/ bootstrap files remain in src/components/

**Tech Stack:**
- JSON component definitions (src/components/json-definitions/)
- Custom hooks (src/hooks/)
- Component registry (json-components-registry.json)
- Hook registry (src/lib/json-ui/hooks-registry.ts)
- Subagent-driven parallel conversion

---

## Phase 1: Categorize Framework-Essential Files

### Task 1: Identify Framework-Essential Components

**Files:**
- Reference: `src/App.tsx`, `src/App.router.tsx`
- Reference: `src/components/app/*.tsx`
- Reference: `src/components/ui/**/*.tsx` (all Radix/Shadcn UI primitives)

**Steps:**

These 8 files MUST remain in TSX (framework layer):
1. `src/App.tsx` - Root entry point
2. `src/App.router.tsx` - Router setup
3. `src/components/app/AppBootstrap.tsx` - Provider setup
4. `src/components/app/AppRouterBootstrap.tsx` - Router provider
5. `src/components/app/AppLayout.tsx` - Root layout
6. `src/components/app/AppRouterLayout.tsx` - Router layout
7. `src/components/app/AppMainPanel.tsx` - Main render area
8. `src/components/app/AppDialogs.tsx` - Global dialogs

All other 404 components can and should be converted to JSON.

**Verification:**
- No imports from these 8 files should be in application code (only in App.tsx chain)
- All application components should be importable from `@/lib/json-ui/json-components`

---

## Phase 2: Batch Remaining Components for Parallel Conversion

### Task 2: Analyze and Batch Components

**Files:**
- Analyze: `src/components/` (excluding app/ and ui/)
- Analyze: `src/components/json-definitions/` (existing 242 files)

**Steps:**

Group 404 remaining components into 10 semantic batches:

**Batch A: Demo & Showcase (15 components)**
- AtomicComponentDemo.tsx
- AtomicComponentShowcase.tsx
- AtomicLibraryShowcase.tsx
- ComponentTreeBuilder.tsx
- ComponentTreeDemoPage.tsx
- ComponentTreeViewer.tsx
- ComprehensiveDemoPage.tsx
- ComprehensiveDemo*.tsx (4 files)
- JSONUIPage.tsx
- JSONComponentTreeManager.tsx

**Batch B: Conflict Management (5 components)**
- ConflictCard.tsx
- ConflictDetailsDialog.tsx
- ConflictIndicator.tsx
- ConflictResolutionDemo.tsx
- ConflictResolutionPage.tsx

**Batch C: Document & Reference Views (8 components)**
- DocumentationView.tsx
- ErrorPanel.tsx
- FeatureIdeaCloud.tsx
- FeatureToggleSettings.tsx
- FaviconDesigner.tsx
- DockerBuildDebugger.tsx
- DataBindingDesigner.tsx
- ReleaseNotesViewer.tsx

**Batch D: Designer Tools (12 components)**
- ComponentDesignerPage.tsx
- ComponentDesignerWorkspace.tsx
- DesignSystemExplorer.tsx
- DesignTokensPanel.tsx
- IconLibraryBrowser.tsx
- LayoutGridDesigner.tsx
- ThemeDesigner.tsx
- VisualComponentBuilder.tsx
- (and 4 more design-focused tools)

**Batch E: Data & Configuration (10 components)**
- DataSourceManager.tsx (organism - if TSX)
- DatabaseSchemaEditor.tsx
- APIEndpointBuilder.tsx
- ConfigurationPanel.tsx
- SettingsManager.tsx
- AuthenticationConfig.tsx
- (and 4 more data/config tools)

**Batch F: Form & Input Builders (8 components)**
- FormBuilder.tsx
- FormDesigner.tsx
- FieldConfigPanel.tsx
- ValidationRuleBuilder.tsx
- FormPreview.tsx
- InputFieldManager.tsx
- (and 2 more form-related)

**Batch G: Page & Layout Builders (10 components)**
- PageBuilder.tsx
- PageTemplate*.tsx (4 variations)
- LayoutBuilder.tsx
- ResponsiveBreakpointEditor.tsx
- GridLayoutBuilder.tsx
- (and 4 more layout tools)

**Batch H: Navigation & Menu (8 components)**
- NavigationBuilder.tsx
- MenuDesigner.tsx
- BreadcrumbBuilder.tsx
- SidebarConfigurator.tsx
- TabNavigationBuilder.tsx
- (and 3 more navigation-related)

**Batch I: Code & Logic Editors (10 components)**
- CodeEditor.tsx
- JavaScriptEditor.tsx
- JSONEditor.tsx
- BindingEditor.tsx (molecule - if TSX)
- ExpressionBuilder.tsx
- QueryBuilder.tsx
- (and 4 more code/logic tools)

**Batch J: Miscellaneous Utilities (328 components)**
- All remaining components not in batches A-I
- "Catch-all" batch for final conversion sweep

---

## Phase 3: Parallel Subagent Conversion (Batches A-J)

Each batch follows this standard conversion process:

### Template: Batch X Component Conversion

**Files:**
- Create: `src/components/json-definitions/[component-name-kebab].json` (per component)
- Create: `src/lib/json-ui/interfaces/[component-name-kebab].ts` (if complex props)
- Create/Update: `src/hooks/use-[component-name-kebab].ts` (only if stateful)
- Modify: `src/lib/json-ui/hooks-registry.ts` (if new hooks)
- Modify: `src/hooks/index.ts` (export new hooks)
- Modify: `src/lib/json-ui/json-components.ts` (export new JSON component)
- Modify: `json-components-registry.json` (add registry entry)
- Delete: `src/components/[original-tsx-path]`

**Conversion Pattern for Each Component:**

**Step 1: Analyze the TSX component**
- Identify props interface
- Identify internal state (useState, useReducer, useContext)
- Identify side effects (useEffect, useCallback)
- Identify DOM structure

**Step 2: Create JSON definition**
- Extract JSX into JSON structure
- Map props to JSON "bindings"
- Use data-binding syntax for dynamic values

**Step 3: Extract custom hook (if stateful)**
- Move useState/useReducer/useEffect into custom hook
- Return all state and handlers from hook
- Register in hooks-registry.ts

**Step 4: Export JSON component**
- If stateless: `createJsonComponent(def)`
- If stateful: `createJsonComponentWithHooks(def, { hooks: {...} })`

**Step 5: Update registry**
- Add entry to json-components-registry.json
- Ensure "jsonCompatible": true
- Remove any legacy "wrapperRequired" fields

**Step 6: Update imports**
- Change imports from `@/components/[path]` to `@/lib/json-ui/json-components`
- Search entire codebase for old imports

**Step 7: Delete legacy TSX**
- Remove original component file

**Step 8: Verify & test**
- Run: `npm run build`
- Run: `npm run audit:json`
- Run: `npm test`

**Step 9: Commit per component**
```bash
git add src/components/json-definitions/[component].json
git add src/lib/json-ui/interfaces/[component].ts
git add src/hooks/use-[component].ts (if applicable)
git add src/lib/json-ui/json-components.ts
git add json-components-registry.json
git add -u src/components/[old-path].tsx
git commit -m "feat: migrate [ComponentName] to JSON with custom hooks"
```

---

## Phase 4: Parallel Subagent Execution (10 Concurrent Agents)

**Configuration:**

- **Subagent 1**: Batch A (Demo & Showcase) - 15 components
- **Subagent 2**: Batch B (Conflict Management) - 5 components
- **Subagent 3**: Batch C (Document & Reference) - 8 components
- **Subagent 4**: Batch D (Designer Tools) - 12 components
- **Subagent 5**: Batch E (Data & Configuration) - 10 components
- **Subagent 6**: Batch F (Form & Input Builders) - 8 components
- **Subagent 7**: Batch G (Page & Layout Builders) - 10 components
- **Subagent 8**: Batch H (Navigation & Menu) - 8 components
- **Subagent 9**: Batch I (Code & Logic Editors) - 10 components
- **Subagent 10**: Batch J (Miscellaneous) - 328 components

**Per-Subagent Task:**

Each subagent receives:
1. List of components in their batch
2. This conversion template from Phase 3
3. Instructions to:
   - Convert all components in batch to JSON
   - Export from json-components.ts
   - Update registry
   - Update all imports in codebase
   - Delete original TSX files
   - Run npm run build to verify
   - Create one commit per component (frequent commits)

**Success Criteria:**
- All components in batch converted to JSON
- Build passes: `npm run build`
- Audit clean: `npm run audit:json`
- No imports from old paths remain (search codebase)
- All commits follow "feat: migrate [ComponentName] to JSON" pattern

---

## Phase 5: Consolidation & Final Verification

### Task 10: Consolidate All Commits

**Files:**
- Review: git log for all Phase 4 subagent commits
- Reference: `npm run audit:json`
- Reference: `npm run build`

**Steps:**

After all 10 subagents complete:

1. **Verify all 404 components converted:**
   ```bash
   find src/components -name "*.tsx" -not -path "*/app/*" -not -path "*/ui/*" | wc -l
   ```
   Expected: ~8 files (only App.tsx chain in src/components/app/)

2. **Verify 100% JSON coverage:**
   ```bash
   npm run audit:json
   ```
   Expected: 0 errors, 0 warnings, 100% JSON

3. **Run full test suite:**
   ```bash
   npm run build
   npm test
   ```
   Expected: All tests pass

4. **Verify imports:**
   ```bash
   grep -r "from '@/components" src/ | grep -v "from '@/components/json-definitions'" | grep -v "from '@/components/ui'" | grep -v "from '@/components/app'"
   ```
   Expected: Only framework layer imports remain

5. **Cleanup: Remove empty directories**
   - Delete `src/components/` subdirectories if empty (keep app/, ui/, json-definitions/)

6. **Final commit:**
   ```bash
   git commit -m "feat: achieve 100% JSON migration - 404 components converted, 8 TSX framework files remain"
   ```

### Task 11: Documentation Update

**Files:**
- Modify: `CLAUDE.md` - Update architecture section
- Modify: `README.md` (if applicable) - Add migration achievement note

**Content:**

Update CLAUDE.md "Current State" section:

```markdown
### Current State (Jan 2026 - FINAL)

- **8 TSX files** in root + `src/components/app/` (framework layer only)
- **646 JSON definitions** in `src/components/json-definitions/` + `src/config/pages/`
- **8 custom hooks** in `src/hooks/` for stateful components
- **100% JSON coverage** achieved for application layer
- **0 TSX components** outside framework bootstrap files
- **Build status**: ✅ Clean with full test suite passing

### Architecture (FINAL)

**Two-Tier Architecture:**
1. **Framework Layer (TSX)**: 8 files
   - App.tsx, App.router.tsx (root entry)
   - AppBootstrap.tsx, AppRouterBootstrap.tsx, AppLayout.tsx, AppRouterLayout.tsx, AppMainPanel.tsx, AppDialogs.tsx
   - Reason: React providers, routing setup, global state cannot be JSON-ified

2. **Application Layer (JSON)**: 646 definitions
   - All business logic, UI components, tools, features
   - Custom hooks handle complex state, side effects, external integrations
   - Imported via @/lib/json-ui/json-components

**Result**: Maximum JSON for user-facing code while respecting framework requirements.
```

---

## Testing & Rollback Strategy

### Local Testing

Before each batch commit:
```bash
npm run build          # Verify TypeScript compilation
npm run audit:json     # Verify registry consistency
npm test              # Run full test suite
git status            # Ensure no untracked files
```

### Rollback Plan

If any batch fails:
1. Identify which subagent's batch failed
2. Revert that batch's commits:
   ```bash
   git revert --no-edit [commit-hash]..[commit-hash]
   ```
3. Re-dispatch subagent with refined instructions

### Success Definition

✅ All of the following true:
- `npm run build` passes (0 errors)
- `npm run audit:json` returns 0 issues
- `find src/components -name "*.tsx" -not -path "*/app/*" -not -path "*/ui/*"` = ~8 files
- All 404 components have JSON definitions in registry
- All old TSX files deleted
- Full test suite passes

---

## Execution Summary

**Total Components**: 412 TSX files
- **Keep**: 8 (framework bootstrap only)
- **Convert**: 404 (to JSON + custom hooks)

**Parallel Execution**: 10 subagents × 40 components avg = ~2-3 hours wall time

**Commits**: ~404 (1 per converted component)

**Result**: 100% JSON application layer with <10 TSX files total in src/components/

---

## Next Steps

After Phase 5 completion:
1. Create feature branch: `git checkout -b complete/100-percent-json`
2. Create PR with all commits
3. Code review checklist:
   - All components converted? ✓
   - Build passing? ✓
   - Tests passing? ✓
   - Registry clean? ✓
   - Audit clean? ✓
4. Merge to main

