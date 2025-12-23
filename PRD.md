# Planning Guide

A meta-architecture system with 4 distinct levels: Level 1 (public-facing website with sample content), Level 2 (user area with profiles and comments), Level 3 (Django-style admin panel for data management), and Level 4 (god-tier builder where all previous levels can be designed, developed, and tested through visual workflows, GUI editors for JSON schemas, and Lua scripting).

**Experience Qualities**: 
1. **Layered** - Clear separation between public, user, admin, and meta-builder levels with intuitive navigation between tiers
2. **Generative** - Level 4 can procedurally generate entire applications for Levels 1-3 through declarative JSON schemas and visual workflows
3. **Powerful** - Lua lambdas for custom logic, visual JSON schema editor, workflow system for complex processes, all through an intuitive GUI

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a 4-tier meta-application builder: a public website layer, authenticated user area, admin panel, and a god-tier visual builder that can procedurally generate all three previous layers using JSON schemas, workflow systems, and embedded Lua scripting.

## Essential Features

### Level 1: Public Website
- **Functionality**: Normal webpage with responsive hamburger menu, hero section, content areas, footer
- **Purpose**: Public-facing content accessible to anyone without authentication
- **Trigger**: User visits root URL without authentication
- **Progression**: Load homepage → Browse content sections → Click hamburger menu → Navigate pages → View sample content
- **Success criteria**: Responsive design works; hamburger menu collapses on mobile; content is readable; links work; no auth required

### Level 2: User Area
- **Functionality**: Authenticated user dashboard with profile page and comment system
- **Purpose**: Allow normal users to sign up, manage their profile, and interact through comments
- **Trigger**: User clicks "Sign Up" or "Login" from Level 1
- **Progression**: Register account → Verify credentials → Access dashboard → Edit profile → Browse comment sections → Post/edit comments → View own history
- **Success criteria**: Registration persists in KV; profile edits save; comments are CRUD-able; users can't access admin functions; profile picture upload works

### Level 3: Django-Style Admin Panel
- **Functionality**: Full data management interface with model list views, CRUD operations, filtering, search, and bulk actions
- **Purpose**: Provide admin users comprehensive control over all data models and system configuration
- **Trigger**: User with admin role logs in or selects "Admin" from navigation
- **Progression**: Login as admin → View model dashboard → Select model → See filtered list view → Search/filter records → Click record → Edit form → Save changes → View audit trail
- **Success criteria**: All models from schema rendered; inline editing; validation works; relations display correctly; permissions enforced; export to JSON/CSV

### Level 4: God-Tier Builder
- **Functionality**: Meta-builder with visual JSON schema editor, workflow designer, Lua lambda editor, component catalog, and live preview of Levels 1-3
- **Purpose**: Allow god-level users to design, configure, and deploy entire applications for Levels 1-3 through declarative configuration
- **Trigger**: User with god role accesses builder interface
- **Progression**: Open builder → Design data schema in GUI → Create workflows visually → Write Lua handlers → Configure page templates → Preview generated app → Deploy configuration → Test all levels
- **Success criteria**: JSON schema editor validates; workflow nodes connect; Lua syntax highlighting; live preview updates; can export/import configurations; changes propagate to all levels

### JSON Schema Editor (Level 4)
- **Functionality**: Visual GUI for defining data models with fields, types, validation rules, relationships
- **Purpose**: Declaratively define all data structures without writing JSON by hand
- **Trigger**: User opens "Schema Designer" in Level 4
- **Progression**: Create new model → Add fields via forms → Set field types/constraints → Define relations → Visualize schema graph → Validate → Generate Level 3 admin interface
- **Success criteria**: All field types supported; visual relationship mapping; constraint validation; auto-generates CRUD interfaces; imports/exports valid JSON

### Workflow System (Level 4)
- **Functionality**: Visual node-based workflow editor for defining business logic flows
- **Purpose**: Create complex processes (approval flows, notifications, data transformations) without code
- **Trigger**: User opens "Workflow Designer" in Level 4
- **Progression**: Create workflow → Drag trigger node → Add action nodes → Connect with arrows → Configure conditions → Attach to data events → Test execution → Monitor runs
- **Success criteria**: Nodes connect smoothly; execution order clear; can branch/merge; error handling; logs show execution path; integrates with Lua

### Lua Lambda System (Level 4)
- **Functionality**: Real Lua interpreter (fengari-web) with full language support, Monaco editor with syntax highlighting and autocomplete, parameter handling, context API access, and comprehensive execution feedback
- **Purpose**: Provide safe, sandboxed scripting for custom transformations, validations, and business logic with real Lua execution beyond declarative capabilities, enhanced by professional code editing experience
- **Trigger**: User adds "Lua Action" node in workflow or creates Lua script in scripts tab
- **Progression**: Open Monaco-based Lua editor → Define parameters → Write Lua code with syntax highlighting and autocomplete → Access context.data/user/kv via intelligent suggestions → Test with sample inputs → View execution logs → Return structured results → Integrate into workflows
- **Success criteria**: Monaco editor integrated with Lua language support; autocomplete provides context API suggestions (context.data, context.user, context.kv, log, print); syntax highlighting active; real Lua execution via fengari; parameter type validation; execution logs captured; return values parsed; syntax/runtime errors shown with line numbers; can transform JSON data; fullscreen editing mode available; integrates with workflow nodes

