# Complete Migration Strategy - Remaining Work

## The Goal
**End state: Only `src/main.tsx` and `src/index.html` as TSX/HTML**
- Everything else in `src/components/` → JSON + custom hooks

## Current Reality (After Today's Work)

```
Completed: 9 components (8 atoms + 1 molecule)
├── Accordion, CopyButton, FileUpload, FilterInput, Image, Input, PasswordInput, Popover (atoms)
└── BindingEditor (molecule)

Remaining: ~220 TSX files (excluding main.tsx and demo/showcase pages)
├── 3 organisms: DataSourceManager, NavigationMenu, TreeListPanel
├── 110+ atoms: ActionButton, ActionCard, Alert, Button, Card, etc.
├── 35+ molecules: AppBranding, ComponentTree, PropertyEditor, etc.
├── 7 app bootstrap components: AppBootstrap, AppLayout, etc.
└── 55+ demo/showcase pages
```

## Priority Tiers

### Tier 1: Core App Bootstrap (7 files - High Impact)
**These are used by every page. Converting them unblocks everything.**

1. `src/components/app/AppBootstrap.tsx`
   - Uses: `useAppBootstrap` hook
   - Action: Create JSON, register hook, export, delete TSX
   
2. `src/components/app/AppLayout.tsx`
   - Action: Same pattern
   
3. `src/components/app/LoadingScreen.tsx`
   - Likely stateless UI component
   - Action: Convert to pure JSON
   
4. `src/components/app/AppDialogs.tsx`
   - Action: Assess and migrate
   
5. `src/components/app/AppMainPanel.tsx`
   - Action: Assess and migrate
   
6. `src/components/app/AppRouterBootstrap.tsx`
   - Router mode variant of bootstrap
   
7. `src/components/app/AppRouterLayout.tsx`
   - Router mode variant of layout

**Impact:** Converting these 7 components would eliminate the need for TSX anywhere in the bootstrap flow

### Tier 2: 3 Documented Organisms (3 files - Medium Impact)
**Mentioned in CLAUDE.md as remaining work**

1. `src/components/organisms/DataSourceManager.tsx`
2. `src/components/organisms/NavigationMenu.tsx`
3. `src/components/organisms/TreeListPanel.tsx`

**Impact:** Completes the documented migration targets

### Tier 3: Core UI Atoms & Molecules (150+ files - Large Scale)
**The bulk of component library**

**Atoms** (~110 files):
- ActionButton, ActionCard, Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Checkbox, CommandPalette, DatePicker, Dialog, Divider, Drawer, EmptyState, FileIcon, Form, Grid, Heading, HoverCard, Input, Kbd, Label, Link, List, Menu, Modal, NumberInput, PasswordInput, Popover, ProgressBar, Radio, RangeSlider, Rating, ScrollArea, SearchInput, Select, Separator, Skeleton, Slider, Stack, Switch, Table, Tabs, Tag, Text, TextArea, Toggle, Tooltip, TreeIcon, etc.

**Molecules** (~35 files):
- AppBranding, CanvasRenderer, ComponentTree, ComponentPalette, PropertyEditor, SearchBar, ToolbarButton, TreeFormDialog, etc.

**Current strategy:** These have JSON definitions in `src/config/pages/` but aren't yet exported from `json-components.ts`. Need to:
1. Create JSON definitions in `src/components/json-definitions/` (if not already there)
2. Create TypeScript interfaces
3. Register hooks (if stateful)
4. Export from `json-components.ts`
5. Delete TSX files

### Tier 4: Demo/Showcase Pages (55+ files - No Impact on App)
**These are development/demo utilities**

Examples:
- AtomicComponentShowcase.tsx
- JSONConversionShowcase.tsx
- DashboardDemoPage.tsx
- DataBindingDesigner.tsx
- JSONFlaskDesigner.tsx
- etc.

**Decision:** These are optional. Could be:
- Converted to JSON (least effort)
- Deleted if not needed
- Left as-is if they're development tools

## Recommended Execution Order

