# Component System Architecture

Complete architecture documentation for MetaBuilder's declarative JSON component system integrated with fakemui.

## System Overview

```
Database
  ↓
ComponentConfig (Entity in DBAL)
  ↓
Package seed data (/packages/[packageId]/component/)
  ↓
JSON Component Definition (ui-components.json)
  ↓
JSON Schema Validation (component.schema.json)
  ↓
JSON Component Loader
  ↓
FAKEMUI_REGISTRY (151+ components)
  ↓
renderJSONComponent()
  ↓
React Elements
  ↓
Browser
```

## Layers

### Layer 1: Database Schema (YAML)

**File**: `/dbal/shared/api/schema/entities/packages/component.yaml`

Defines the ComponentConfig entity structure:

```yaml
entity: ComponentConfig
fields:
  id: { type: uuid, primary: true }
  packageId: { type: string }
  name: { type: string }
  category: { type: string }
  schema: { type: json }
  template: { type: json }
  props: { type: json }
  isPublished: { type: boolean }
  createdAt: { type: timestamp }
  updatedAt: { type: timestamp }
```

### Layer 2: JSON Schema Validation

**File**: `/schemas/package-schemas/component.schema.json`

Validates component seed data before database load:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "pattern": "^comp_" },
    "name": { "type": "string" },
    "category": { "enum": ["form", "display", "layout", "navigation", "modal", "table", "chart", "custom"] },
    "schema": { "type": "object" },
    "template": { "type": "object" },
    "props": { "type": "object" }
  },
  "required": ["id", "name", "category"]
}
```

### Layer 3: Package Seed Data

**Location**: `/packages/[packageId]/component/`

Package structure:

```
packages/ui_home/component/
├── metadata.json          [Entity folder metadata]
└── ui-components.json     [Actual component definitions]
```

Example component definition:

```json
[
  {
    "id": "comp_home_button",
    "name": "Home Button",
    "category": "form",
    "template": {
      "type": "Button",
      "props": { "variant": "{{variant}}" },
      "children": "{{label}}"
    },
    "props": {
      "label": "Click",
      "variant": "primary"
    }
  }
]
```

### Layer 4: DBAL Component Loading

**File**: `/dbal/development/src/seeds/index.ts`

Seed orchestration function:

```typescript
export async function seedDatabase(client: DBALClient): Promise<void> {
  // For each installed package
  // Read /packages/[packageId]/component/ui-components.json
  // Validate against JSON schema
  // Create ComponentConfig entries in database
}
```

### Layer 5: Component Registry

**File**: `/frontends/nextjs/src/lib/fakemui-registry.ts`

Maps all fakemui components to a registry:

```typescript
export const FAKEMUI_REGISTRY: Record<string, React.ComponentType> = {
  Button,
  TextField,
  Box,
  Grid,
  Card,
  Typography,
  // ... 145 more components
}

