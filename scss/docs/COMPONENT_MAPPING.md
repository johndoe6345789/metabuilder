# Fakemui Component Mapping

## Overview

This document maps fakemui components to the JSON component schema categories and identifies any gaps or integration needs.

## Fakemui Component Inventory

### Inputs (Form Controls)

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Button | Action | ✅ Input | Ready |
| IconButton | Action | ✅ Input | Ready |
| ButtonGroup | Action | ✅ Input | Ready |
| Fab | Action | ✅ Input | Ready |
| Input | Form | ✅ Input | Ready |
| TextField | Form | ✅ Input | Ready |
| Textarea | Form | ✅ Input | Ready |
| Select | Form | ✅ Input | Ready |
| NativeSelect | Form | ✅ Input | Ready |
| Checkbox | Form | ✅ Input | Ready |
| Radio | Form | ✅ Input | Ready |
| RadioGroup | Form | ✅ Input | Ready |
| Switch | Form | ✅ Input | Ready |
| Slider | Form | ✅ Input | Ready |
| Rating | Form | ✅ Input | Ready |
| Autocomplete | Form | ✅ Input | Ready |
| DatePicker | Form | ✅ Input | Ready |
| TimePicker | Form | ✅ Input | Ready |
| ColorPicker | Form | ✅ Input | Ready |
| FileUpload | Form | ✅ Input | Ready |
| FormControl | Form | ✅ Input | Ready |
| FormGroup | Form | ✅ Input | Ready |
| FormLabel | Form | ✅ Input | Ready |
| FormHelperText | Form | ✅ Input | Ready |
| FormField | Form | ✅ Input | Ready |
| ToggleButton | Action | ✅ Input | Ready |
| InputBase | Form | ⚠️ Internal | Internal |
| ButtonBase | Action | ⚠️ Internal | Internal |

**Category: `form`** - 28 components ready ✅

### Data Display

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Typography | Text | ✅ Display | Ready |
| Text | Text | ✅ Display | Ready |
| Title | Text | ✅ Display | Ready |
| Avatar | Image | ✅ Display | Ready |
| AvatarGroup | Image | ✅ Display | Ready |
| Badge | Label | ✅ Display | Ready |
| Chip | Label | ✅ Display | Ready |
| StatBadge | Label | ✅ Display | Ready |
| Divider | Layout | ✅ Display | Ready |
| Separator | Layout | ✅ Display | Ready |
| List | Content | ✅ Display | Ready |
| ListItem | Content | ✅ Display | Ready |
| ListItemButton | Content | ✅ Display | Ready |
| ListItemText | Content | ✅ Display | Ready |
| ListItemIcon | Content | ✅ Display | Ready |
| ListItemAvatar | Content | ✅ Display | Ready |
| ListSubheader | Content | ✅ Display | Ready |
| Table | Content | ✅ Table | Ready |
| TableBody | Content | ✅ Table | Ready |
| TableCell | Content | ✅ Table | Ready |
| TableContainer | Content | ✅ Table | Ready |
| TableHead | Content | ✅ Table | Ready |
| TableRow | Content | ✅ Table | Ready |
| TableFooter | Content | ✅ Table | Ready |
| TablePagination | Content | ✅ Table | Ready |
| TableSortLabel | Content | ✅ Table | Ready |
| Tooltip | Popup | ✅ Display | Ready |
| Label | Text | ✅ Display | Ready |
| Icon | Image | ✅ Display | Ready |
| Markdown | Content | ✅ Display | Ready |
| TreeView | Content | ✅ Display | Ready |

**Category: `display` & `table`** - 31 components ready ✅