## Edge Case Handling
- **Invalid User Credentials**: Show clear error message; rate limit after 5 attempts; support password reset flow
- **Unauthorized Access Attempts**: Redirect to appropriate level; log security events; show "access denied" message
- **Circular Schema Relations**: Detect and prevent infinite loops in model relationships; warn user
- **Invalid Lua Scripts**: Catch syntax errors; timeout after 3 seconds; sandbox prevents dangerous operations
- **Malformed JSON Schemas**: Validate before save; highlight errors with line numbers; provide fix suggestions
- **Workflow Infinite Loops**: Detect cycles; limit execution steps to 1000; show execution trace
- **Large Comment Threads**: Paginate comments; lazy load older entries; virtualize long lists
- **Schema Migration Conflicts**: Detect breaking changes; show migration preview; allow rollback
- **Lost Sessions Across Levels**: Auto-save state; restore context; show reconnection indicator
- **Monaco Editor Load Failure**: Fallback loading indicator; retry mechanism; graceful degradation if CDN unavailable
- **Large Lua Scripts**: Monaco virtual scrolling handles performance; minimap provides navigation; syntax parsing optimized

## Design Direction
The design should evoke creativity and power - a professional design tool that feels both approachable and capable. Think Figma meets VS Code: clean, modern, with clear visual hierarchy and purposeful spacing. The canvas should feel like a creative workspace, not a cluttered IDE.

## Color Selection
A sophisticated, creative tool palette that balances professionalism with visual energy - inspired by modern design tools.

- **Primary Color**: Deep purple `oklch(0.55 0.18 290)` - Communicates creativity and innovation, used for primary actions and builder chrome
- **Secondary Colors**: Cool slate `oklch(0.35 0.02 260)` for sidebars and panels; Light lavender `oklch(0.92 0.03 290)` for canvas background
- **Accent Color**: Electric cyan `oklch(0.70 0.17 195)` - High-energy color for selected states, active drop zones, and CTAs
- **Foreground/Background Pairings**: 
  - Primary (Deep Purple `oklch(0.55 0.18 290)`): White text `oklch(0.98 0 0)` - Ratio 6.2:1 ✓
  - Canvas (Light Lavender `oklch(0.92 0.03 290)`): Dark text `oklch(0.25 0.02 260)` - Ratio 12.1:1 ✓
  - Accent (Electric Cyan `oklch(0.70 0.17 195)`): Dark slate `oklch(0.2 0.02 260)` - Ratio 9.3:1 ✓
  - Sidebar (Cool Slate `oklch(0.35 0.02 260)`): Light text `oklch(0.90 0.01 260)` - Ratio 10.8:1 ✓

## Font Selection
Modern, clean typography that balances technical precision with creative energy - readable at all scales for a design tool interface.

- **Typographic Hierarchy**: 
  - H1 (Builder Title): Space Grotesk Bold/28px/tight letter spacing
  - H2 (Panel Headers): Space Grotesk Semibold/20px/normal spacing
  - H3 (Component Names): Space Grotesk Medium/14px/normal spacing
  - Body (UI Labels): IBM Plex Sans Regular/14px/1.5 line height
  - Code (Monaco Editor): JetBrains Mono Regular/14px/1.4 line height
  - Small (Property Labels): IBM Plex Sans Medium/12px/uppercase/wide tracking

## Animations
Animations should feel responsive and purposeful - immediate visual feedback for drag operations (drag ghost follows cursor at 0ms), smooth 200ms transitions for panel sliding, 150ms micro-interactions on selection changes, and elastic spring physics (tension: 300, friction: 20) for drop animations that make components feel tangible.

## Component Selection
- **Components**: 
  - Sidebar with collapsible sections for component catalog
  - Resizable panels for canvas/inspector layout
  - Card for component previews in catalog
  - Dialog for login form and settings
  - Tabs for switching between visual/code views
  - ScrollArea for component lists and property panels
  - Input, Select, Switch, Slider for property editors
  - Button throughout for actions
  - Badge for component type indicators
  - Separator for visual hierarchy
  - Tooltip for help text on hover
  - Sonner for notifications
- **Customizations**: 
  - Custom drag-and-drop canvas with drop zone highlighting
  - Monaco Editor wrapper for Lua scripts with custom autocomplete provider
  - Monaco Editor wrapper for JSON schema editing with validation
  - Component tree view with expand/collapse
  - Property editor that dynamically renders based on component type
  - Canvas ruler and grid overlay
  - Component outline overlay on hover
  - Fullscreen mode for Monaco editor instances
- **States**: 
  - Canvas: neutral state shows dotted grid, hover shows drop zones, dragging shows blue outlines
  - Components: default has subtle border, hover shows blue glow, selected shows thick accent border with resize handles
  - Drop zones: hidden by default, appear on drag with dashed accent border and background tint
  - Property inputs: follow standard focus states with accent color
- **Icon Selection**: 
  - Phosphor icons: Layout for layouts, PaintBrush for styling, Code for code editor, Lock/LockOpen for auth, FloppyDisk for save, Eye for preview, ArrowsOutSimple for fullscreen, Plus for add, Trash for delete, Copy for duplicate, CaretRight/Down for tree expand
- **Spacing**: 
  - Sidebars: p-4 for sections, gap-2 for component grid
  - Canvas: p-8 for outer padding, min-h-screen for scrollability
  - Property panel: p-4 for sections, gap-4 for form fields
  - Component padding: p-2 minimum for selection targets
- **Mobile**: 
  - Not a primary concern for a builder tool, but provide tablet landscape support minimum
  - Stack panels vertically on small screens
  - Hide component catalog by default, show via hamburger menu
  - Full-screen canvas mode for focused editing
