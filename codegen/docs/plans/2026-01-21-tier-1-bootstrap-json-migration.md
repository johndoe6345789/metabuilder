# Tier 1 Bootstrap Components JSON Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate 7 critical app bootstrap components (AppBootstrap, AppRouterBootstrap, AppLayout, AppRouterLayout, AppMainPanel, AppDialogs, LoadingScreen) from TSX to JSON-driven architecture to prove the JSON migration pattern works at the critical entry point.

**Architecture:** Each component will be converted using the established pattern: JSON definition + optional custom hook + TypeScript interface. The architecture leverages `createJsonComponent` (pure/stateless) and `createJsonComponentWithHooks` (stateful). Components are exported from `src/lib/json-ui/json-components.ts` rather than kept as TSX files in `src/components/`.

**Tech Stack:** React 18, TypeScript, custom hooks system (no wrapper files), JSON component factory functions, sonner for toasts, react-router-dom for routing.

---

## Tier 1 Components Overview

| Component | Type | Complexity | Hook Required | Status | Strategy |
|-----------|------|-----------|---|--------|-----------|
| LoadingScreen | Atom | Pure/Stateless | No | ✅ Already JSON | N/A |
| AppBootstrap | Organism | Minimal | Yes - useAppBootstrap | ✅ Keep TSX | BrowserRouter wrapper (10 lines) |
| AppRouterBootstrap | Organism | Minimal | Yes - useAppBootstrap | ✅ Keep TSX | BrowserRouter wrapper (10 lines) |
| AppLayout | Organism | Stateful | Yes - Multiple hooks | TSX → JSON | Migrate to JSON with useAppLayout hook |
| AppRouterLayout | Organism | Stateful | Yes - Multiple hooks | TSX → JSON | Migrate to JSON with useAppRouterLayout hook |
| AppMainPanel | Organism | Stateful | Yes - Multiple hooks | TSX → JSON | Migrate to JSON (pure, receives all props) |
| AppDialogs | Organism | Stateless* | No* | TSX → JSON | Migrate to JSON (pure, receives all props) |

**Rationale for hybrid approach:** BrowserRouter is a React Router provider not JSON-renderable. Keeping AppBootstrap/AppRouterBootstrap as minimal TSX wrappers is simpler and aligns with framework architecture. Focus JSON migration on layout and dialog composition components (5 components migrated).

---

## Task 1: Create Git Worktree for Tier 1

**Files:**
- Create: Git worktree `tier-1-bootstrap`
- Reference: Current branch `festive-mestorf`

**Step 1: Create isolated git worktree**

```bash
cd /Users/rmac/Documents/GitHub/low-code-react-app-b
git worktree add tier-1-bootstrap festive-mestorf
cd tier-1-bootstrap
```

Expected: New directory created with fresh checkout of `festive-mestorf` branch

**Step 2: Verify worktree state**

```bash
git status
```

Expected: Clean working tree on `festive-mestorf`, no uncommitted changes

**Step 3: Commit (worktree creation)**

No commit needed - this is infrastructure setup.

---

## Task 2: Keep AppBootstrap and AppRouterBootstrap as TSX Wrappers

**Files:**
- Keep: `src/components/app/AppBootstrap.tsx` (no changes)
- Keep: `src/components/app/AppRouterBootstrap.tsx` (no changes)
- Rationale: These are minimal BrowserRouter wrappers; JSON cannot render framework providers

**Step 1: Verify TSX files are already correct**

```bash
cat src/components/app/AppBootstrap.tsx
cat src/components/app/AppRouterBootstrap.tsx
```

Expected: Both files contain BrowserRouter wrapper pattern

**Step 2: Confirm these stay TSX**

No commits needed - these remain as TSX entry points.

**Step 3: Note for later**

These wrappers will be cleaned up during final refactoring if we consolidate to a single entry point.

---

## Task 3: Migrate AppLayout

**Files:**
- Current: `src/components/app/AppLayout.tsx`
- Create: `src/components/json-definitions/app-layout.json`
- Modify: `src/lib/json-ui/json-components.ts`