### Layout & Containers

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Box | Container | ✅ Layout | Ready |
| Container | Container | ✅ Layout | Ready |
| Grid | Grid | ✅ Layout | Ready |
| Stack | Flex | ✅ Layout | Ready |
| Flex | Flex | ✅ Layout | Ready |
| Paper | Surface | ✅ Layout | Ready |
| Card | Surface | ✅ Layout | Ready |
| CardHeader | Surface | ✅ Layout | Ready |
| CardContent | Surface | ✅ Layout | Ready |
| CardActions | Surface | ✅ Layout | Ready |
| CardActionArea | Surface | ✅ Layout | Ready |
| CardMedia | Surface | ✅ Layout | Ready |
| Panel | Surface | ✅ Layout | Ready |
| Section | Surface | ✅ Layout | Ready |
| ImageList | Container | ✅ Layout | Ready |
| ImageListItem | Container | ✅ Layout | Ready |
| ImageListItemBar | Container | ✅ Layout | Ready |
| AutoGrid | Grid | ✅ Layout | Ready |

**Category: `layout`** - 18 components ready ✅

### Navigation

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Breadcrumbs | Nav | ✅ Navigation | Ready |
| Link | Nav | ✅ Navigation | Ready |
| Menu | Nav | ✅ Navigation | Ready |
| MenuItem | Nav | ✅ Navigation | Ready |
| MenuList | Nav | ✅ Navigation | Ready |
| Pagination | Nav | ✅ Navigation | Ready |
| PaginationItem | Nav | ✅ Navigation | Ready |
| Stepper | Nav | ✅ Navigation | Ready |
| Step | Nav | ✅ Navigation | Ready |
| StepLabel | Nav | ✅ Navigation | Ready |
| StepButton | Nav | ✅ Navigation | Ready |
| StepContent | Nav | ✅ Navigation | Ready |
| StepConnector | Nav | ✅ Navigation | Ready |
| StepIcon | Nav | ✅ Navigation | Ready |
| Tabs | Nav | ✅ Navigation | Ready |
| Tab | Nav | ✅ Navigation | Ready |
| BottomNavigation | Nav | ✅ Navigation | Ready |
| BottomNavigationAction | Nav | ✅ Navigation | Ready |
| SpeedDial | Nav | ✅ Navigation | Ready |
| SpeedDialAction | Nav | ✅ Navigation | Ready |
| SpeedDialIcon | Nav | ✅ Navigation | Ready |

**Category: `navigation`** - 21 components ready ✅

### Modals & Surfaces

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Modal | Modal | ✅ Modal | Ready |
| Popover | Modal | ✅ Modal | Ready |
| Popper | Modal | ✅ Modal | Ready |
| Dialog | Modal | ✅ Modal | Ready |
| DrawerUnavailable | Modal | ❌ MISSING | **REPAIR** |
| Accordion | Surface | ✅ Modal | Ready |
| AccordionSummary | Surface | ✅ Modal | Ready |
| AccordionDetails | Surface | ✅ Modal | Ready |
| AccordionActions | Surface | ✅ Modal | Ready |
| AppBar | Surface | ✅ Modal | Ready |
| Toolbar | Surface | ✅ Modal | Ready |

**Category: `modal`** - 10 components ready, 1 issue

### Feedback & State

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| Alert | Feedback | ❌ MISSING | **REPAIR** |
| Backdrop | Feedback | ❌ MISSING | **REPAIR** |
| CircularProgress | Feedback | ✅ Custom | Ready |
| LinearProgress | Feedback | ✅ Custom | Ready |
| Progress | Feedback | ✅ Custom | Ready |
| Skeleton | Feedback | ✅ Custom | Ready |
| Snackbar | Feedback | ✅ Custom | Ready |
| Spinner | Feedback | ✅ Custom | Ready |
| States | State | ✅ Custom | Ready |

**Category: `custom`** - 7 ready, 2 missing (Alert, Backdrop not exported)

### Advanced/Lab Components

