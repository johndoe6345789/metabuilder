# Planning Guide

CodeForge is a comprehensive low-code development platform that enables developers to rapidly build, test, and deploy full-stack applications through visual builders and intelligent code generation.

**Experience Qualities**:

1. **Powerful** - A complete development toolkit with visual designers for models, components, workflows, APIs, and testing
2. **Efficient** - Keyboard shortcuts, intelligent search, and streamlined navigation accelerate development
3. **Intelligent** - AI-assisted code generation, auto-repair, and context-aware suggestions

**Complexity Level**: Complex Application (advanced functionality with multiple views)

This is a sophisticated development platform with router-based navigation, multiple specialized views, state persistence, real-time preview, and comprehensive project management capabilities.

## Essential Features

### Dashboard & Project Overview
- **Functionality**: Central hub displaying project metrics, file counts, component stats, and quick actions
- **Purpose**: Provide at-a-glance project health and rapid access to common tasks
- **Trigger**: Loaded on app initialization or via navigation
- **Progression**: Load project state → Calculate metrics → Render cards → Enable quick actions
- **Success criteria**: All metrics display correctly, navigation works, GitHub build status shows

### Code Editor with File Explorer
- **Functionality**: Monaco-based code editor with syntax highlighting and file tree navigation
- **Purpose**: Edit project files with professional IDE-like experience
- **Trigger**: Navigate to Code Editor tab or select file from explorer
- **Progression**: Mount editor → Load file content → Enable editing → Auto-save changes → Update file tree
- **Success criteria**: Files open instantly, syntax highlighting works, changes persist

### Model Designer (Prisma Schema)
- **Functionality**: Visual interface for designing database models with fields, relations, and constraints
- **Purpose**: Create database schemas without writing raw Prisma syntax
- **Trigger**: Navigate to Models tab
- **Progression**: Display existing models → Add/edit models → Define fields → Set relations → Generate schema
- **Success criteria**: Models create correctly, relations validate, Prisma schema generates

### Component Tree Builder
- **Functionality**: Drag-and-drop interface for building React component hierarchies
- **Purpose**: Visually compose component structures with props and styling
- **Trigger**: Navigate to Components tab
- **Progression**: Show component palette → Drag to canvas → Configure props → Set styling → Generate JSX
- **Success criteria**: Components nest properly, props configure, code generates

### Workflow Designer
- **Functionality**: Node-based workflow editor for defining application logic
- **Purpose**: Create complex business logic visually using nodes and connections
- **Trigger**: Navigate to Workflows tab
- **Progression**: Place nodes → Connect nodes → Configure logic → Validate flow → Generate code
- **Success criteria**: Flows connect correctly, validation prevents errors, code executes

### Lambda/Function Designer
- **Functionality**: Code editor for serverless functions with runtime configuration
- **Purpose**: Write and configure backend functions quickly
- **Trigger**: Navigate to Lambdas tab
- **Progression**: Create function → Write code → Set environment → Configure triggers → Test execution
- **Success criteria**: Functions save, environments configure, testing works

### Style Designer (Theme Configuration)
- **Functionality**: Visual theme editor for colors, typography, spacing, and design tokens
- **Purpose**: Customize application appearance without editing CSS files
- **Trigger**: Navigate to Styling tab
- **Progression**: Select variant → Adjust colors → Configure typography → Preview changes → Generate CSS
- **Success criteria**: Changes preview instantly, CSS variables update, theme persists

### Favicon Designer
- **Functionality**: Visual icon designer with shapes, colors, and SVG export
- **Purpose**: Create custom favicons without external tools
- **Trigger**: Navigate to Favicon Designer tab
- **Progression**: Add shapes → Customize colors → Position elements → Preview → Export SVG
- **Success criteria**: Icons render correctly, SVG exports, preview updates in real-time

### Flask API Designer
- **Functionality**: Configure Flask backend with routes, blueprints, and settings
- **Purpose**: Set up Python backend API without manual configuration
- **Trigger**: Navigate to Flask API tab
- **Progression**: Configure settings → Define routes → Add blueprints → Set CORS → Generate config
- **Success criteria**: Configuration valid, routes define properly, Flask app generates

### Test Designers (Playwright, Unit Tests, Storybook)
- **Functionality**: Create and manage tests through visual interfaces
- **Purpose**: Build comprehensive test coverage without boilerplate
- **Trigger**: Navigate to respective test tabs
- **Progression**: Define test → Set assertions → Configure steps → Run tests → View results
- **Success criteria**: Tests create correctly, run successfully, results display

