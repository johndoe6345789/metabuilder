# MEDIUM Priority Dependency Tasks - 2026-01-24

**Status**: HIGH priority tasks complete (Jan 24), MEDIUM priority ready for implementation
**Effort Estimate**: 8-10 hours total
**Timeline**: This month
**Last Updated**: 2026-01-24

---

## Overview

All HIGH priority dependency fixes completed on Jan 24, 2026:
- ✅ Testing library standardization (4 packages)
- ✅ Storybook configuration fixes (2 packages)
- ✅ npm install succeeds, 0 vulnerabilities

**Next Phase**: Execute MEDIUM priority standardization to further improve codebase consistency

---

## Task 1: React 19 Standardization (5+ packages)

**Severity**: MEDIUM
**Effort**: 2-3 hours
**Packages**: 5 identified, possibly more

### Current State

Partial React 19 adoption across codebase:
- **React 19.2.3** (target): ~12 packages already updated
- **React 18.x**: Still used in storybook/ (18.3.1), workflowui/ (18.3.1), pastebin/ (varies)
- **React 17.x**: Minimal adoption (upgrade path complete)

### Packages Needing React 19 Upgrade

Based on audit findings (5 identified):
1. **storybook/** - Currently on React 18.3.1
2. **workflowui/** - Currently on React 18.3.1
3. **pastebin/** - React varies
4. **frontends/nextjs** - Check current version
5. **frontends/qt6** - Check current version

### Implementation Steps

1. **Audit all package.json files** for React versions
   ```bash
   grep -r '"react": ' --include="package.json" | grep -v node_modules | sort -u
   ```

2. **For each package with React < 19.2.3:**
   - Update `react`: `^19.2.3`
   - Update `react-dom`: `^19.2.3`
   - Update `react-redux`: `^9.2.0` (React 19 compatible)
   - Update `@reduxjs/toolkit`: `^2.5.2`

3. **Check for breaking changes:**
   - Review migration guide: https://react.dev/blog/2024/12/19/react-19
   - Common breaking changes:
     * `ReactDOM.createRoot()` changes
     * `ref` callback changes
     * Context provider API changes
   - Run type checking: `npm run typecheck`

4. **Verify builds:**
   - Run: `npm install`
   - Run: `npm run build`
   - Run: `npm run test` (if applicable)

5. **Update CLAUDE.md** with React 19 standardization status

### Decision Points

**Question**: Should we upgrade pastebin/workflowui/storybook to React 19 now?
- **Option A** (Recommended): Yes, full standardization
  - Pros: Single React version, simplified dependency tree
  - Cons: More testing, potential breaking changes
- **Option B**: Keep some on React 18
  - Pros: Fewer breaking changes
  - Cons: Multiple React versions in bundle, larger builds

### Success Criteria

- [ ] All production packages on React 19.2.3
- [ ] npm install succeeds without conflicts
- [ ] npm run build succeeds for all affected packages
- [ ] npm run test passes (if applicable)
- [ ] No console errors related to React 19 API changes
- [ ] Bundle size stable or improved

---

## Task 2: TypeScript Version Standardization (55+ files)

**Severity**: MEDIUM
**Effort**: 2-3 hours
**Files**: 55 package.json files identified in audit

### Current State

TypeScript version fragmentation:
- **Target**: ^5.9.3 (current stable)
- **Permissive**: ^5.0.0 (64% of files - too loose)
- **Pinned**: 5.9.3 (some files)
- **Various**: 5.8.x, 5.7.x in some legacy packages

### Files Needing Updates

From audit: 55 files using permissive `^5.0.0` or other versions

### Implementation Strategy

**Approach**: Use workspace-level standardization

1. **Update root package.json:**
   ```json
   {
     "devDependencies": {
       "typescript": "^5.9.3"
     }
   }
   ```

2. **Update all workspace package.json files:**
   ```bash
   # Script to find all ts versions
   grep -r '"typescript": ' --include="package.json" | grep -v node_modules | grep -v "5.9.3"
   ```

3. **For each file found:**
   - Change `"typescript": "^5.0.0"` → `"typescript": "^5.9.3"`
   - Change `"typescript": "5.8.x"` → `"typescript": "^5.9.3"`
   - Keep pinned versions if intentional (verify with team)

4. **Verify:**
   ```bash
   npm install
   npm run typecheck
   npm run build
   ```

### Execution Plan

**Phase 1: Identify all versions (15 min)**
```bash
grep -r '"typescript": ' --include="package.json" | grep -v node_modules | sort | uniq -c | sort -rn
```

**Phase 2: Create list of files to update (15 min)**
```bash
grep -r '"typescript": ' --include="package.json" | grep -v node_modules | grep -v "5.9.3" | cut -d: -f1 | sort -u > /tmp/typescript-updates.txt
```

**Phase 3: Update all files (30 min)**
- Manual update for precision
- Or use sed script for bulk replacement

**Phase 4: Verify (30 min)**
```bash
npm install
npm run build
npm run lint
npm run typecheck
```

### Success Criteria

- [ ] All package.json files use TypeScript 5.9.3
- [ ] No `^5.0.0` permissive ranges remain
- [ ] npm install succeeds
- [ ] npm run typecheck shows 0 errors
- [ ] npm run build succeeds for all packages

---

## Task 3: Add Prettier to 9 Missing Projects

**Severity**: MEDIUM
**Effort**: 1 hour
**Projects**: 9 identified

### Current State

Prettier configuration gaps:
- **Configured**: Most projects have Prettier
- **Missing**: 9 projects without explicit prettier dependency/config

### Projects Needing Prettier

From audit findings:
1. dbal/development
2. frontends/nextjs
3. frontends/qt6
4. postgres
5. codegen
6. pastebin
7. redux/hooks
8. redux/hooks-async
9. redux/api-clients

### Implementation Steps

1. **For each project without Prettier:**

   ```bash
   # Add Prettier as devDependency
   npm install --save-dev --workspace=<workspace> prettier

   # Create .prettierrc.json (if not exists)
   cat > .prettierrc.json << 'EOF'
   {
     "semi": false,
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100
   }
   EOF

   # Add format script to package.json (if not exists)
   ```

2. **Standardize configuration** across all projects:
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100,
     "tabWidth": 2,
     "useTabs": false
   }
   ```

3. **Add to npm scripts:**
   ```json
   {
     "format": "prettier --write .",
     "format:check": "prettier --check ."
   }
   ```

4. **Verify configuration:**
   ```bash
   npm run format:check
   npm run format (if changes needed)
   ```

### Success Criteria

- [ ] All 9 projects have prettier as devDependency
- [ ] All projects have .prettierrc.json (or root config)
- [ ] npm run format:check succeeds in all projects
- [ ] CI/CD includes `npm run format:check` validation

---

## Task 4: Testing Framework Consolidation Decision (Jest vs Vitest)

**Severity**: MEDIUM
**Effort**: 2 hours planning + implementation
**Decision Point**: Choose single testing framework

### Current State

Mixed testing frameworks:
- **Jest**: 11 packages (primary)
- **Vitest**: 5 packages (minority)
- **Config files**: Both vitest.config.ts and jest.config.js in some projects

### Why Consolidation Matters

1. **Maintenance burden**: Two test runners, two config syntaxes, two plugin ecosystems
2. **Developer experience**: Consistency across all projects
3. **CI/CD simplicity**: Single test command, unified reporting
4. **Bundle size**: Avoid dual testing framework overhead

### Decision Matrix

| Factor | Jest | Vitest |
|--------|------|--------|
| Stability | ✅ Production-grade, mature | ⚠️ Newer, fast iteration |
| Speed | Medium | ⚠️ Fast (preferred by some) |
| ESM Support | ⚠️ Via ts-jest | ✅ Native |
| React Testing | ✅ Mature ecosystem | ✅ Works well |
| npm install size | Large (29.7.0: ~900MB) | Medium (~600MB) |
| Vite Integration | ⚠️ Via ts-jest | ✅ Native |
| Configuration | Complex | Simple |
| Migration cost | Low (already majority) | High (convert 11 packages) |

### Recommendation

**Choose Jest** (Option A from audit):
- 11 packages already using Jest (70% of codebase)
- Lower migration cost (only convert 5 Vitest packages)
- Mature ecosystem for testing-library integration
- Better production track record

### Implementation (If Choosing Jest)

1. **Identify all Vitest packages:** (5 found)
   - dbal/development
   - frontends/nextjs
   - postgres
   - codegen/packages/spark-tools
   - codegen (if separate)

2. **For each Vitest package:**
   - Copy jest.config.js from existing Jest project
   - Replace vitest dependencies with jest dependencies
   - Update test scripts: `vitest` → `jest`
   - Delete vitest.config.ts files
   - Update @testing-library versions to match project standard

3. **Standardize all Jest configs:**
   - Use root jest.config.js as template
   - Apply to all 11+5 = 16 projects
   - Ensure testEnvironment, setupFiles, moduleNameMapper are consistent

4. **Verify:**
   ```bash
   npm install
   npm run test (all projects)
   npm run lint
   ```

### Success Criteria

- [ ] Decision documented and communicated
- [ ] If choosing Jest:
  - [ ] All 5 Vitest packages migrated to Jest
  - [ ] All vitest.config.ts files deleted
  - [ ] All test scripts use `jest` command
  - [ ] npm run test succeeds for all packages
  - [ ] Test coverage reports consistent
- [ ] If choosing Vitest:
  - [ ] All 11 Jest packages migrated to Vitest
  - [ ] All jest.config.js files replaced with vitest.config.ts
  - [ ] All test scripts use `vitest` command
  - [ ] npm install produces smaller node_modules

---

## Execution Roadmap

### Week 1: Planning & Scoping (4 hours)
- [ ] Task 1: Complete React 19 audit (1 hour)
- [ ] Task 2: Generate TypeScript update list (0.5 hour)
- [ ] Task 3: Verify Prettier projects list (0.5 hour)
- [ ] Task 4: Make Jest vs Vitest decision (2 hours)

### Week 2: Implementation (6-7 hours)
- [ ] Task 1: React 19 upgrades (2-3 hours)
- [ ] Task 2: TypeScript standardization (1.5 hours)
- [ ] Task 3: Add Prettier to missing projects (1 hour)
- [ ] Task 4: Testing framework migration (2+ hours if needed)

### Week 3: Verification & Finalization (1-2 hours)
- [ ] Comprehensive npm install test
- [ ] npm run build across all packages
- [ ] npm run test succeeds
- [ ] Commit and document changes

---

## Risk Assessment

### Task 1 (React 19): MEDIUM RISK
- **Risk**: Breaking changes in React 19 APIs
- **Mitigation**: Review migration guide, test each package incrementally
- **Rollback**: npm can downgrade quickly if issues found

### Task 2 (TypeScript): LOW RISK
- **Risk**: Version conflicts with dependencies
- **Mitigation**: npm will error if versions incompatible
- **Rollback**: Revert changes, no runtime impact

### Task 3 (Prettier): LOW RISK
- **Risk**: Code formatting conflicts with existing styles
- **Mitigation**: Use consistent .prettierrc across all projects
- **Rollback**: Remove Prettier, revert to manual formatting

### Task 4 (Testing): MEDIUM RISK
- **Risk**: Breaking test syntax changes during migration
- **Mitigation**: Migrate incrementally, run tests after each change
- **Rollback**: Keep old testing setup temporarily during transition

---

## Next Steps

1. **Validate this plan** with team
2. **Choose execution timeline** (this week, next month, etc.)
3. **Assign owners** for each task if working in parallel
4. **Schedule verification checkpoint** after each task completion
5. **Update CLAUDE.md** with completion status

---

## References

- **HIGH priority work completed**: `/txt/MEDIUM_PRIORITY_DEPENDENCY_TASKS_2026-01-24.md`
- **Full audit**: `/txt/DEPENDENCY_AUDIT_MASTER_INDEX_2026-01-23.txt`
- **Testing library audit**: `/txt/TESTING_LIBRARIES_AUDIT_2026-01-23.txt`
- **React migration**: https://react.dev/blog/2024/12/19/react-19
- **Jest docs**: https://jestjs.io/
- **Vitest docs**: https://vitest.dev/

---

**Last Reviewed**: 2026-01-24
**Next Review**: After MEDIUM priority work completion or when needed
