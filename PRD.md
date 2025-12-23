# Planning Guide

A declarative admin panel generator that allows developers to define data models and UI configuration through JSON schemas, automatically generating a complete CRUD interface similar to Django's admin panel.

**Experience Qualities**: 
1. **Declarative** - Configuration-driven development where JSON schemas define the entire admin interface without manual component creation
2. **Intuitive** - Familiar Django-admin-style patterns that feel immediately recognizable to developers who've worked with backend admin panels
3. **Powerful** - Full-featured CRUD operations with filtering, sorting, validation, and relationships handled automatically from schema definitions

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a code generation and admin panel system that dynamically creates fully functional interfaces from JSON schemas, including list views, detail views, forms, validation, and data persistence - requiring sophisticated state management and dynamic rendering.

## Essential Features

### Schema Definition System
- **Functionality**: Parse JSON schema files that define data models with fields, types, validation rules, and UI hints
- **Purpose**: Enable developers to define entire admin panels declaratively without writing component code
- **Trigger**: JSON schema files loaded at application startup or hot-reloaded during development
- **Progression**: Load JSON schema → Parse model definitions → Validate schema structure → Generate TypeScript types → Initialize data stores → Render admin interface
- **Success criteria**: Valid JSON schemas produce working admin panels; invalid schemas show clear error messages with schema validation feedback

### Dynamic Model List View
- **Functionality**: Auto-generated table/list view showing all records for a model with sortable columns, filters, search, and pagination
- **Purpose**: Provide quick overview and management of all records in a data model
- **Trigger**: User selects a model from the navigation sidebar
- **Progression**: Select model → Load records from KV store → Render table with columns from schema → Apply filters/search/sort → Click row for detail view
- **Success criteria**: All defined fields display correctly; sorting, filtering, and search work; pagination handles large datasets; empty states guide users to create first record

### Dynamic Form Generation
- **Functionality**: Automatically generate create/edit forms based on field types and validation rules in the schema
- **Purpose**: Eliminate boilerplate form code while ensuring data integrity through schema-defined validation
- **Trigger**: User clicks "Create New" button or "Edit" on existing record
- **Progression**: Open form dialog → Render fields based on schema → User inputs data → Validate on blur/submit → Save to KV store → Update list view → Show success toast
- **Success criteria**: All field types render appropriate inputs; validation rules enforced; error messages clear; optimistic updates feel instant

### Relationship Management
- **Functionality**: Handle foreign keys and many-to-many relationships with select dropdowns and relationship tables
- **Purpose**: Support relational data models common in admin panels
- **Trigger**: Form fields defined with relationship types in schema
- **Progression**: Render relationship field → Load related model records → Display searchable select → Save relationship IDs → Update related records view
- **Success criteria**: Related records load and display; cascade operations work correctly; relationship changes persist

### Field Type System
- **Functionality**: Support common field types (text, number, boolean, date, email, URL, select, textarea, rich text, file reference, relationship)
- **Purpose**: Cover the majority of admin panel use cases with appropriate input controls
- **Trigger**: Field type specified in schema
- **Progression**: Parse field type → Select appropriate input component → Apply type-specific validation → Render with schema-defined options
- **Success criteria**: Each field type has appropriate UI control; validation matches type; special types (date, color) use enhanced inputs

## Edge Case Handling
- **Invalid Schema Structure**: Display detailed validation errors in a dev-friendly overlay with line numbers and suggestions
- **Missing Required Fields**: Prevent form submission and highlight missing fields with clear error messages
- **Circular Relationships**: Detect and warn about circular dependencies in schema definitions
- **Large Datasets**: Implement virtual scrolling and pagination for tables with 1000+ records
- **Concurrent Edits**: Show warnings when data has been modified since form opened
- **Migration Scenarios**: Handle schema changes gracefully with field mapping suggestions

## Design Direction
The design should evoke efficiency, clarity, and developer familiarity - similar to the no-nonsense utility of Django admin but with modern polish and visual refinement. Think "power tool" rather than "pretty toy" - dense information displays, keyboard shortcuts, and rapid workflows prioritized over decorative elements.