### Error Panel with Auto-Repair
- **Functionality**: Display build/runtime errors with AI-powered fix suggestions
- **Purpose**: Quickly identify and resolve issues
- **Trigger**: Navigate to Errors tab or click error indicator
- **Progression**: Parse errors → Categorize → Generate fixes → Apply suggestions → Re-validate
- **Success criteria**: Errors display clearly, fixes apply correctly, issues resolve

### Feature Ideas Cloud
- **Functionality**: Interactive tag cloud of feature suggestions with voting
- **Purpose**: Crowdsource and prioritize new features
- **Trigger**: Navigate to Feature Ideas tab
- **Progression**: Display ideas → Click to vote → Add new ideas → Sort by votes → Track implementation
- **Success criteria**: Voting works, ideas persist, sorting updates

### Docker Build Debugger
- **Functionality**: Paste Docker build logs and get AI-powered error analysis with fixes
- **Purpose**: Quickly diagnose and resolve Docker build failures
- **Trigger**: Navigate to Docker Debugger tab from menu
- **Progression**: Paste logs → Parse errors → Query knowledge base → Generate solutions → Copy fixes
- **Success criteria**: Errors extract correctly, solutions relevant, fixes work

### Global Search (Ctrl+K)
- **Functionality**: Fast fuzzy search across files, components, models, workflows, and navigation
- **Purpose**: Instant access to any project artifact
- **Trigger**: Press Ctrl+K or click search icon
- **Progression**: Open dialog → Type query → Filter results → Select item → Navigate/open
- **Success criteria**: Search < 100ms, results accurate, navigation works

### Keyboard Shortcuts
- **Functionality**: Comprehensive keyboard shortcuts for all major actions
- **Purpose**: Expert-level productivity without mouse
- **Trigger**: Press configured shortcut or Ctrl+/ to view all
- **Progression**: Press shortcut → Execute action → Show visual feedback
- **Success criteria**: All shortcuts work, dialog lists current mappings

### Project Export/Import
- **Functionality**: Export entire project as JSON, import projects from files
- **Purpose**: Share projects, backup, or migrate between environments
- **Trigger**: Click export/import in header menu
- **Progression**: Serialize state → Download JSON → Upload JSON → Deserialize → Restore state
- **Success criteria**: Export complete, import restores fully, no data loss

### PWA Support
- **Functionality**: Progressive Web App with offline support, install prompts, and update notifications
- **Purpose**: Desktop-like experience with offline capability
- **Trigger**: Automatic service worker registration
- **Progression**: Register SW → Cache assets → Show install prompt → Handle updates → Enable offline
- **Success criteria**: Offline mode works, install succeeds, updates apply

### Storage System (IndexedDB with Optional Flask API)
- **Functionality**: Unified storage system using IndexedDB by default, with optional Flask API backend
- **Purpose**: Persist all application data locally without external dependencies, with optional server sync
- **Trigger**: Automatic on first data access, configurable via UI settings or environment variable
- **Progression**: Initialize IndexedDB → Load stored data → Enable Flask API if configured → Auto-fallback on failure
- **Success criteria**: Data persists across sessions, Flask API optional, automatic fallback works
- **Configuration**: 
  - Default: IndexedDB (no configuration needed)
  - Environment: Set `VITE_FLASK_API_URL` to enable Flask backend
  - Runtime: Toggle via Storage Settings UI
- **Fallback Behavior**: If Flask API fails (network error, timeout, CORS), automatically switch to IndexedDB

## Edge Case Handling

- **No Project Data**: Show onboarding with sample project option
- **Large Files**: Monaco editor lazy-loads only visible content
- **Network Failures**: All state persists to IndexedDB storage, works completely offline
- **Flask API Unavailable**: Automatic fallback to IndexedDB with console warning
- **Storage Quota Exceeded**: IndexedDB provides clear error messages, recommend cleanup
- **Invalid JSON**: Schema validation with helpful error messages
- **Circular References**: Workflow and component tree validation prevents cycles
- **Conflicting Changes**: Last-write-wins with timestamp tracking
- **Browser Compatibility**: Graceful degradation for older browsers (IndexedDB supported in all modern browsers)
- **Memory Limits**: Lazy loading and code splitting for large projects
- **CORS Issues**: Flask API configured with proper CORS headers, falls back to IndexedDB if blocked

## Design Direction

The design should feel like a professional development tool - powerful yet approachable, with emphasis on speed, clarity, and focused workspaces. Think VS Code meets Figma: clean, minimal chrome with rich, context-specific editing surfaces.

## Color Selection

**Technical Elegance** - Dark theme with vibrant purple accents