export const FAKEMUI_CATEGORIES = {
  form: ['Button', 'TextField', ...],
  display: ['Typography', 'Avatar', ...],
  layout: ['Box', 'Grid', ...],
  // ... more categories
}
```

### Layer 6: JSON Component Loader

**File**: `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx`

Renders JSON component definitions to React:

```typescript
export function renderJSONComponent(
  component: JSONComponent,
  props: Record<string, JsonValue> = {},
  ComponentRegistry = FAKEMUI_REGISTRY
): React.ReactElement {
  // 1. Parse template
  // 2. Evaluate expressions ({{variable}})
  // 3. Look up components in registry
  // 4. Render to React elements
}
```

### Layer 7: Frontend Pages

**File**: `/frontends/nextjs/src/app/page.tsx`

Pages render components from database:

```typescript
export default async function Page() {
  const db = getDBALClient()

  // Get page config from database
  const page = await db.pageConfigs.findOne({ path: '/' })

  // Load component definition
  const component = await db.components.findOne({ id: page.component })

  // Render to React
  return renderJSONComponent(component)
}
```

## Data Flow Example

### End-to-End Component Rendering

1. **Seed Time** - System boots
   ```bash
   npm run db:push              # Create database schema
   POST /api/bootstrap          # Load seed data
   ```

2. **Seed Loading** - DBAL reads package seeds
   ```
   Read /packages/ui_home/component/ui-components.json
   Validate against /schemas/package-schemas/component.schema.json
   Create ComponentConfig records in database
   ```

3. **Page Load** - User requests home page
   ```
   GET / → Next.js page handler
   query: await db.pageConfigs.findOne({ path: '/' })
   result: {
     id: 'page_home',
     path: '/',
     component: 'comp_home_hero'
   }
   ```

4. **Component Load** - Load component definition
   ```
   query: await db.components.findOne({ id: 'comp_home_hero' })
   result: {
     id: 'comp_home_hero',
     template: {
       type: 'Box',
       children: [...]
     },
     props: { title: 'MetaBuilder', ... }
   }
   ```

5. **Rendering** - Render JSON to React
   ```
   renderJSONComponent(component, props, FAKEMUI_REGISTRY)
   ↓
   Evaluate template expressions
   ↓
   Look up components in registry
   ↓
   Create React elements
   ↓
   <Box>
     <Typography>MetaBuilder</Typography>
     <Button>Get Started</Button>
   </Box>
   ```

6. **Browser** - Display rendered component
   ```
   Hero section with title and button displayed
   ```

## Component Categories

### 1. Form (28 components)

Input and form-related components:

```
Button, TextField, Select, Checkbox, Radio, Switch,
DatePicker, TimePicker, ColorPicker, FileUpload,
FormControl, FormGroup, FormLabel, FormHelperText,
Slider, Rating, Autocomplete, Textarea, etc.
```

**Usage**: Form fields, buttons, inputs, selects

**Example**:
```json
{
  "type": "TextField",
  "props": {
    "label": "Email",
    "type": "email",
    "fullWidth": true
  }
}
```

### 2. Display (26 components)

Text and data display components:

```
Typography, Avatar, Badge, Chip, List, ListItem,
Table, TableCell, Tooltip, Icon, Divider, etc.
```

**Usage**: Text, data tables, lists, badges

**Example**:
```json
{
  "type": "Table",
  "children": [
    {
      "type": "TableHead",
      "children": [
        { "type": "TableCell", "children": "Name" }
      ]
    }
  ]
}
```

### 3. Layout (18 components)

Layout and container components:

```
Box, Grid, Stack, Flex, Container,
Card, CardHeader, CardContent, CardActions,
Paper, Panel, Section, ImageList, etc.
```

**Usage**: Page layouts, grids, cards, containers

**Example**:
```json
{
  "type": "Grid",
  "props": { "container": true, "spacing": 2 },
  "children": [
    { "type": "Grid", "props": { "item": true, "xs": 12, "md": 6 }, "children": {...} }
  ]
}
```

### 4. Navigation (22 components)

Navigation and menu components:

```
Breadcrumbs, Pagination, Tabs, Stepper,
Menu, MenuItem, BottomNavigation, Link,
SpeedDial, etc.
```

**Usage**: Navigation menus, breadcrumbs, tabs

**Example**:
```json
{
  "type": "Tabs",
  "children": [
    { "type": "Tab", "props": { "label": "Tab 1" } },
    { "type": "Tab", "props": { "label": "Tab 2" } }
  ]
}
```

### 5. Modal (11 components)

Modal and overlay components:

```
Modal, Dialog, Drawer, Popover, Popper,
Accordion, AppBar, Toolbar, etc.
```

**Usage**: Dialogs, side panels, modals

**Example**:
```json
{
  "type": "Modal",
  "props": { "open": "{{isOpen}}" },
  "children": {
    "type": "Box",
    "children": "Modal content"
  }
}
```

### 6. Table (10 components)

Table-specific components:

```
Table, TableHead, TableBody, TableRow, TableCell,
TableContainer, TablePagination, TableSortLabel, DataGrid
```

**Usage**: Data tables, data grids

**Example**:
```json
{
  "type": "TableContainer",
  "children": {
    "type": "Table",
    "children": [
      { "type": "TableHead", "children": [...] },
      { "type": "TableBody", "children": [...] }
    ]
  }
}
```

### 7. Icons (27 icons)

Icon components for actions, navigation, communication:

```
Icon, Plus, Trash, Copy, Check, Filter,
Arrow icons, Navigation icons, File icons, etc.
```

**Usage**: Buttons, menus, indicators

**Example**:
```json
{
  "type": "IconButton",
  "children": {
    "type": "Plus"
  }
}
```

### 8. Feedback (6 components)

Feedback and status components:

```
Alert, Snackbar, Skeleton, Spinner,
Backdrop, CircularProgress
```

**Usage**: Error messages, loading states, notifications

**Example**:
```json
{
  "type": "Alert",
  "props": { "severity": "error" },
  "children": "An error occurred"
}
```

### 9. Advanced (3 components)

Advanced/experimental components:

```
Timeline, TreeView, Masonry, LoadingButton, DataGrid
```

**Usage**: Complex data visualization

**Example**:
```json
{
  "type": "Timeline",
  "children": [
    { "type": "TimelineItem", "children": "Event 1" }
  ]
}
```

## Template Expression System

### Simple Property Access

```json
{
  "props": {
    "label": "{{label}}",
    "value": "{{props.email}}"
  }
}
```

Evaluates to:
```javascript
{
  label: props.label,
  value: props['props']['email']
}
```

### Nested Property Access

```json
{
  "props": {
    "user": "{{state.user.name}}"
  }
}
```

### Ternary Operator

```json
{
  "props": {
    "disabled": "{{isLoading ? true : false}}",
    "label": "{{isLoading ? 'Saving...' : 'Save'}}"
  }
}
```

### Negation

```json
{
  "props": {
    "visible": "{{!isHidden}}"
  }
}
```

### Conditional Rendering

```json
{
  "type": "conditional",
  "condition": "{{isLoading}}",
  "then": {
    "type": "Spinner"
  },
  "else": {
    "type": "Button",
    "children": "Save"
  }
}
```

## Component Definition Structure

```typescript
interface ComponentDefinition {
  // Required
  id: string              // "comp_my_component" (must start with comp_)
  name: string            // "My Component"
  category: string        // "form" | "display" | "layout" | "navigation" | "modal" | "table" | "chart" | "custom"