### Phase 1: Bootstrap (Highest ROI)
1. **AppBootstrap** → JSON + useAppBootstrap hook
2. **AppLayout** → JSON + appropriate hooks
3. **LoadingScreen** → Pure JSON
4. Repeat for other 4 app components

**Why first:** These are on the critical path. Every app render goes through them. Converting them proves the architecture works for complex components.

**Expected time:** 2-3 hours

### Phase 2: Documented Organisms
1. **DataSourceManager** → JSON + hooks
2. **NavigationMenu** → JSON + hooks  
3. **TreeListPanel** → JSON + hooks

**Why next:** Completes the documented migration targets from CLAUDE.md

**Expected time:** 2-3 hours

### Phase 3: Core Component Library (If Time/Priority)
**Option A: Batch similar components**
- All simple buttons/links as one batch
- All inputs as one batch
- All containers/layouts as one batch

**Option B: Focus on most-used**
- Button, Input, Card, Dialog, Menu → highest impact
- Others as needed

**Expected time:** 8-20 hours (depending on thoroughness)

### Phase 4: Demo Pages (Nice-to-have)
Convert or delete as appropriate. Low priority.

## Pattern to Follow (Proven)

For each component:

```bash
# 1. Create/verify JSON definition
src/components/json-definitions/[component].json

# 2. Create/verify TypeScript interface  
src/lib/json-ui/interfaces/[component].ts

# 3. If stateful, create custom hook
src/hooks/use-[component].ts
# Then register in hooks-registry.ts
# Then export from hooks/index.ts

# 4. Export from json-components.ts
export const ComponentName = createJsonComponent[WithHooks]<Props>(def, ...)

# 5. Update registry entry
json-components-registry.json

# 6. Delete legacy TSX
rm src/components/[category]/[ComponentName].tsx

# 7. Update index.ts exports
src/components/[category]/index.ts

# 8. Update all imports across codebase
# From: import { X } from '@/components/...'
# To: import { X } from '@/lib/json-ui/json-components'

# 9. Verify build passes
npm run build
```

## Parallel Work Opportunities

**Can work on simultaneously:**
- AppBootstrap + AppLayout (independent)
- DataSourceManager + NavigationMenu (independent)
- Multiple atoms in parallel (Button, Input, Card, Dialog don't depend on each other)

**Must sequence:**
- ChildComponent → ParentComponent (parent depends on child)
- Example: Button must be JSON before ButtonGroup

## Success Metrics

**Current State:**
- 22 JSON components exported
- 230 TSX files remaining
- Build passes ✅

**Phase 1 Success:**
- 29+ JSON components (added 7 app bootstrap)
- 223 TSX files remaining
- Build passes ✅

**Phase 2 Success:**
- 32+ JSON components (added 3 organisms)
- 220 TSX files remaining
- Build passes ✅

**Phase 3 Success (Core Library):**
- 150+ JSON components
- 75 TSX files remaining (mostly demo pages)
- Build passes ✅

**Final State (Full Migration):**
- 200+ JSON components
- 2 TSX files (main.tsx + ErrorFallback.tsx as optional)
- 1 HTML file (index.html)
- Build passes ✅

## Key Advantages Once Complete

1. **No component duplication** - Single source of truth (JSON)
2. **Easier maintenance** - All components follow same pattern
3. **Better code reuse** - Hooks shared across components
4. **Smaller bundle** - JSON more compressible than TSX
5. **Faster iteration** - Change JSON, no rebuild needed (with hot reload)
6. **Better tooling** - Can build JSON editing UI without code knowledge

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking changes | Run tests frequently, commit after each component |
| Performance regression | Monitor bundle size, hook performance |
| Import path issues | Use find-replace to update all imports systematically |
| Circular dependencies | Review `src/lib/json-ui/` structure before major changes |
| Hook registration errors | Test each hook in hooks-registry before moving to next |

## Next Immediate Steps

1. **Run audit** to get baseline
   ```bash
   npm run audit:json
   ```

2. **Pick one app bootstrap component** (e.g., LoadingScreen - simplest)

3. **Follow the pattern** from today's work with Accordion/BindingEditor

4. **Commit after each component** with clear message

5. **Run tests** to catch regressions