- **Primary Color**: `oklch(0.58 0.24 265)` - Vibrant purple for actions and focus
- **Secondary Colors**: 
  - Background: `oklch(0.15 0.02 265)` - Deep blue-black for immersive coding
  - Card: `oklch(0.19 0.02 265)` - Elevated surfaces
  - Muted: `oklch(0.25 0.03 265)` - Borders and subtle dividers
- **Accent Color**: `oklch(0.75 0.20 145)` - Bright teal for success and completion
- **Foreground/Background Pairings**:
  - Background (`oklch(0.15 0.02 265)`): Light text `oklch(0.95 0.01 265)` - Ratio 13.2:1 ✓
  - Primary (`oklch(0.58 0.24 265)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓
  - Card (`oklch(0.19 0.02 265)`): Light text `oklch(0.95 0.01 265)` - Ratio 11.8:1 ✓
  - Accent (`oklch(0.75 0.20 145)`): Dark text `oklch(0.15 0.02 265)` - Ratio 7.9:1 ✓

## Font Selection

Developer-focused typography with monospace for code and clean sans-serif for UI

- **Typographic Hierarchy**:
  - H1 (Page Titles): JetBrains Mono Bold / 24px / tight letter spacing
  - H2 (Section Headers): JetBrains Mono Bold / 20px
  - H3 (Subsection Headers): JetBrains Mono Medium / 16px
  - Body Text: IBM Plex Sans Regular / 14px / 1.5 line height
  - Code/Logs: JetBrains Mono Regular / 14px / 1.4 line height
  - Labels: IBM Plex Sans Medium / 12px / uppercase tracking

## Animations

Purposeful motion for state changes, navigation, and feedback - never decorative

- Tab switching: 200ms crossfade
- Panel transitions: 300ms slide with ease-out
- Hover states: 150ms color/scale transitions
- Loading states: Subtle pulse on relevant area
- Success actions: Quick scale + color flash (200ms)
- Drag-and-drop: Smooth follow with snap-to-grid

## Component Selection

**Core Components**:
- **Tabs** (shadcn): Primary navigation with active indicators
- **Sheet** (shadcn): Side panels for settings and auxiliary content
- **Dialog** (shadcn): Modal overlays for search, shortcuts, and confirmations
- **Card** (shadcn): Content containers with hover states
- **Button** (shadcn): All variants - primary for actions, ghost for navigation
- **Textarea/Input** (shadcn): Form controls with focus rings
- **Select/Combobox** (shadcn): Dropdowns with search
- **Separator** (shadcn): Visual dividers between sections
- **Skeleton** (shadcn): Loading placeholders
- **Switch/Checkbox** (shadcn): Boolean controls

**Custom Components**:
- Monaco Editor wrapper with theme integration
- ReactFlow workflow canvas with custom nodes
- Tree view for file explorer and component hierarchy
- Drag-and-drop canvas for component builder
- Tag cloud with physics simulation
- Resizable panel groups for split views

**States**:
- Buttons: Default → Hover → Active → Disabled
- Inputs: Empty → Focused → Filled → Error → Success
- Panels: Collapsed → Expanding → Expanded → Collapsing
- Files: Unselected → Hover → Active → Modified → Saved

**Icon Selection**: @phosphor-icons/react with bold weight for emphasis
- Navigation: House, Code, Database, Tree, GitBranch, etc.
- Actions: Plus, Trash, Copy, Download, Upload
- Status: Check, X, Warning, Info, CircleNotch (loading)

**Spacing**:
- Page padding: p-6
- Section gaps: gap-8
- Card padding: p-6
- Button padding: px-4 py-2
- Input padding: px-3 py-2
- Tight spacing: gap-2 for related items

**Mobile**:
- Collapsible sidebar navigation
- Stacked layouts instead of side-by-side
- Full-width panels
- Touch-optimized button sizes (min 44px)
- Simplified feature set (hide advanced tools)
- Focused single-panel view instead of split panes

## Recent Updates

### Atomic Component Integration (Current Iteration)
- **Refactored organism-level components** to consistently use atomic design components (Stack, Flex, Container, ResponsiveGrid)
- **Improved code maintainability** by replacing raw divs with semantic layout components
- **Enhanced consistency** across layout patterns with prop-based control instead of inline Tailwind classes
- **Better developer experience** with self-documenting component props and clearer component hierarchies
- **Components updated**: AppHeader, ToolbarActions, TreeListPanel, SchemaEditorToolbar, SchemaEditorPropertiesPanel, PageHeader, ActionBar, EditorToolbar, ProjectDashboard
- See ATOMIC_INTEGRATION_SUMMARY.md for detailed documentation

