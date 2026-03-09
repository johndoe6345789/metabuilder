# Fakemui Architecture & Design Decisions

## Overview

Fakemui is a Material Design 3 UI component library providing consistent component APIs across multiple platforms: React/TypeScript (web) and QML (desktop/embedded).

## Philosophy & Core Design Decisions

### 1. Platform Parity, Not Code Sharing

Fakemui maintains **separate implementations** for React and QML rather than attempting code sharing:

**React/TypeScript** (`/fakemui`):
- 98 components
- Full TypeScript support
- Browser/Node.js targeting
- React hooks for state management
- CSS-in-JS styling with `sx` prop

**QML** (`/qml/components`):
- 104 components (mirrors React structure)
- Modern Qt 6.x (versionless imports)
- Declarative QML syntax
- Centralized singleton theme system
- SCSS-style styling patterns

**Why separate?** Different platforms have different constraints:
- React: Hooks, JSX, modern JavaScript
- QML: Declarative syntax, C++ integration, event system
- Code sharing attempts created maintenance overhead

### 2. Material Design 3 as Foundation

All components implement Material Design 3 specifications:

**Design Tokens**:
- Color system (primary, secondary, tertiary, error, warning, info, success)
- Typography hierarchy (h1-h6 headings, body sizes)
- Spacing system (8px-based increments)
- Elevation system (5 levels with shadow definitions)
- Motion speeds (short, medium, long)

**Benefits**:
- Consistent visual language across platforms
- Accessibility compliance (WCAG AA+)
- Future-proof design system
- User familiarity with Material Design

### 3. Component Naming Conventions

**React Components**:
```typescript
Button, Card, TextField, Select, Dialog // PascalCase, semantic names
```

**QML Components**:
```qml
CButton, CCard, CTextField, CSelect, CDialog // C prefix + PascalCase
```

**Rationale**: C prefix in QML prevents naming conflicts with Qt built-ins (Button, Card, etc.)

### 4. Common Props Across All Components

Standardized prop interface for consistency:

```typescript
interface CommonProps {
  // Variants
  variant?: "text" | "outlined" | "contained"
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success"
  size?: "small" | "medium" | "large"

  // States
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean

  // Styling
  sx?: SxProp // Material Design theme-aware styles
  className?: string

  // Accessibility
  "aria-label"?: string
  "aria-describedby"?: string
  role?: string
}
```

**Benefits**:
- Predictable API surface
- Easy learning curve
- Consistent user experience
- Faster development

### 5. Intentional Component Duplication

Two components exist in different categories for different use cases:

**TreeView** (Intentional Duplicates):
```typescript
// data-display/TreeView - Array-based API for JSON trees
<TreeViewFlat
  items={[
    { id: '1', label: 'Parent', children: [...] }
  ]}
  onSelect={handleSelect}
/>

// lab/TreeViewComponent - Composition-based with TreeItem children
<TreeViewComponent>
  <TreeItem nodeId="1" label="Parent">
    <TreeItem nodeId="2" label="Child" />
  </TreeItem>
</TreeViewComponent>
```

**DatePicker** (Intentional Duplicates):
```typescript
// inputs/DatePicker - Simple HTML input (string values)
<DatePicker
  value="2024-01-15"
  onChange={handleDateChange}
/>

// x/DatePickerAdvanced - Advanced calendar UI (Date objects)
<DatePickerAdvanced
  value={new Date()}
  onChange={handleDateChange}
/>
```

**Why duplicates?** Different scenarios:
- Simple date inputs vs. rich calendar interfaces
- Array-based data vs. JSX composition
- Performance vs. features

### 6. Theming System

**Multi-tier Theme Architecture**:

```
Theme Provider (React)
  ↓
Theme Context/Hooks
  ↓
Individual Components
  ↓
sx Prop (Material-UI compatible)
```

**Built-in Themes** (9 variants):
- default (primary blue)
- light (light mode)
- dark (dark mode)
- ocean, forest, sunset, lavender, midnight, rose (color variations)

**Dynamic Theming**:
```typescript
const { theme, setTheme } = useTheme()

// Switch theme at runtime
setTheme('dark')
```

