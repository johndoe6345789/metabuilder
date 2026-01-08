# MetaBuilder UI Improvements

## Summary of Changes

This update transforms the god-tier builder interface from a technical code-heavy tool into a user-friendly GUI-based system with the following major improvements:

### 1. **CSS Class Builder** 
- Visual CSS class selector with categorized classes
- No more typing raw CSS - click to select from predefined classes
- Custom class input for edge cases
- Real-time preview of selected classes
- Classes organized by category: Layout, Spacing, Sizing, Typography, Colors, Borders, Effects, Positioning, Alignment, Interactivity

**Location:** `src/components/CssClassBuilder.tsx`
**Usage:** Automatically integrated into PropertyInspector for any `className` prop

### 2. **Dynamic Dropdown Configuration System**
- Create custom dropdown options from the god-tier panel
- Configure dropdown values once, use them across multiple properties
- GUI-based option management (no JSON editing required)
- Dropdowns can be assigned to component properties dynamically

**Location:** `src/components/DropdownConfigManager.tsx`
**Access:** God-tier panel → "Dropdowns" tab

### 3. **CSS Class Manager**
- Manage the library of CSS classes available in the builder
- Organize classes into categories
- Add/edit/delete categories and their classes
- Populated with comprehensive Tailwind utility classes by default

**Location:** `src/components/CssClassManager.tsx`
**Access:** God-tier panel → "CSS Classes" tab

### 4. **Monaco-Based JSON Editor**
- Replaced plain textboxes with professional Monaco editor
- Syntax highlighting for JSON
- Auto-formatting and validation
- Better error messages
- Tree-style folding and bracket colorization

**Location:** `src/components/JsonEditor.tsx`
**Used in:** SchemaEditor and anywhere JSON needs to be edited

### 5. **Enhanced Property Inspector**
- CSS classes now have a visual builder button
- Dynamic dropdowns support (properties can use configured dropdowns)
- Better visual hierarchy
- Icon-based property types

**Updated:** `src/components/PropertyInspector.tsx`

### 6. **Extended Database Schema**
- New tables for CSS class categories
- New tables for dropdown configurations
- Automatic seeding with 200+ Tailwind classes

**Updated:** `src/lib/database.ts`

### 7. **God-Tier Panel Enhancements**
- Two new tabs: "CSS Classes" and "Dropdowns"
- Better organization of configuration options
- More intuitive navigation

**Updated:** `src/components/Level4.tsx`

## Key Features

### For Non-Technical Users
- **Point-and-click CSS editing** - No need to remember class names
- **Visual dropdown configuration** - Create select options without coding
- **Professional code editor** - When JSON is needed, get proper tooling
- **Organized categorization** - Everything is grouped logically

### For Technical Users
- **Extensible system** - Easy to add new CSS categories
- **Custom class support** - Can still add custom CSS when needed
- **JSON import/export** - Full control when needed
- **Monaco editor** - Industry-standard code editing experience

## How to Use

### Creating a Dropdown Configuration
1. Go to Level 4 (God-Tier Panel)
2. Click "Dropdowns" tab
3. Click "Create Dropdown"
4. Enter a name (e.g., `status_options`)
5. Add options with values and labels
6. Save

### Using Dynamic Dropdowns in Components
In the component catalog, define a property like:
```typescript
{
  name: 'status',
  label: 'Status',
  type: 'dynamic-select',
  dynamicSource: 'status_options' // references dropdown config by name
}
```

### Managing CSS Classes
1. Go to Level 4 (God-Tier Panel)
2. Click "CSS Classes" tab
3. Browse categories or create new ones
4. Add/remove classes from categories
5. These classes will appear in the CSS Class Builder

### Building CSS Classes Visually
1. Select a component in the builder
2. In the Property Inspector, find the "CSS Classes" field
3. Click the palette icon next to it
4. Select classes from categories
5. Preview and apply

## Database Keys

New database keys added:
- `db_css_classes` - Stores CSS class categories
- `db_dropdown_configs` - Stores dropdown configurations

## Component Property Types

New property type added: `'dynamic-select'`
- References a dropdown configuration by name
- Options are loaded from the database
- Can be managed from god-tier panel

## Default CSS Categories

The system comes pre-loaded with 10 categories:
1. **Layout** - flex, grid, block, inline, etc.
2. **Spacing** - padding, margin, gap classes
3. **Sizing** - width, height, max-width classes
4. **Typography** - text sizes, weights, alignment
5. **Colors** - text, background, border colors
6. **Borders** - border styles and radii
7. **Effects** - shadows, opacity, transitions
8. **Positioning** - relative, absolute, z-index
9. **Alignment** - items-center, justify-between, etc.
10. **Interactivity** - cursor, hover, active states

Total: 200+ classes ready to use