**Complexity Note:** AppLayout is the most complex Tier 1 component - it uses SidebarProvider, multiple hooks (useAppNavigation, useAppProject, useAppShortcuts), and prop drilling.

**Step 1: Create AppLayoutProps interface**

Create `src/lib/json-ui/interfaces/app-layout.ts`:

```typescript
export interface AppLayoutProps {
  // Props passed from parent
  // Most state comes from hooks, not props
}
```

**Step 2: Create custom hook for AppLayout state**

Create `src/hooks/use-app-layout.ts`:

```typescript
import { useState } from 'react'
import useAppNavigation from './use-app-navigation'
import useAppProject from './use-app-project'
import useAppShortcuts from './use-app-shortcuts'

export function useAppLayout() {
  const { currentPage, navigateToPage } = useAppNavigation()
  const {
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    featureToggles,
    fileOps,
    currentProject,
    handleProjectLoad,
    stateContext,
    actionContext,
  } = useAppProject()
  const { searchOpen, setSearchOpen, shortcutsOpen, setShortcutsOpen, previewOpen, setPreviewOpen } =
    useAppShortcuts({ featureToggles, navigateToPage })
  const [lastSaved] = useState<number | null>(() => Date.now())
  const [errorCount] = useState(0)

  return {
    currentPage,
    navigateToPage,
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    featureToggles,
    fileOps,
    currentProject,
    handleProjectLoad,
    stateContext,
    actionContext,
    searchOpen,
    setSearchOpen,
    shortcutsOpen,
    setShortcutsOpen,
    previewOpen,
    setPreviewOpen,
    lastSaved,
    errorCount,
  }
}
```

Update `src/hooks/index.ts` to export useAppLayout.

**Step 3: Register hook in hooks-registry**

Update `src/lib/json-ui/hooks-registry.ts`:

```typescript
import { useAppLayout } from '@/hooks/use-app-layout'

export const hooksRegistry = {
  useAppLayout,
  // ... rest
}
```

**Step 4: Create JSON definition**

This is complex - AppLayout uses SidebarProvider and renders:
- NavigationMenu (organism)
- AppMainPanel (organism)
- AppDialogs (organism)

**Important:** Use `"conditional"` pattern (NOT ConditionalRender component). Use `{ "source": "hookData.propertyName" }` for hook data binding.

Create `src/components/json-definitions/app-layout.json`:

```json
{
  "id": "app-layout",
  "type": "SidebarProvider",
  "props": {
    "defaultOpen": true
  },
  "children": [
    {
      "id": "nav-menu",
      "type": "NavigationMenu",
      "bindings": {
        "activeTab": { "source": "hookData.currentPage" },
        "onTabChange": { "source": "hookData.navigateToPage" },
        "featureToggles": { "source": "hookData.featureToggles" },
        "errorCount": { "source": "hookData.errorCount" }
      }
    },
    {
      "id": "sidebar-inset-wrapper",
      "type": "SidebarInset",
      "children": [
        {
          "id": "app-layout-main",
          "type": "div",
          "className": "h-screen flex flex-col bg-background",
          "children": [
            {
              "id": "main-panel",
              "type": "AppMainPanel",
              "bindings": {
                "currentPage": { "source": "hookData.currentPage" },
                "navigateToPage": { "source": "hookData.navigateToPage" },
                "featureToggles": { "source": "hookData.featureToggles" },
                "errorCount": { "source": "hookData.errorCount" },
                "lastSaved": { "source": "hookData.lastSaved" },
                "currentProject": { "source": "hookData.currentProject" },
                "onProjectLoad": { "source": "hookData.handleProjectLoad" },
                "onSearch": { "source": "hookData.setSearchOpen", "transform": "() => setSearchOpen(true)" },
                "onShowShortcuts": { "source": "hookData.setShortcutsOpen", "transform": "() => setShortcutsOpen(true)" },
                "onGenerateAI": { "source": "hookData.onGenerateAI" },
                "onExport": { "source": "hookData.onExport" },
                "onPreview": { "source": "hookData.setPreviewOpen", "transform": "() => setPreviewOpen(true)" },
                "onShowErrors": { "source": "hookData.navigateToPage", "transform": "() => navigateToPage('errors')" },
                "stateContext": { "source": "hookData.stateContext" },
                "actionContext": { "source": "hookData.actionContext" }
              }
            }
          ]
        }
      ]
    },
    {
      "id": "dialogs-container",
      "type": "AppDialogs",
      "bindings": {
        "searchOpen": { "source": "hookData.searchOpen" },
        "onSearchOpenChange": { "source": "hookData.setSearchOpen" },
        "shortcutsOpen": { "source": "hookData.shortcutsOpen" },
        "onShortcutsOpenChange": { "source": "hookData.setShortcutsOpen" },
        "previewOpen": { "source": "hookData.previewOpen" },
        "onPreviewOpenChange": { "source": "hookData.setPreviewOpen" },
        "files": { "source": "hookData.files" },
        "models": { "source": "hookData.models" },
        "components": { "source": "hookData.components" },
        "componentTrees": { "source": "hookData.componentTrees" },
        "workflows": { "source": "hookData.workflows" },
        "lambdas": { "source": "hookData.lambdas" },
        "playwrightTests": { "source": "hookData.playwrightTests" },
        "storybookStories": { "source": "hookData.storybookStories" },
        "unitTests": { "source": "hookData.unitTests" },
        "onNavigate": { "source": "hookData.navigateToPage" },
        "onFileSelect": { "source": "hookData.onFileSelect" }
      }
    }
  ]
}
```

