# FakeMUI Final Verification Plan

> **For Claude:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Verify that all FakeMUI directory restructuring is complete and all import paths work correctly across the entire codebase.

**Architecture:** Run comprehensive verification checks on directory structure, import paths, and build systems to ensure no legacy terminology remains.

**Tech Stack:** TypeScript, npm, grep, file system operations

---

## Task 1: Verify Directory Structure

**Files:**
- Check: `fakemui/`
- Verify: qml/components/, qml/hybrid/, utilities/, wip/
- Check: No `legacy/` or `python/fakemui/` directories exist

**Step 1: Verify no legacy directories exist**

```bash
cd /Users/rmac/Documents/metabuilder
# Should return nothing
find fakemui -type d -name "legacy" -o -type d -name "python"
```

Expected: No output (0 results)

**Step 2: Verify first-class directories exist**

```bash
ls -la fakemui/ | grep -E "qml|utilities|wip|icons|styles"
```

Expected: All four directories present (qml/, utilities/, wip/, icons/, styles/)

**Step 3: Verify QML subdirectories**

```bash
ls -la fakemui/qml/
```

Expected: components/, hybrid/, widgets/, qmldir

**Step 4: Commit verification**

```bash
git log --oneline fakemui/ | head -5
```

Expected: Most recent commit mentions "Directory restructuring" or similar

---

## Task 2: Verify All Import Paths

**Files:**
- Modify: Nothing (read-only verification)
- Check: fakemui/index.ts, all TypeScript imports across codebase

**Step 1: Verify barrel export structure**

```bash
head -50 fakemui/index.ts
```

Expected: All imports reference `./react/components/`, `./utilities/`, `./wip/`, not legacy paths

**Step 2: Search for legacy import paths (workflowui)**

```bash
grep -r "legacy/utilities\|legacy/migration\|qml-components\|components-legacy" \
  workflowui/ codegen/ pastebin/ frontends/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: No results (0 matches)

**Step 3: Search for legacy paths in entire codebase**

```bash
grep -r "fakemui/legacy\|fakemui/python" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null | grep -v node_modules | grep -v ".git"
```

Expected: No results (0 matches)

**Step 4: Verify qmldir paths**

```bash
head -20 fakemui/qmldir
```

Expected: All paths use `fakemui.components.*`, `fakemui.hybrid.*`, not old naming

**Step 5: Commit**

```bash
git status
```

Expected: Clean working tree (no changes needed)

---

## Task 3: Verify Build Systems

**Files:**
- Check: fakemui/package.json
- Check: root package.json workspaces

**Step 1: Verify FakeMUI package exports**

```bash
cat fakemui/package.json | grep -A 20 '"exports"'
```

Expected: Exports define main entry and utilities, wip paths correctly

**Step 2: Verify workspace configuration**

```bash
cat package.json | grep -A 10 '"workspaces"'
```

Expected: fakemui listed in workspaces

**Step 3: Install and verify imports work**

```bash
cd /Users/rmac/Documents/metabuilder
npm install
```

Expected: Install succeeds, no dependency errors related to fakemui

**Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit fakemui/index.ts
```

Expected: 0 errors, 0 warnings

**Step 5: Commit**

```bash
git status
```

Expected: Clean working tree

---

## Task 4: Verify FakeMUI Component Usage

**Files:**
- Check: workflowui/src/
- Verify: All FakeMUI imports use correct paths

**Step 1: Find all FakeMUI imports in workflowui**

```bash
grep -r "from '@metabuilder/fakemui\|from '@metabuilder/fakemui/utilities" \
  workflowui/src/ --include="*.ts" --include="*.tsx" | head -20
```

Expected: All imports from correct paths (no legacy references)

**Step 2: Verify no direct component imports**

```bash
grep -r "from '@metabuilder/fakemui/legacy\|from '@metabuilder/fakemui/qml\|from '@metabuilder/fakemui/utilities" \
  workflowui/src/ --include="*.tsx" 2>/dev/null | wc -l
```

Expected: 0 (or only utilities imports, which are correct)

**Step 3: Build workflowui**

```bash
cd workflowui && npm run build
```

Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git status
```

Expected: Clean working tree

---

## Task 5: Documentation Verification

**Files:**
- Check: fakemui/STRUCTURE.md
- Check: CLAUDE.md (root)
- Verify: All path references are current

**Step 1: Verify STRUCTURE.md has no legacy references**

```bash
grep -i "legacy\|migration-in-progress\|qml-components" fakemui/STRUCTURE.md
```

Expected: No results (0 matches)

**Step 2: Verify CLAUDE.md FakeMUI section**

```bash
grep -A 20 "FakeMUI Guide\|FakeMUI Directory" CLAUDE.md
```

Expected: All paths reference first-class directories (qml/hybrid/, utilities/, wip/)

**Step 3: Check email-wip/ status**

```bash
ls -la fakemui/ | grep -i email
```

Expected: email-wip/ directory should NOT exist (FakeMUI components moved back to main)

**Step 4: Verify email components in proper location**

```bash
ls -la fakemui/react/components/ | grep -i email
```

Expected: No email/ subdirectory (components mixed with other categories or in separate file)

**Step 5: Commit if needed**

```bash
git status
```

Expected: Clean working tree

---

## Verification Success Criteria

✅ All tasks pass when:
1. No `legacy/`, `migration-in-progress/`, or `python/fakemui/` directories exist
2. All QML components use `qml/components/` and `qml/hybrid/` paths
3. All TypeScript imports reference correct barrel exports
4. No legacy path imports found anywhere in codebase
5. FakeMUI builds and installs correctly
6. workflowui builds with no FakeMUI-related errors
7. All documentation updated with new paths
8. Git status is clean (no uncommitted changes)

If any task fails, provide detailed error output and we'll create a follow-up fix plan.