**Custom Themes**: Extend from base theme
```typescript
const customTheme = {
  palette: {
    primary: { main: '#custom-color' },
    // ...
  },
  typography: { /* ... */ }
}
```

### 7. Styling Approach

**Material-UI Compatible `sx` Prop**:
```typescript
<Box sx={{
  // System props (theme-aware)
  backgroundColor: 'primary.main',
  color: 'text.secondary',
  padding: 2, // 16px (theme spacing unit)

  // CSS in JS
  display: 'flex',
  gap: 1,

  // Responsive
  '@media (max-width: 600px)': {
    flexDirection: 'column'
  }
}}>
  Content
</Box>
```

**No Tailwind or Utility Classes**: Follows MetaBuilder standards:
- ✅ Material-UI sx prop
- ❌ Tailwind className utilities
- ❌ Radix UI (use Fakemui instead)

**Why sx prop?**
- Theme-aware by default
- Type-safe (TypeScript support)
- Responsive utilities built-in
- Consistent with MUI ecosystem
- Easier to maintain

### 8. Accessibility First

All components implement accessibility standards:

**ARIA Attributes**:
```typescript
<Button aria-label="Close menu" aria-describedby="help-text">
  ✕
</Button>
```

**Keyboard Navigation**:
- Tab order
- Enter/Space for activation
- Arrow keys for navigation
- Escape for dismissal

**Screen Reader Support**:
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Form labels

**Testing**:
- Role-based selectors: `screen.getByRole('button')`
- Accessibility audit tools
- WCAG AA compliance target

### 9. Component Organization

**Directory Structure Rationale**:

```
atoms/              # Lowest level (Text, Label, Icon)
  ↓
inputs/             # Form controls (Button, TextField)
  ↓
surfaces/           # Containers (Card, AppBar)
  ↓
layout/             # Spatial arrangement (Box, Grid)
  ↓
data-display/       # Data rendering (Table, List)
  ↓
feedback/           # User feedback (Alert, Progress)
  ↓
navigation/         # Navigation patterns (Tabs, Menu)
  ↓
utils/              # Helper components (Modal, Portal)
  ↓
lab/                # Experimental (Timeline, Masonry)
  ↓
x/                  # Advanced features (DataGrid)
```

**Benefits**:
- Clear dependency hierarchy
- Reduced circular imports
- Easier to find components
- Scalable organization

### 10. Performance Considerations

**Memoization Strategy**:
```typescript
const Button = React.memo(ButtonComponent, (prev, next) => {
  // Custom comparison for props
  return prev.disabled === next.disabled && prev.onClick === next.onClick
})
```

**Virtualization for Lists**:
```typescript
<List virtualized maxHeight={400}>
  {largeDataSet.map(item => <ListItem key={item.id}>{item}</ListItem>)}
</List>
```

**Bundle Optimization**:
- Tree-shaking support (ES modules)
- Named exports (avoid default exports)
- Minimal dependencies (Material-UI foundation only)

**Code Splitting**:
```typescript
// Lazy load heavy components
const DataGrid = React.lazy(() => import('./x/DataGrid'))

<Suspense fallback={<Skeleton />}>
  <DataGrid {...props} />
</Suspense>
```

## Component Categories

### Atoms (Basic Building Blocks)

```
Text, Label, Icon, Badge, Divider, Spacer
```

- Lowest level components
- No complex logic
- Composable foundation

### Inputs (Form Controls)

```
Button, TextField, Select, Checkbox, RadioButton, Switch,
DatePicker, FileUpload, Slider, Autocomplete
```

- User interaction
- Form handling
- Input validation hooks
- Accessibility: labels, aria-describedby

### Surfaces (Containers)

```
Card, AppBar, Drawer, Paper, Background
```

- Content grouping
- Navigation surfaces
- Elevation/shadow system

### Layout (Spatial Arrangement)

```
Box, Stack, Grid, Flex, Container
```

- Responsive grids (xs, sm, md, lg, xl)
- Spacing utilities
- Flexbox/Grid layout

### Data Display (Rendering Data)

```
Table, List, Avatar, Chip, Progress, Rating
```