**Step 5: Export AppLayout from json-components.ts**

```typescript
export const AppLayout = createJsonComponentWithHooks<AppLayoutProps>(
  appLayoutDef,
  {
    hooks: {
      hookData: {
        hookName: 'useAppLayout',
        args: (props) => [props]
      }
    }
  }
)
```

**Step 6: Update registry and delete TSX**

Add to registry:
```json
{
  "type": "AppLayout",
  "source": "app",
  "jsonCompatible": true
}
```

Update imports, verify build, delete TSX file.

**Step 7: Commit**

```bash
git add src/lib/json-ui/interfaces/app-layout.ts \
         src/lib/json-ui/interfaces/index.ts \
         src/hooks/use-app-layout.ts \
         src/hooks/index.ts \
         src/lib/json-ui/hooks-registry.ts \
         src/components/json-definitions/app-layout.json \
         src/lib/json-ui/json-components.ts \
         json-components-registry.json

git commit -m "feat: migrate AppLayout to JSON with useAppLayout hook"
```

Then delete TSX:

```bash
rm src/components/app/AppLayout.tsx
git add -A
git commit -m "feat: delete legacy AppLayout TSX file"
```

---

## Task 4: Migrate AppRouterLayout

**Files:**
- Current: `src/components/app/AppRouterLayout.tsx`
- Create: `src/components/json-definitions/app-router-layout.json`
- Create: `src/hooks/use-app-router-layout.ts`

**Step 1-7: Follow same pattern as AppLayout**

AppRouterLayout is nearly identical to AppLayout but:
- Does NOT use SidebarProvider
- Does NOT include NavigationMenu
- Renders div.h-screen with AppMainPanel and AppDialogs directly

Create `src/hooks/use-app-router-layout.ts` (identical to useAppLayout).

Create `src/components/json-definitions/app-router-layout.json`:

```json
{
  "id": "app-router-layout",
  "type": "div",
  "className": "h-screen flex flex-col bg-background",
  "children": [
    {
      "type": "AppMainPanel",
      "props": {
        // Same props mapping as AppLayout
      }
    },
    {
      "type": "AppDialogs",
      "props": {
        // Same props mapping as AppLayout
      }
    }
  ]
}
```

Export and register following same pattern.

---

## Task 5: Migrate AppMainPanel

**Files:**
- Current: `src/components/app/AppMainPanel.tsx`
- Create: `src/components/json-definitions/app-main-panel.json`
- Create: `src/lib/json-ui/interfaces/app-main-panel.ts`

**Note:** AppMainPanel primarily composes three things:
1. PWAStatusBar (from PWARegistry)
2. PWAUpdatePrompt (from PWARegistry)
3. AppHeader (organism - will be migrated later)
4. RouterProvider (global provider - may stay TSX)

