# FakeMUI Folder Reorganization Guide
**Purpose**: Clean up messy structure, remove legacy code, establish clear organization
**Time**: ~30 minutes to execute
**Risk**: Low (backup before changes)

---

## STEP-BY-STEP REORGANIZATION

### Phase 1: Backup & Preparation
```bash
# Create backup of current state
cd /Users/rmac/Documents/metabuilder
git add fakemui/
git commit -m "backup: fakemui structure before reorganization"

# Create new structure in parallel
mkdir -p fakemui/src/{components,icons,theming,styles,utils}
```

### Phase 2: Move React Components to src/
```bash
# Move component directories (organized by category)
mv fakemui/fakemui/atoms            fakemui/src/components/atoms
mv fakemui/fakemui/data-display     fakemui/src/components/data-display
mv fakemui/fakemui/feedback         fakemui/src/components/feedback
mv fakemui/fakemui/inputs           fakemui/src/components/inputs
mv fakemui/fakemui/layout           fakemui/src/components/layout
mv fakemui/fakemui/navigation       fakemui/src/components/navigation
mv fakemui/fakemui/surfaces         fakemui/src/components/surfaces
mv fakemui/fakemui/utils            fakemui/src/components/utils
mv fakemui/fakemui/lab              fakemui/src/components/lab
mv fakemui/fakemui/x                fakemui/src/components/x
mv fakemui/fakemui/workflows        fakemui/src/components/workflows

# Move icons
mv fakemui/icons                    fakemui/src/icons

# Move theming
mv fakemui/fakemui/theming          fakemui/src/theming

# Merge styles
mv fakemui/styles                   fakemui/src/styles
# (Delete fakemui/scss afterward - not needed)
```

### Phase 3: Clean Up Orphaned/Duplicate Files
```bash
# Delete legacy QML directories
rm -rf fakemui/qml-components
rm -rf fakemui/contexts
rm -rf fakemui/core
rm -rf fakemui/widgets
rm -rf fakemui/theming    (the old QML one)

# Delete old component JSX
rm -rf fakemui/components

# Delete legacy SCSS
rm -rf fakemui/scss

# Delete Python files
rm fakemui/fakemui/*.py
rm fakemui/fakemui/demo.py

# Delete old src directory (after utilities merged)
rm -rf fakemui/src/styles fakemui/src/utils
# (Already moved to fakemui/src/styles)

# Clean up empty fakemui/fakemui directory
rm -rf fakemui/fakemui
```

### Phase 4: Update index.ts Exports

**File**: `fakemui/index.ts`

```typescript
// Old structure
export * from './fakemui/atoms'
export * from './fakemui/data-display'
// ...

// New structure
export * from './src/components/atoms'
export * from './src/components/data-display'
export * from './src/components/feedback'
export * from './src/components/inputs'
export * from './src/components/layout'
export * from './src/components/navigation'
export * from './src/components/surfaces'
export * from './src/components/utils'
export * from './src/components/lab'
export * from './src/components/x'
export * from './src/components/workflows'

// Icons
export * from './src/icons'

// Theming
export * from './src/theming'

// Utils
export { default as classNames } from './src/utils/classNames'
export * from './src/utils'
```

### Phase 5: Update Internal Imports

**In each component file** that has relative imports:

```typescript
// Old
import { Box } from '../../utils/Box'

// New
import { Box } from '../utils/Box'
```

**Scope**: Check all TSX files in:
- `fakemui/src/components/*/` (all subdirs)
- `fakemui/src/theming/`
- `fakemui/src/icons/`

### Phase 6: Verify Icon index.ts

**File**: `fakemui/src/icons/index.ts`

Should export all 330+ icon components:
```typescript
export { default as AccessTime } from './AccessTime'
export { default as AccountCircle } from './AccountCircle'
// ... (all icons)
```

### Phase 7: Test Imports in Consuming Projects

**In workflowui**:
```bash
cd frontends/workflowui

# Check if imports still resolve
npm run typecheck

# Look for import errors
npm run build
```

**In nextjs**:
```bash
cd frontends/nextjs

# Test registry still works
npm run typecheck
npm run build
```

### Phase 8: Final Cleanup

```bash
# Delete legacy documentation files
rm fakemui/CODE_REVIEW.md       (if outdated)
rm fakemui/SCSS_REVIEW.md       (if outdated)
rm fakemui/TYPESCRIPT_MIGRATION.md (if outdated)
rm fakemui/COMPONENT_MAPPING.md (if outdated)

# Keep these (relevant):
# - README.md
# - COMPONENT_GUIDE.md
# - MIGRATION_SUMMARY.md
# - LICENSE
# - package.json
# - tsconfig.json
```

---

## FINAL STRUCTURE