## Color Selection
A technical, code-editor-inspired palette with high contrast for data clarity and professional development tool aesthetic.

- **Primary Color**: Deep indigo `oklch(0.45 0.15 265)` - Communicates technical sophistication and authority, used for primary actions and active states
- **Secondary Colors**: Cool gray `oklch(0.65 0.02 250)` for secondary UI elements and subtle backgrounds; Slate `oklch(0.25 0.03 250)` for sidebar and chrome
- **Accent Color**: Bright cyan `oklch(0.75 0.15 195)` - High-visibility color for CTAs, links, and "create new" actions that demand attention
- **Foreground/Background Pairings**: 
  - Primary (Deep Indigo): White text `oklch(0.98 0 0)` - Ratio 7.8:1 ✓
  - Background (Near White `oklch(0.98 0 0)`): Charcoal text `oklch(0.25 0 0)` - Ratio 14.2:1 ✓
  - Accent (Bright Cyan): Dark slate text `oklch(0.2 0.05 250)` - Ratio 8.1:1 ✓
  - Sidebar (Slate): Light gray text `oklch(0.85 0.01 250)` - Ratio 9.4:1 ✓

## Font Selection
Technical clarity with a code-adjacent aesthetic that reinforces the developer tool positioning while maintaining readability for dense data tables.

- **Typographic Hierarchy**: 
  - H1 (Panel Title): Space Grotesk Bold/32px/tight letter spacing
  - H2 (Section Headers): Space Grotesk Semibold/24px/normal spacing
  - H3 (Field Labels): Space Grotesk Medium/14px/uppercase/wide letter spacing
  - Body (Table Data): IBM Plex Sans Regular/15px/1.5 line height
  - Code (IDs, Technical Values): JetBrains Mono Regular/14px/1.4 line height
  - Small (Hints, Metadata): IBM Plex Sans Regular/13px/muted color

## Animations
Animations should prioritize immediate feedback for data operations and subtle spatial awareness during navigation - instant response to clicks/inputs with 150ms micro-animations for state changes, 250ms smooth transitions between list/detail views, and purposeful loading states that communicate progress.

## Component Selection
- **Components**: 
  - Table with Select, Checkbox, and Badge for list views
  - Dialog for create/edit forms with Form, Input, Textarea, Select, Switch, Calendar components
  - Sidebar for model navigation with collapsible groups
  - Command palette (cmdk) for quick model/record search
  - Breadcrumb for navigation context
  - Tabs for organizing related model groups
  - Sheet for sliding detail panels
  - Sonner for success/error toasts
  - Skeleton for loading states
- **Customizations**: 
  - Custom JSON schema editor with syntax highlighting
  - Dynamic field renderer component that maps schema types to inputs
  - Virtualized table component for large datasets
  - Relationship selector with async search
- **States**: 
  - Tables: hover highlights entire row with subtle background shift, selected rows show accent border
  - Buttons: primary actions use filled accent color with slight scale on press, secondary use outline
  - Inputs: focused state shows accent border with subtle glow, error state shows destructive color
  - Forms: dirty state indicators on modified fields
- **Icon Selection**: 
  - Phosphor icons throughout: List/Table for views, Plus for create, Pencil for edit, Trash for delete, MagnifyingGlass for search, Funnel for filters, ArrowsDownUp for sort, Database for models, FloppyDisk for save
- **Spacing**: 
  - Dense mode: p-2 for cells, p-4 for cards, gap-2 for tight groups
  - Standard: p-4 for containers, p-6 for dialogs, gap-4 for form fields, gap-6 for sections
  - Generous whitespace in sidebar (p-6) and around primary actions
- **Mobile**: 
  - Sidebar collapses to hamburger menu, stacks on small screens with slide-out drawer
  - Tables switch to card-based layout with key fields only, expandable for full details
  - Forms switch to full-screen sheets on mobile
  - Touch-friendly 44px minimum tap targets on all interactive elements
  - Bottom navigation bar for primary actions on mobile