**Step 1: Create interface**

```typescript
export interface AppMainPanelProps {
  currentPage: string
  navigateToPage: (page: string) => void
  featureToggles: FeatureToggles
  errorCount: number
  lastSaved: number | null
  currentProject: Project
  onProjectLoad: (project: Project) => void
  onSearch: () => void
  onShowShortcuts: () => void
  onGenerateAI: () => void
  onExport: () => void
  onPreview: () => void
  onShowErrors: () => void
  stateContext: any
  actionContext: any
}
```

**Step 2: Create JSON definition**

Since AppMainPanel primarily uses registry components (PWAStatusBar, AppHeader) and provider (RouterProvider), this is relatively straightforward:

```json
{
  "id": "app-main-panel",
  "type": "div",
  "children": [
    {
      "type": "Suspense",
      "props": {
        "fallback": {
          "type": "div",
          "className": "h-1 bg-primary animate-pulse"
        }
      },
      "children": [
        {
          "type": "PWAStatusBar"
        }
      ]
    },
    {
      "type": "Suspense",
      "props": {
        "fallback": null
      },
      "children": [
        {
          "type": "PWAUpdatePrompt"
        }
      ]
    },
    {
      "type": "AppHeader",
      "props": {
        "activeTab": { "source": "props.currentPage" },
        "onTabChange": { "source": "props.navigateToPage" },
        "featureToggles": { "source": "props.featureToggles" },
        "errorCount": { "source": "props.errorCount" },
        "lastSaved": { "source": "props.lastSaved" },
        "currentProject": { "source": "props.currentProject" },
        "onProjectLoad": { "source": "props.onProjectLoad" },
        "onSearch": { "source": "props.onSearch" },
        "onShowShortcuts": { "source": "props.onShowShortcuts" },
        "onGenerateAI": { "source": "props.onGenerateAI" },
        "onExport": { "source": "props.onExport" },
        "onPreview": { "source": "props.onPreview" },
        "onShowErrors": { "source": "props.onShowErrors" }
      }
    },
    {
      "id": "main-content",
      "type": "div",
      "className": "flex-1 overflow-hidden",
      "children": [
        {
          "type": "RouterProvider",
          "props": {
            "featureToggles": { "source": "props.featureToggles" },
            "stateContext": { "source": "props.stateContext" },
            "actionContext": { "source": "props.actionContext" }
          }
        }
      ]
    }
  ]
}
```

**Step 3: Export as pure JSON component**

```typescript
export const AppMainPanel = createJsonComponent<AppMainPanelProps>(appMainPanelDef)
```

**Step 4: Update registry and migrate**

---

## Task 6: Migrate AppDialogs

**Files:**
- Current: `src/components/app/AppDialogs.tsx`
- Create: `src/components/json-definitions/app-dialogs.json`
- Create: `src/lib/json-ui/interfaces/app-dialogs.ts`

**Note:** AppDialogs is primarily a container for registry-sourced dialogs with conditional rendering based on props.

**Step 1: Create interface**

```typescript
export interface AppDialogsProps {
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  shortcutsOpen: boolean
  onShortcutsOpenChange: (open: boolean) => void
  previewOpen: boolean
  onPreviewOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: PrismaModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (page: string) => void
  onFileSelect: (fileId: string) => void
}
```

**Step 2: Create JSON definition**

