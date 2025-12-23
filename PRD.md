# PRD: MetaBuilder Multi-Tenant Architecture with Super God Level

## Mission Statement
Elevate MetaBuilder to support multi-tenant architecture with a Super God level (Level 5) that enables supreme administrators to manage multiple tenant instances, assign custom homepages to different god users, and transfer supreme power while maintaining system-wide control and preventing conflicts over homepage ownership.

## Experience Qualities
1. **Hierarchical** - Clear power structure with Super God at the apex, preventing homepage conflicts between god-level users through tenant-based isolation
2. **Controlled** - Power transfer mechanism ensures only one Super God exists, with explicit downgrade and upgrade paths that maintain system integrity
3. **Flexible** - Multi-tenant architecture allows multiple god users to operate independently with their own homepage configurations

## Complexity Level
**Complex Application** (advanced functionality with multiple views) - This extends the existing 4-level meta-framework with a 5th supreme administrator level, adding multi-tenant management, power transfer workflows, tenant-specific homepage configuration, and cross-level preview capabilities for all user roles.

## Essential Features

### 1. Super God Level (Level 5)
**Functionality:** Supreme administrator panel with multi-tenant management, power transfer, and system-wide oversight
**Purpose:** Solve the homepage ownership conflict by allowing multiple isolated tenant instances, each with their own god-level owner
**Trigger:** User logs in with supergod role credentials
**Progression:** Login with supergod credentials → Access Level 5 panel → View tenant management tab → Create/manage tenants → Assign god users to tenants → Configure tenant-specific homepages → Preview all levels → Transfer power if needed
**Success Criteria:**
- Only one supergod user exists at any time
- Supergod can create unlimited tenant instances
- Each tenant can have a custom homepage configuration
- Power transfer downgrades current supergod to god role
- Power transfer upgrades selected user to supergod role
- Confirmation dialog prevents accidental transfers
- All god users visible in dedicated management tab
- Preview mode works for all 5 levels from supergod panel

### 2. Multi-Tenant Architecture
**Functionality:** Isolated tenant instances with independent homepage configurations
**Purpose:** Allow multiple god-level users to coexist without fighting over the single homepage
**Trigger:** Supergod creates new tenant in Level 5 panel
**Progression:** Open tenant tab → Click create tenant → Enter tenant name → Assign owner (god user) → Configure homepage for tenant → Save tenant
**Success Criteria:**
- Tenants stored in database with unique IDs
- Each tenant has owner reference (user ID)
- Tenant homepage config stored independently
- Tenant creation/deletion only available to supergod
- Tenant list shows owner username
- Homepage assignment updates tenant config

### 3. Power Transfer System
**Functionality:** One-way transfer of supergod privileges to another user
**Purpose:** Enable supergod succession without requiring direct database access
**Trigger:** Supergod opens power transfer tab and selects target user
**Progression:** Open power transfer tab → View all eligible users → Select target user → Click initiate transfer → Review confirmation warning → Confirm transfer → Current supergod downgraded to god → Target user upgraded to supergod → Automatic logout
**Success Criteria:**
- Transfer request confirms selected user details
- Warning explains irreversibility clearly
- Transfer atomically updates both user roles
- isInstanceOwner flag transferred to new supergod
- Only non-supergod users appear as transfer targets
- System enforces single supergod constraint

### 4. God User Management
**Functionality:** View and monitor all god-level users in the system
**Purpose:** Provide supergod visibility into who has god access
**Trigger:** Supergod opens god users tab
**Progression:** Navigate to god users tab → View list of all god users → See username, email, creation date
**Success Criteria:**
- All users with god role displayed
- Username and email visible
- Visual distinction from other user roles
- Scrollable list for many god users

### 5. Cross-Level Preview
**Functionality:** Preview how each level appears from supergod panel
**Purpose:** Allow supergod to validate functionality at all levels without logging in as different users
**Trigger:** Supergod clicks preview button for any level (1-4)
**Progression:** Open preview tab → Click level to preview → Enter preview mode → View level with preview banner → Click exit preview → Return to Level 5
**Success Criteria:**
- Preview mode accessible for levels 1, 2, 3, 4
- Preview banner clearly indicates preview mode
- Exit preview returns to Level 5
- Preview mode toast notification on entry
- Preview inherits supergod permissions

### 6. Supergod Credentials Display
**Functionality:** Show supergod login credentials on Level 1 homepage for first-time login
**Purpose:** Provide initial access to supergod account
**Trigger:** Page load when supergod first login flag is true
**Progression:** Visit homepage → See supergod credentials alert → Copy credentials → Login → Change password → Credentials disappear
**Success Criteria:**
- Supergod credentials shown in amber-themed alert box
- Separate from god credentials display
- Username and password displayed with show/hide toggle
- Copy button for password
- Credentials hidden after password change
- Alert distinguishes Level 5 from Level 4

### 7. Docker-Style Package System
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

