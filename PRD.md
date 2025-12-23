# Planning Guide

A visual drag-and-drop GUI builder that allows developers to create custom admin panels and applications by arranging components visually, with an integrated Monaco code editor for advanced customization and scripting. The system includes authentication to protect the builder interface.

**Experience Qualities**: 
1. **Visual** - Intuitive drag-and-drop interface where components can be placed, configured, and connected without writing code
2. **Flexible** - Seamlessly switch between visual building and code editing with Monaco editor for advanced customization
3. **Secure** - Login system protecting the admin builder with default credentials, ensuring only authorized users can modify the interface

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a visual application builder with drag-and-drop UI composition, component property editors, Monaco code editor integration, authentication system, and dynamic rendering - requiring sophisticated state management, component catalog, and code execution environment.

## Essential Features

### Authentication System
- **Functionality**: Login page with username/password authentication protecting the GUI builder
- **Purpose**: Ensure only authorized users can access and modify the admin panel builder
- **Trigger**: Application loads without valid session
- **Progression**: Show login page → User enters credentials → Validate against stored credentials → Store session in KV → Redirect to builder
- **Success criteria**: Invalid credentials show error; successful login persists session; logout clears session; default credentials (admin/admin) work initially

### Component Catalog
- **Functionality**: Sidebar showing all available shadcn components (Button, Input, Card, Table, etc.) that can be dragged onto canvas
- **Purpose**: Provide visual discovery and easy access to all UI building blocks
- **Trigger**: Builder loads with authenticated session
- **Progression**: Display component list → User searches/filters → Drag component → Drop on canvas → Component appears with default props
- **Success criteria**: All shadcn components cataloged; search/filter works; drag preview shows; drop zones highlight; components render correctly

### Drag-and-Drop Canvas
- **Functionality**: Visual workspace where components can be dragged, dropped, positioned, and nested
- **Purpose**: Enable intuitive visual composition of UI without code
- **Trigger**: User drags component from catalog or rearranges existing components
- **Progression**: Drag component → Hover over drop zones → Visual feedback shows valid targets → Drop → Component inserted → Selection updates
- **Success criteria**: Smooth drag experience; clear drop zone indicators; nested layouts work; undo/redo functions; component selection/multi-select

### Property Inspector
- **Functionality**: Right sidebar showing editable properties for selected component (text, colors, sizes, variants, etc.)
- **Purpose**: Configure component appearance and behavior without touching code
- **Trigger**: Component selected on canvas
- **Progression**: Select component → Inspector loads props → User edits values → Component updates live → Changes persist
- **Success criteria**: All component props exposed; appropriate input types; live preview; validation feedback; reset to defaults

### Monaco Code Editor
- **Functionality**: Integrated Monaco editor (VS Code engine) for writing custom JavaScript/TypeScript logic
- **Purpose**: Enable advanced customization beyond visual building - event handlers, data transformations, custom logic
- **Trigger**: User clicks "Code" tab or "Edit Handler" in property inspector
- **Progression**: Open code editor → View/edit component code → Syntax highlighting → Autocomplete → Save → Code executes in sandbox
- **Success criteria**: Syntax highlighting works; autocomplete for available APIs; error detection; safe sandboxed execution; code persists

### Safe Script Execution
- **Functionality**: Sandboxed JavaScript execution environment for custom code with access to limited APIs (Spark KV, component methods, utility functions)
- **Purpose**: Allow custom logic while preventing malicious code execution
- **Trigger**: Custom code attached to component event handlers or lifecycle
- **Progression**: User writes code → Parser validates → Execute in isolated context → Limited API access → Results render → Errors caught and displayed
- **Success criteria**: Cannot access globals; cannot make arbitrary network requests; errors don't crash app; performance limits enforced

### Layout System
- **Functionality**: Pre-built layout components (Grid, Flex, Stack, Container) for organizing components spatially
- **Purpose**: Enable responsive, structured layouts without CSS knowledge
- **Trigger**: User drags layout component onto canvas
- **Progression**: Drop layout → Configure columns/gaps → Drag children into layout → Auto-responsive → Preview mobile view
- **Success criteria**: Flexbox/Grid layouts work; responsive breakpoints; gap/padding controls; nested layouts; alignment tools

## Edge Case Handling
- **Invalid Credentials**: Show clear error message with retry; rate limit login attempts after 5 failures
- **Malicious Code in Editor**: Sandbox prevents DOM access, network requests, and infinite loops; timeout after 5 seconds
- **Circular Component Nesting**: Detect and prevent infinite nesting; show warning when depth exceeds 10 levels
- **Large Component Trees**: Virtualize component tree view; lazy load property panels; debounce updates
- **Unsupported Component Props**: Gracefully ignore invalid props; show warnings in dev panel; provide prop documentation
- **Lost Session**: Auto-save builder state every 10 seconds; restore on session loss; show "reconnecting" state
- **Monaco Loading Failure**: Fallback to basic textarea editor; show notification about reduced functionality

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
  - Monaco Editor wrapper component with TypeScript support
  - Component tree view with expand/collapse
  - Property editor that dynamically renders based on component type
  - Canvas ruler and grid overlay
  - Component outline overlay on hover
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