```
fakemui/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── AutoGrid.tsx
│   │   │   ├── EditorWrapper.tsx
│   │   │   ├── Heading.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Panel.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── StatBadge.tsx
│   │   │   ├── States.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Title.tsx
│   │   │   └── index.js
│   │   ├── data-display/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── List.tsx
│   │   │   ├── Markdown.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── TreeView.tsx
│   │   │   ├── Typography.tsx
│   │   │   └── index.js
│   │   ├── feedback/
│   │   │   ├── Alert.tsx
│   │   │   ├── Backdrop.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Snackbar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.js
│   │   ├── inputs/
│   │   │   ├── Autocomplete.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── ButtonGroup.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Fab.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FormControl.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── FormGroup.tsx
│   │   │   ├── FormHelperText.tsx
│   │   │   ├── FormLabel.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── InputBase.tsx
│   │   │   ├── NativeSelect.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── Rating.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   ├── ToggleButton.tsx
│   │   │   └── index.js
│   │   ├── layout/
│   │   │   ├── Box.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── Flex.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── ImageList.tsx
│   │   │   ├── Stack.tsx
│   │   │   └── index.js
│   │   ├── navigation/
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Link.tsx
│   │   │   ├── Menu.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SpeedDial.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── index.js
│   │   ├── surfaces/
│   │   │   ├── Accordion.tsx
│   │   │   ├── AppBar.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Paper.tsx
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── ClickAwayListener.tsx
│   │   │   ├── CssBaseline.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── GlobalStyles.tsx
│   │   │   ├── Iframe.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NoSsr.tsx
│   │   │   ├── Popover.tsx
│   │   │   ├── Popper.tsx
│   │   │   ├── Portal.tsx
│   │   │   ├── TextareaAutosize.tsx
│   │   │   ├── ToastContext.tsx
│   │   │   ├── Transitions.tsx
│   │   │   ├── classNames.js
│   │   │   ├── useMediaQuery.js
│   │   │   └── index.js
│   │   ├── lab/
│   │   │   ├── LoadingButton.tsx
│   │   │   ├── Masonry.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── TreeView.tsx
│   │   │   └── index.js
│   │   ├── x/
│   │   │   ├── DataGrid.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── index.js
│   │   └── workflows/
│   │       ├── index.ts
│   │       └── WorkflowCard/
│   ├── icons/
│   │   ├── AccessTime.tsx
│   │   ├── AccountCircle.tsx
│   │   ├── ... (330+ icons)
│   │   ├── ZoomOutMap.tsx
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── README.md
│   ├── theming/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── atoms/         (SCSS components)
│   │   ├── base.scss
│   │   ├── components.scss
│   │   ├── global/
│   │   ├── global.scss
│   │   ├── mixins/
│   │   ├── theme.scss
│   │   └── ... (other SCSS files)
│   └── utils/
│       ├── classNames.ts
│       ├── accessibility.ts
│       └── index.ts
├── index.ts              (Main export file - NEW)
├── package.json
├── tsconfig.json
├── README.md
├── COMPONENT_GUIDE.md
├── MIGRATION_SUMMARY.md
├── LICENSE
└── .gitignore
```

---

## VALIDATION STEPS

### 1. Check Exports Work
```bash
cd fakemui
npm run build    # If build script exists
npm test         # If tests exist
```

### 2. Check workflowui Imports
```bash
cd frontends/workflowui
npm install
npm run typecheck
npm run build

# Look for import errors related to fakemui
```

### 3. Check nextjs Imports
```bash
cd frontends/nextjs
npm install
npm run typecheck
npm run build

# Test fakemui-registry.ts still works
```

### 4. Verify All Icons Load
```bash
# In any project using fakemui
import * as Icons from '@/fakemui/icons'

// Check that Icons object has 330+ entries
console.log(Object.keys(Icons).length)
```

### 5. Git Verification
```bash
cd /Users/rmac/Documents/metabuilder
git status          # Should show reorganized structure
git diff --stat     # Check what changed
```

---

## ROLLBACK PLAN (If Needed)

```bash
# If something breaks, revert the commit
git reset --hard HEAD~1

# Or selective revert of specific changes
git checkout HEAD -- fakemui/index.ts
```

---

## NOTES

### Why This Structure?
- **src/components/** - Standard web framework pattern (React projects)
- **Grouped by function** - Find related components easily
- **No legacy code** - Cleaner, faster to navigate
- **Clear imports** - All exports from top-level index.ts
- **Icons separate** - 330+ icons don't clutter components

### Import Changes
Before:
```typescript
import { Button } from 'fakemui/Button'
import { Box } from 'fakemui/layout/Box'
```

After:
```typescript
import { Button, Box } from 'fakemui'
```

### Files to Keep vs Delete
**KEEP**:
- All `.tsx` files (React components)
- All `.ts` files (TypeScript utilities)
- `package.json`, `tsconfig.json`
- `README.md`, `COMPONENT_GUIDE.md`
- `.js` index files (exports)
- SCSS files in `styles/`

**DELETE**:
- All `.py` files (Python)
- All `.qml` files (QML/Qt)
- `scss/` directory (old Material v2)
- Legacy documentation files
- Duplicate context/core/widget directories

---

## SUCCESS CRITERIA

✅ All component imports work in consuming projects
✅ All 330+ icons export correctly
✅ Theming system accessible
✅ TypeScript compilation clean
✅ No broken relative imports
✅ workflowui builds successfully
✅ nextjs builds successfully
✅ No git conflicts

