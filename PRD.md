# PRD: MetaBuilder Visual Configuration & Package System

## Mission Statement
Transform the MetaBuilder god-tier panel into an intuitive visual configuration system with a Docker-style package manager that allows users to instantly deploy complete pre-built applications while retaining full customization capabilities.

## Experience Qualities
1. **Intuitive** - Users should discover features naturally without extensive documentation, with visual cues guiding them through complex configurations.
2. **Empowering** - Non-technical users can accomplish sophisticated customization without writing code, while technical users retain full control when needed.
3. **Efficient** - Common tasks that previously required typing or memorization are now accomplished through point-and-click interactions, dramatically reducing configuration time.

## Complexity Level
**Complex Application** (advanced functionality with multiple views) - This is a meta-framework for building applications with four distinct user levels, database management, visual component builders, dynamic configuration systems, and a package management system for deploying pre-built applications.

## Essential Features

### 1. Docker-Style Package System
**Functionality:** Browse, install, and manage pre-built applications (forum, guestbook, video platform, music streaming, games, e-commerce) that integrate with existing infrastructure
**Purpose:** Allow users to rapidly deploy complete applications without building from scratch, leveraging existing database and workflow systems
**Trigger:** User navigates to "Packages" tab in god-tier panel
**Progression:** Browse packages → Filter by category → View details (schemas, pages, workflows included) → Install package → Schemas/pages/workflows automatically added → Enable/disable as needed → Uninstall to remove
**Success Criteria:** 
- 6+ pre-built packages available (Forum, Guestbook, Video Platform, Music Platform, Games Arcade, E-Commerce)
- One-click installation adds all schemas, pages, workflows, and Lua scripts
- Packages can be enabled/disabled without uninstalling
- Package data stored separately from core application data
- Clear visualization of what each package includes
- Search and filter by category, rating, downloads
- Seed data automatically loaded with packages

### 2. CSS Class Builder
**Functionality:** Visual selector for Tailwind CSS classes organized into logical categories
**Purpose:** Eliminate the need to memorize or type CSS class names, reducing errors and speeding up styling
**Trigger:** User clicks palette icon next to any className field in PropertyInspector
**Progression:** Open builder → Browse categories (Layout, Spacing, Typography, etc.) → Click classes to select → See live preview → Apply to component
**Success Criteria:** 
- User can style components without typing a single class name
- Selected classes display in real-time preview
- 200+ predefined classes organized into 10 categories
- Custom class input available for edge cases

### 3. Dynamic Dropdown Configuration
**Functionality:** Centralized management of dropdown option sets usable across multiple components
**Purpose:** Prevent duplication and ensure consistency when the same options appear in multiple places
**Trigger:** User navigates to "Dropdowns" tab in god-tier panel or components reference dropdown by name
**Progression:** Create dropdown config → Name it → Add options (value/label pairs) → Save → Reference in component schemas → Options appear automatically
**Success Criteria:**
- Dropdown created once, usable in unlimited component properties
- Changes to dropdown propagate to all components using it
- Visual GUI for managing options (no JSON required)
- Pre-loaded with common examples (status, priority, category)

### 4. CSS Class Library Manager
**Functionality:** Manage the catalog of CSS classes available in the builder
**Purpose:** Allow customization of available classes and organization for project-specific needs
**Trigger:** User navigates to "CSS Classes" tab in god-tier panel
**Progression:** View categories → Create/edit category → Add/remove classes → Save → Classes appear in CSS Class Builder
**Success Criteria:**
- Categories can be added, edited, or deleted
- Each category contains unlimited class names
- Changes immediately reflected in CSS Class Builder
- System initializes with comprehensive Tailwind utilities