```json
{
  "id": "app-dialogs",
  "type": "div",
  "children": [
    {
      "type": "Suspense",
      "props": {
        "fallback": null
      },
      "children": [
        {
          "type": "GlobalSearch",
          "props": {
            "open": { "source": "props.searchOpen" },
            "onOpenChange": { "source": "props.onSearchOpenChange" },
            "files": { "source": "props.files" },
            "models": { "source": "props.models" },
            "components": { "source": "props.components" },
            "componentTrees": { "source": "props.componentTrees" },
            "workflows": { "source": "props.workflows" },
            "lambdas": { "source": "props.lambdas" },
            "playwrightTests": { "source": "props.playwrightTests" },
            "storybookStories": { "source": "props.storybookStories" },
            "unitTests": { "source": "props.unitTests" },
            "onNavigate": { "source": "props.onNavigate" },
            "onFileSelect": { "source": "props.onFileSelect" }
          }
        }
      ]
    },
    {
      "type": "Suspense",
      "props": {
        "fallback": null
      },
      "children": [
        {
          "type": "KeyboardShortcutsDialog",
          "props": {
            "open": { "source": "props.shortcutsOpen" },
            "onOpenChange": { "source": "props.onShortcutsOpenChange" }
          }
        }
      ]
    },
    {
      "type": "Suspense",
      "props": {
        "fallback": null
      },
      "children": [
        {
          "type": "PreviewDialog",
          "props": {
            "open": { "source": "props.previewOpen" },
            "onOpenChange": { "source": "props.onPreviewOpenChange" }
          }
        }
      ]
    },
    {
      "type": "Suspense",
      "props": {
        "fallback": null
      },
      "children": [
        {
          "type": "PWAInstallPrompt"
        }
      ]
    }
  ]
}
```

**Step 3: Export as pure JSON component**

```typescript
export const AppDialogs = createJsonComponent<AppDialogsProps>(appDialogsDef)
```

**Step 4: Follow standard migration pattern**

---

## Task 7: Verify Build and Run Tests

**Files:**
- Run: `npm run build`
- Run: `npm test`

**Step 1: Build**

```bash
npm run build 2>&1 | tee build-output.log
echo "Build exit code: $?"
```

Expected: Exit code 0, no errors

**Step 2: Run type checker**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Expected: No TypeScript errors

**Step 3: Run tests (if applicable)**

```bash
npm test 2>&1 | tail -30
```

Expected: All tests pass or show expected failures

**Step 4: Commit if successful**

```bash
git add -A
git commit -m "feat: complete Tier 1 bootstrap components JSON migration - build verified"
```

---

## Task 8: Create Pull Request

**Files:**
- Reference: Recent commit hashes
- Target: `main` branch

**Step 1: View recent commits**

```bash
git log --oneline -10
```

Expected: See series of commits for Tier 1 components

**Step 2: Create PR**

```bash
gh pr create \
  --title "feat: migrate Tier 1 bootstrap components to JSON" \
  --body "Completes JSON migration for critical bootstrap path:

- AppBootstrap (with useAppBootstrap hook)
- AppRouterBootstrap (with useAppBootstrap hook)
- AppLayout (with useAppLayout hook)
- AppRouterLayout (with useAppRouterLayout hook)
- AppMainPanel (pure component)
- AppDialogs (pure component)
- LoadingScreen (already JSON)

All components now use JSON-driven architecture. Build verified." \
  --base main \
  --head tier-1-bootstrap
```

Expected: PR created with link

**Step 3: Commit**

No commit - PR creation complete.

---

## Architecture Validation Checklist

After all 7 components are migrated, verify:

- [ ] No imports of `@/components/app/` components exist in codebase (except app.tsx entry)
- [ ] All components exported from `@/lib/json-ui/json-components`
- [ ] Build succeeds with `npm run build`
- [ ] Type checking passes with `npx tsc --noEmit`
- [ ] All custom hooks registered in `hooks-registry.ts`
- [ ] Component registry updated with all new entries
- [ ] All JSON definitions are valid JSON (jq verification)
- [ ] PR merged to `main`

---

## Next Steps (After Tier 1)

Once Tier 1 is complete:

1. **Tier 2 - Organisms** (3 components):
   - DataSourceManager
   - NavigationMenu
   - TreeListPanel

2. **Tier 3 - Core Atoms/Molecules** (150+ in batches):
   - Batch by size/complexity
   - Reuse established patterns

---

## Key Decision Points

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hook pattern | `createJsonComponentWithHooks` | Centralizes stateful logic, no wrapper files needed |
| Hook location | `src/hooks/` | Organized, follows existing pattern |
| JSON definitions | `src/components/json-definitions/` | Clear separation from legacy TSX |
| Interface files | One per component in `src/lib/json-ui/interfaces/` | Matches established convention |
| Registry location | `json-components-registry.json` | Single source of truth |