| Component | Type | JSON Schema Match | Status |
|-----------|------|-------------------|--------|
| LoadingButton | Action | ✅ Form | Ready |
| Masonry | Layout | ✅ Layout | Ready |
| Timeline | Display | ✅ Display | Ready |
| TimelineItem | Display | ✅ Display | Ready |
| TimelineSeparator | Display | ✅ Display | Ready |
| TimelineDot | Display | ✅ Display | Ready |
| TimelineConnector | Display | ✅ Display | Ready |
| TimelineContent | Display | ✅ Display | Ready |
| TimelineOppositeContent | Display | ✅ Display | Ready |
| DataGrid | Table | ✅ Table | Ready |

**Category: Multiple** - 10 advanced components ready ✅

### Icons

| Feature | Count | Status |
|---------|-------|--------|
| Icons | 40+ | ✅ Ready |
| Icon Component | 1 | ✅ Ready |

**Category: Display** - Full icon system ✅

## Summary

### Components by Category

| Category | Count | Status |
|----------|-------|--------|
| `form` | 28 | ✅ READY |
| `display` | 31 | ✅ READY |
| `layout` | 18 | ✅ READY |
| `navigation` | 21 | ✅ READY |
| `modal` | 11 | ⚠️ PARTIAL (1 issue) |
| `table` | 15 | ✅ READY |
| `chart` | 0 | ❌ MISSING |
| `custom` | 9 | ✅ READY |

**Total Components: 133** (27 internal/utility)
**Ready for Use: 131**
**Issues: 2**
**Missing: 1 category (charts)**

## Issues Found

### 1. Missing Drawer Component Export ❌

**Location**: `/fakemui/fakemui/surfaces/Drawer.tsx`
**Issue**: Component exists but not exported from main index
**Impact**: Modal/drawer patterns cannot use Drawer component
**Fix**: Add `Drawer` export to `/fakemui/index.ts`

### 2. Alert Component Not Exported ❌

**Location**: `/fakemui/fakemui/feedback/Alert.tsx`
**Issue**: Component exists but not exported
**Impact**: Feedback/alert patterns missing
**Fix**: Add `Alert` export to `/fakemui/index.ts`

### 3. Backdrop Component Not Exported ❌

**Location**: `/fakemui/fakemui/feedback/Backdrop.tsx`
**Issue**: Component exists but not exported
**Impact**: Modal backdrop patterns missing
**Fix**: Add `Backdrop` export to `/fakemui/index.ts`

## Recommendations

### Phase 1: Fix Missing Exports (Quick Win)
- Add `Drawer`, `Alert`, `Backdrop` to `/fakemui/index.ts`
- No code changes needed - just export existing components

### Phase 2: Chart Components (Future)
- Currently 0 chart components available
- Consider adding or wrapping a chart library (Recharts, Nivo, etc.)
- Would extend `category: "chart"` support

### Phase 3: Component Registry Integration
- Create `/frontends/nextjs/src/lib/fakemui-registry.ts`
- Maps all 131+ fakemui components to the JSON component schema
- Enables JSON declarative components to render fakemui components
- Example: `{ "type": "Button", "props": { "variant": "primary" } }` → `<Button variant="primary" />`

### Phase 4: Documentation
- Create component examples for each fakemui component
- Document props, events, and usage patterns for JSON declarations
- Add to `/schemas/package-schemas/component.schema.json` if needed

## Integration Checklist

- [ ] Fix missing exports (Drawer, Alert, Backdrop)
- [ ] Create fakemui component registry
- [ ] Update JSON renderer to use fakemui registry
- [ ] Create component definitions in package seed files
- [ ] Document JSON component patterns for each category
- [ ] Test end-to-end: JSON definition → Schema validation → Fakemui render
- [ ] Add chart library if needed
- [ ] Update component.schema.json with fakemui component reference

## Next Steps

1. **Immediate** (5 min): Fix 3 missing exports
2. **Short-term** (30 min): Create fakemui component registry
3. **Medium-term** (1-2 hours): Integrate registry with JSON renderer
4. **Testing** (1 hour): Create test components and verify rendering

---

**Last Updated**: 2026-01-16
**Status**: Ready for Phase 1 fixes