### 5. Monaco Code Editor Integration
**Functionality:** Professional-grade code editor for JSON and Lua with syntax highlighting and validation
**Purpose:** When code editing is necessary, provide best-in-class tooling comparable to VS Code
**Trigger:** User opens SchemaEditor, LuaEditor, or JsonEditor components
**Progression:** Open editor → See syntax-highlighted code → Edit with autocomplete → Format code → Validate → Save
**Success Criteria:**
- Syntax highlighting for JSON and Lua
- Real-time error detection and display
- Code formatting on demand
- Bracket pair colorization and matching
- Minimap for navigation
- Find/replace functionality

### 6. Enhanced Property Inspector
**Functionality:** Context-aware property editor with specialized controls for different data types
**Purpose:** Provide the right UI control for each property type automatically
**Trigger:** User selects component in builder
**Progression:** Select component → View properties → Use appropriate control (text input, dropdown, CSS builder, etc.) → Changes apply immediately
**Success Criteria:**
- String fields use text inputs
- Boolean fields use dropdowns (true/false)
- Select fields use static dropdowns
- Dynamic-select fields load options from dropdown configs
- className fields have CSS Builder button
- All changes saved to component props

### 7. Quick Guide System
**Functionality:** Interactive documentation and tutorials for new features
**Purpose:** Help users discover and learn new visual configuration tools
**Trigger:** User opens "Guide" tab (default tab in god-tier panel)
**Progression:** View overview cards → Expand accordion sections → Read step-by-step instructions → Try features → Reference best practices
**Success Criteria:**
- Visible on first load as default tab
- Covers all major features (CSS Builder, Dropdowns, Monaco)
- Includes code examples where relevant
- Provides best practices and tips

## Edge Case Handling
- **Package conflicts** - System prevents installing packages with conflicting schema names, shows warning
- **Package uninstall with dependencies** - Warns if other packages depend on the one being uninstalled
- **Disabled package schemas** - Schemas from disabled packages remain in database but are marked inactive
- **Package version mismatches** - System tracks installed version, warns if updates available
- **Corrupted package data** - Validation ensures package manifests are complete before installation
- **Invalid CSS class names** - Custom class input validates and warns about non-standard classes
- **Deleted dropdown config still referenced** - PropertyInspector gracefully handles missing configs, shows warning
- **Large CSS class lists** - Scrollable interface with search/filter to handle 1000+ classes
- **Concurrent edits** - Changes to dropdown configs immediately reflect in all open PropertyInspectors
- **Empty dropdown options** - Validation prevents saving dropdowns with zero options
- **Duplicate class selection** - System prevents selecting same class twice
- **Import/export conflicts** - Monaco editor validates JSON before import, shows detailed errors

## Design Direction
The interface should feel like a professional design tool (Figma, Webflow) with the convenience of a package manager (Docker, npm). The package system uses card-based layouts with rich metadata (download counts, ratings, categories) to help users make informed decisions. Visual hierarchy emphasizes actions over configuration details. Color coding distinguishes different tool types (Packages = purple gradient, CSS = primary purple, Dropdowns = accent cyan, Code = muted gray).

## Color Selection

**Primary Color:** `oklch(0.55 0.18 290)` - Purple/magenta representing creativity and visual design
- Used for: CSS-related features, primary actions, selected states

**Secondary Colors:** `oklch(0.35 0.02 260)` - Deep blue-gray for structure
- Used for: Dropdowns, configuration panels, stable UI elements

**Accent Color:** `oklch(0.70 0.17 195)` - Cyan/teal for interactive elements
- Used for: Dynamic dropdowns, interactive guides, actionable items

**Foreground/Background Pairings:**
- Background `oklch(0.92 0.03 290)` with Foreground `oklch(0.25 0.02 260)` - Ratio 14.2:1 ✓
- Card `oklch(1 0 0)` with Card Foreground `oklch(0.25 0.02 260)` - Ratio 16.4:1 ✓
- Primary `oklch(0.55 0.18 290)` with Primary Foreground `oklch(0.98 0 0)` - Ratio 7.1:1 ✓
- Accent `oklch(0.70 0.17 195)` with Accent Foreground `oklch(0.2 0.02 260)` - Ratio 8.9:1 ✓