  // Optional but recommended
  description?: string    // "What this component does"
  version?: string        // "1.0.0"
  isPublished?: boolean   // true/false (default: true)

  // Schema and template
  schema?: object         // JSON Schema for props validation
  template: object        // Component template/tree

  // Default values
  props?: object          // Default prop values
  styles?: object         // Default styles

  // Events and slots
  events?: Array<{        // Events this component can emit
    name: string
    description?: string
  }>

  slots?: Array<{         // Named slots for content
    name: string
    description?: string
  }>

  // Metadata
  tenantId?: string|null  // null = system-wide
  packageId?: string      // Package that defines this
  createdAt?: number      // Timestamp
}
```

## Integration Points

### 1. Database (DBAL)

```typescript
// Create component
await db.components.create({
  id: 'comp_my_button',
  name: 'My Button',
  category: 'form',
  template: { type: 'Button', ... },
  props: { label: 'Click Me' }
})

// Load component
const component = await db.components.findOne({ id: 'comp_my_button' })

// Render
renderJSONComponent(component, props)
```

### 2. Package System

```
packages/my_package/component/
  ├── metadata.json
  └── components.json
```

Package seed data automatically loaded by DBAL during bootstrap.

### 3. Frontend Pages

```typescript
// Page references component
{
  "id": "page_home",
  "path": "/",
  "component": "comp_home_hero"  // Component reference
}

// Page loads component from DB
const component = await db.components.findOne({ id: page.component })
return renderJSONComponent(component)
```

### 4. Component Registry

```typescript
// Check if component exists
if (FAKEMUI_REGISTRY['Button']) {
  // Component available
}

// Get component
const ButtonComponent = FAKEMUI_REGISTRY['Button']

// Render with registry
renderJSONComponent(def, props, FAKEMUI_REGISTRY)
```

## Extension Points

### Custom Component Registry

```typescript
import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'

// Extend with custom components
const customRegistry = {
  ...FAKEMUI_REGISTRY,
  MyCustomButton: MyCustomComponent,
  MyCustomCard: MyCustomCard,
}

renderJSONComponent(component, props, customRegistry)
```

### Custom Renderer

```typescript
// Implement custom rendering logic
function customRenderJSONComponent(component, props) {
  // Custom rendering logic
  // Can use FAKEMUI_REGISTRY or other components
}
```

### Custom Validation

```typescript
// Validate component against schema
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(componentSchema)

const valid = validate(componentDefinition)
if (!valid) {
  console.error('Validation errors:', validate.errors)
}
```

## Files and Locations

| File | Purpose | Type |
|------|---------|------|
| `/dbal/shared/api/schema/entities/packages/component.yaml` | Database entity schema | YAML |
| `/schemas/package-schemas/component.schema.json` | Seed data validation | JSON Schema |
| `/packages/*/component/` | Package component seeds | Directory |
| `/packages/*/component/metadata.json` | Entity folder metadata | JSON |
| `/packages/*/component/*.json` | Component definitions | JSON |
| `/frontends/nextjs/src/lib/fakemui-registry.ts` | Component registry | TypeScript |
| `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx` | JSON renderer | TypeScript |
| `/dbal/development/src/seeds/index.ts` | Seed orchestration | TypeScript |

## Statistics

- **Total Fakemui Components**: 151+
- **Categories**: 9 (form, display, layout, navigation, modal, table, chart, custom, icons)
- **Seed Files**: 12+ packages × 1+ component files
- **Registry Entries**: 151 components
- **Template Expressions**: 4 types (simple, nested, ternary, negation)
- **Package Components**: 5 examples (ui_home)

## Performance Considerations

1. **Caching**: Component definitions cached by DBAL
2. **Lazy Loading**: Components loaded on-demand from database
3. **Registry**: Components pre-loaded at startup (in-memory lookup)
4. **Template Evaluation**: Simple expression evaluation (no arbitrary code)
5. **Rendering**: Memoization available for React components

## Security Considerations

1. **Template Expressions**: Limited to property access (no arbitrary code execution)
2. **JSON Validation**: All component definitions validated against schema before DB load
3. **ACL**: Component access controlled by user permissions
4. **Escaping**: React handles XSS protection automatically
5. **Sandboxing**: Component rendering in browser sandbox

---

**Last Updated**: 2026-01-16
**Status**: Production Ready
**Version**: 1.0.0