### 8. Package Import/Export System
**Functionality:** Export database configurations and packages as ZIP files, import packages from ZIP files, including support for assets (images, videos, audio, documents)
**Purpose:** Enable sharing of complete application packages, backing up database configurations, and distributing reusable modules across MetaBuilder instances
**Trigger:** User clicks Import/Export buttons in Package Manager
**Progression:** 
- **Export**: Click Export → Choose Custom Package or Full Snapshot → Enter metadata (name, version, author, description, tags) → Select export options → Click Export Package → ZIP downloads
- **Import**: Click Import → Select/drag ZIP file → Package validated → Data merged with existing database → Assets restored → Success notification
**Success Criteria:**
- Export packages as ZIP files with manifest.json, content.json, README.md, and assets folder
- Import packages from ZIP files with validation
- Selective export options (schemas, pages, workflows, Lua scripts, components, CSS, dropdowns, seed data, assets)
- Full database snapshot export for backup
- Non-destructive import (merges with existing data)
- Asset support for images, videos, audio, and documents
- Auto-generated README in packages
- Import/Export accessible from Package Manager
- Visual feedback during import/export operations

### 9. CSS Class Builder
**Functionality:** Visual selector for Tailwind CSS classes organized into logical categories
**Purpose:** Eliminate the need to memorize or type CSS class names, reducing errors and speeding up styling
**Trigger:** User clicks palette icon next to any className field in PropertyInspector
**Progression:** Open builder → Browse categories (Layout, Spacing, Typography, etc.) → Click classes to select → See live preview → Apply to component
**Success Criteria:** 
- User can style components without typing a single class name
- Selected classes display in real-time preview
- 200+ predefined classes organized into 10 categories
- Custom class input available for edge cases

### 10. Dynamic Dropdown Configuration
**Functionality:** Centralized management of dropdown option sets usable across multiple components
**Purpose:** Prevent duplication and ensure consistency when the same options appear in multiple places
**Trigger:** User navigates to "Dropdowns" tab in god-tier panel or components reference dropdown by name
**Progression:** Create dropdown config → Name it → Add options (value/label pairs) → Save → Reference in component schemas → Options appear automatically
**Success Criteria:**
- Dropdown created once, usable in unlimited component properties
- Changes to dropdown propagate to all components using it
- Visual GUI for managing options (no JSON required)
- Pre-loaded with common examples (status, priority, category)

### 11. CSS Class Library Manager
**Functionality:** Manage the catalog of CSS classes available in the builder
**Purpose:** Allow customization of available classes and organization for project-specific needs
**Trigger:** User navigates to "CSS Classes" tab in god-tier panel
**Progression:** View categories → Create/edit category → Add/remove classes → Save → Classes appear in CSS Class Builder
**Success Criteria:**
- Categories can be added, edited, or deleted
- Each category contains unlimited class names
- Changes immediately reflected in CSS Class Builder
- System initializes with comprehensive Tailwind utilities

### 12. Monaco Code Editor Integration
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
- **Multiple supergod attempts** - Database constraint ensures only one supergod role exists; attempting to create second fails
- **Power transfer to self** - UI prevents selecting current supergod user as transfer target
- **Power transfer interruption** - Atomic database transaction ensures both role changes succeed or neither does
- **Deleted tenant with god owner** - Tenant deletion doesn't affect god user's role or permissions
- **Tenant without homepage** - System gracefully handles undefined homepage config, shows default or placeholder
- **God user viewing tenant list** - God users cannot access Level 5, tenant management exclusive to supergod
- **Concurrent power transfers** - First-login flag and role checks prevent race conditions
- **Supergod logout during transfer** - Transfer completes before logout, new supergod can login immediately
- **Tenant name conflicts** - System allows duplicate names (IDs are unique), but UI warns user
- **Preview mode navigation** - Deep linking disabled in preview, back navigation returns to Level 5
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
The Level 5 interface should feel like a command center with regal, powerful aesthetics distinct from the purple god-tier panel. Use amber/gold accents to signify supreme authority. The multi-tenant view uses card-based layouts with organizational emphasis. Power transfer UI employs serious warning states with amber colors to communicate irreversibility. The interface balances grandeur with usability—never sacrificing clarity for visual flair. Color hierarchy: amber for supergod actions, purple for god-level previews, standard accent colors for tenant management.

## Color Selection

**Primary Color:** `oklch(0.55 0.18 290)` - Purple/magenta representing creativity and visual design (Levels 1-4)
- Used for: CSS-related features, primary actions, selected states, god-tier panel

**Super God Accent:** `oklch(0.70 0.16 70)` - Amber/gold representing supreme authority (Level 5 only)
- Used for: Super god panel highlights, power transfer actions, supreme badges

**Secondary Colors:** `oklch(0.35 0.02 260)` - Deep blue-gray for structure
- Used for: Dropdowns, configuration panels, stable UI elements

**Accent Color:** `oklch(0.70 0.17 195)` - Cyan/teal for interactive elements
- Used for: Dynamic dropdowns, interactive guides, actionable items

**Foreground/Background Pairings:**
- Background `oklch(0.92 0.03 290)` with Foreground `oklch(0.25 0.02 260)` - Ratio 14.2:1 ✓
- Card `oklch(1 0 0)` with Card Foreground `oklch(0.25 0.02 260)` - Ratio 16.4:1 ✓
- Primary `oklch(0.55 0.18 290)` with Primary Foreground `oklch(0.98 0 0)` - Ratio 7.1:1 ✓
- Accent `oklch(0.70 0.17 195)` with Accent Foreground `oklch(0.2 0.02 260)` - Ratio 8.9:1 ✓
- Super God Amber `oklch(0.70 0.16 70)` with Dark Background `oklch(0.15 0.02 260)` - Ratio 9.2:1 ✓

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