## Font Selection
Professional and technical feeling with emphasis on code clarity

- **Typographic Hierarchy:**
  - H1 (Panel Titles): Space Grotesk Bold/32px/tight tracking
  - H2 (Section Headers): Space Grotesk SemiBold/24px/normal tracking
  - H3 (Card Titles): Space Grotesk Medium/18px/normal tracking
  - Body (Descriptions): IBM Plex Sans Regular/14px/relaxed line height
  - Labels (Form Fields): IBM Plex Sans Medium/12px/wide tracking/uppercase
  - Code (Editors): JetBrains Mono Regular/14px/monospace

## Animations
Subtle functionality enhancements with occasional delightful moments

- **Opening dialogs:** 200ms ease-out scale from 0.95 to 1.0 with fade
- **Selecting CSS classes:** 150ms color transition + 100ms scale pulse on click
- **Dropdown option add:** 300ms slide-in from top with spring physics
- **Tab switching:** 200ms cross-fade between content panels
- **Hover states:** 150ms color/shadow transitions for all interactive elements
- **Toast notifications:** 400ms slide-up with bounce for user feedback

## Component Selection

**Components:**
- **Dialog (shadcn)** - For CSS Builder, Dropdown Manager, JSON Editor modals with max-width customizations
- **Tabs (shadcn)** - For god-tier panel navigation with horizontal scroll on mobile
- **Select (shadcn)** - For boolean and static dropdown properties
- **Input (shadcn)** - For text, number, and className fields with custom validation states
- **Button (shadcn)** - For all actions with icon+text pattern, size variants (sm for toolbars)
- **Card (shadcn)** - For guide sections, dropdown configs, CSS categories with hover elevations
- **Badge (shadcn)** - For selected classes, tags, status indicators with color variants
- **ScrollArea (shadcn)** - For long lists (CSS classes, options) with styled scrollbars
- **Accordion (shadcn)** - For Quick Guide collapsible sections
- **Monaco Editor (@monaco-editor/react)** - For JSON/Lua code editing with dark theme

**Customizations:**
- DialogContent extended to max-w-5xl for JSON/Lua editors
- Tabs with conditional wrapping and horizontal scroll for 12+ tabs
- Badge with close button overlay for removable tags
- Card with 2px border variants for feature highlighting
- Input with icon button suffix for CSS Builder trigger

**States:**
- Buttons: default, hover (shadow-md), active (scale-95), disabled (opacity-50)
- Inputs: default, focus (ring-2), error (border-destructive), disabled (bg-muted)
- Cards: default, hover (shadow-lg for interactive ones), selected (border-primary)
- Dropdowns: closed, open (with slide-down animation), disabled

**Icon Selection:**
- Palette (CSS Builder) - Visual association with styling/design
- ListDashes (Dropdowns) - Represents list options
- Code (Monaco editors) - Universal code symbol
- Sparkle (Quick Guide) - Suggests helpful tips/new features
- Pencil (Edit actions) - Standard edit metaphor
- Trash (Delete actions) - Standard delete metaphor
- Plus (Add actions) - Create new items
- FloppyDisk (Save) - Nostalgic but clear save icon

**Spacing:**
- Section gaps: gap-6 (24px) for major sections
- Card internal: p-4 to p-6 (16-24px) based on content density
- Form fields: space-y-2 (8px) between label and input
- Button groups: gap-2 (8px) for related actions
- Tab list: gap-1 (4px) to feel unified

**Mobile:**
- Tabs convert to horizontally scrollable list (4 visible, swipe for more)
- Dialogs use max-w-full with safe area padding
- CSS Class Builder shows 1 column on mobile, 3 on desktop
- PropertyInspector becomes bottom drawer on mobile (< 768px)
- Quick Guide cards stack vertically on mobile
- Monaco editor height reduces to 400px on mobile