- Tabular data
- Lists and collections
- Data visualization primitives

### Feedback (User Feedback)

```
Alert, Dialog, Progress, Skeleton, Toast, Tooltip
```

- Communicate state
- System feedback
- Loading states
- Help/hints

### Navigation (Navigation Patterns)

```
Tabs, Menu, Breadcrumbs, Pagination, Stepper
```

- Page navigation
- Menu systems
- Progress indication

### Utilities (Helper Components)

```
Modal, Portal, Popover, Popper
```

- Position management
- Overlay handling
- Portal rendering

### Lab (Experimental)

```
Timeline, Masonry, Carousel, Autocomplete variants
```

- Experimental components
- May move to core
- Breaking changes possible

### X (Advanced/Pro Features)

```
DataGrid, DatePickerAdvanced, TreeViewComponent
```

- Complex features
- Performance optimized
- Rich interactions

## Integration Points

### With State Management

**Redux Integration**:
```typescript
const { isOpen } = useSelector(state => state.modals)
const dispatch = useDispatch()

<Dialog
  open={isOpen}
  onClose={() => dispatch(closeModal())}
>
  Content
</Dialog>
```

### With Validation Libraries

**React Hook Form**:
```typescript
const { register, errors } = useForm()

<TextField
  {...register('email', { required: 'Email required' })}
  error={!!errors.email}
  helperText={errors.email?.message}
/>
```

### With i18n

**Internationalization**:
```typescript
const { t } = useTranslation()

<Button>{t('common.submit')}</Button>
<Dialog title={t('dialogs.confirm')}>
  {t('messages.areYouSure')}
</Dialog>
```

## Maintenance & Evolution

### Adding New Components

1. **Design first**: Verify Material Design 3 compliance
2. **Create in appropriate category**: Follow directory structure
3. **Implement React version**: Full TypeScript, tests
4. **Mirror in QML**: Maintain parity
5. **Update exports**: Add to index.ts
6. **Document**: JSDoc + GETTING_STARTED.md

### Breaking Changes

- Semantic versioning: MAJOR.MINOR.PATCH
- Notice period: Deprecation phase before removal
- Migration guides: Help developers upgrade

### Deprecation Process

```typescript
/**
 * @deprecated Use NewComponent instead. Will be removed in v3.0
 * @example
 * // Before
 * <OldComponent />
 *
 * // After
 * <NewComponent />
 */
export const OldComponent = () => { /* ... */ }
```

## Future Roadmap

1. **More Component Variations**: Time picker, color picker, rich text editor
2. **Performance Enhancements**: React 19 transitions, streaming SSR
3. **QML Performance**: C++ backing for heavy components
4. **Visual Regression Testing**: Automated screenshot comparison
5. **Storybook Integration**: Interactive component documentation
6. **Design Tokens Export**: Figma integration

## File Structure Overview

```
fakemui/
├── atoms/                    # Basic components
├── inputs/                   # Form controls (28 components)
├── surfaces/                 # Containers
├── layout/                   # Spacing & arrangement
├── data-display/             # Data rendering
├── feedback/                 # User feedback
├── navigation/               # Navigation patterns
├── utils/                    # Helper components
├── lab/                      # Experimental
├── x/                        # Advanced features
├── theming/                  # Theme system & providers
├── workflows/                # Workflow-specific components
├── styles/                   # SCSS mixins, tokens
├── hooks/                    # React hooks
├── types/                    # TypeScript interfaces
├── icons/                    # Material Design icons
├── index.ts                  # Main export file
├── README.md                 # Overview
└── docs/                     # Documentation

qml/components/
├── atoms/                    # QML atoms (C-prefixed)
├── inputs/                   # QML inputs
├── ... (mirrors React structure)
├── Theming/                  # Theme singletons
└── Responsive/               # Responsive utilities
```

## Key Statistics

| Metric | Value |
|--------|-------|
| React Components | 98 |
| QML Components | 104 |
| Type Coverage | 100% |
| Accessibility Level | WCAG AA+ |
| Design System Version | Material Design 3 |
| Built-in Themes | 9 variants |
| Code Review Grade | A- |
