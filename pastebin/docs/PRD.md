# Planning Guide

A code snippet management application with an integrated component library showcase, organized using atomic design principles.

**Experience Qualities**: 
1. **Efficient** - Lightning-fast snippet creation and sharing with minimal friction, optimized for developers who need to paste and share code instantly.
2. **Organized** - Intuitive navigation and search that makes finding and managing snippets effortless across multiple pages.
3. **Delightful** - Beautiful syntax highlighting, smooth interactions, and a refined interface that makes code sharing feel premium.

**Complexity Level**: Light Application (multiple features with basic state) - A multi-page application with routing, featuring a snippet manager and component library pages organized by atomic design levels (Atoms, Molecules, Organisms, Templates).

## Essential Features

**Navigation System**
- Functionality: Hamburger menu on the left side with page links
- Purpose: Allow users to navigate between Home, Split-Screen Demo, and component library pages
- Trigger: Click hamburger icon in header
- Progression: User clicks hamburger → Menu slides in from left → User selects page → Menu closes → Page content transitions
- Success criteria: Smooth animations, clear active page indicators, responsive on all screen sizes

**Snippet Creation**
- Functionality: Quick form to paste code, add title/description, select language
- Purpose: Enable rapid snippet sharing and storage
- Trigger: Click "New Snippet" button from Home page
- Progression: User clicks new snippet → Dialog appears → User pastes code → Adds title/description/language → Saves → Returns to grid with new snippet visible
- Success criteria: Snippet appears in grid immediately with proper syntax highlighting

**Snippet Viewing**
- Functionality: Full-screen viewer with syntax highlighting, split-screen live preview for React code, Python execution for Python code, and copy functionality
- Purpose: Easy reading, testing, executing, and copying of saved snippets
- Trigger: Click on any snippet card
- Progression: User clicks snippet → Full viewer opens → User reads code → Toggles preview/execution if available → Copies if needed → Closes viewer
- Success criteria: Code displays with proper formatting, live preview renders React components accurately, Python code executes with output display, copy works reliably

**Split-Screen Code Editor with Live Preview/Execution**
- Functionality: Interactive code editor with live React component preview for React code, Python execution for Python snippets with interactive input support, resizable panels, and view mode switching (code-only, split, preview/output-only)
- Purpose: Enable real-time testing and visualization of React code and Python execution while editing, including programs that require user input
- Trigger: Enable "Enable split-screen preview" checkbox when creating/editing JSX/TSX/JavaScript/TypeScript/Python snippets
- Progression: User enables preview → Split editor appears → User types code → Preview/output updates in real-time → For Python programs with input(), user enters values in interactive prompts → User adjusts panel sizes or switches view modes → Saves snippet
- Success criteria: React preview updates within 100ms of code changes, Python code executes reliably using Pyodide (WebAssembly Python), interactive input() prompts work seamlessly with multiple inputs, no lag during typing, error messages display clearly with AI help option

**Snippet Organization**
- Functionality: Real-time search across title, description, language, and code content, plus namespace-based organization with unlimited custom namespaces
- Purpose: Easy management of growing snippet collections with flexible categorization
- Progression: User types in search → Results filter instantly → User finds desired snippet, or User selects namespace from dropdown → Only snippets in that namespace display → User creates new namespace via + button → User can delete non-default namespaces (snippets move to Default)
- Success criteria: Search responds within 100ms, filters accurately, namespace switching is instant, creating/deleting namespaces works smoothly, default namespace cannot be deleted

**Namespace Management**
- Functionality: Create, switch between, and delete custom namespaces to organize snippets into logical groups
- Purpose: Enable users to organize large snippet collections by project, language, or any custom category
- Trigger: Click namespace dropdown or + button in the namespace selector
- Progression: User clicks namespace dropdown → Sees all available namespaces (Default first) → Selects a namespace → Snippets filtered to that namespace only → User clicks + button → Enters namespace name → New namespace created → User can switch to it → User can delete any non-default namespace via trash icon → Confirmation dialog appears → Snippets in deleted namespace move to Default
- Success criteria: Default namespace always exists and cannot be deleted, unlimited namespaces can be created, deleting a namespace moves all its snippets to Default, namespace selection persists during session, new snippets automatically assigned to current namespace

**Component Library Pages**
- Functionality: Separate pages for Atoms, Molecules, Organisms, and Templates
- Purpose: Showcase design system components organized by atomic design principles
- Trigger: Navigate via hamburger menu
- Progression: User opens menu → Selects component level → Page loads with relevant components
- Success criteria: Each page displays appropriate components with ability to save as snippets

**Split-Screen Demo Page**
- Functionality: Dedicated demo page showcasing the split-screen editor with a pre-populated interactive React component example
- Purpose: Provide users with an immediate, hands-on demonstration of the live preview capabilities
- Trigger: Navigate to "Split-Screen Demo" via hamburger menu
- Progression: User navigates to demo → Pre-loaded Counter component displays → User experiments with code editing → Sees real-time preview updates → Learns editor features
- Success criteria: Demo loads with working example code, users can edit and see instant changes, educational cards explain key features

**Database Management & Settings**
- Functionality: Settings page with storage backend selection (IndexedDB or Flask), database statistics, backup/restore, data migration, and Python template library with Project Euler examples and interactive input() examples
- Purpose: Enable users to choose between local browser storage or remote Flask backend, manage their data, export/import snippets, migrate between storage backends, and quickly load Python coding challenge and interactive program examples
- Trigger: Navigate to "Settings" via hamburger menu
- Progression: User opens settings → Selects storage backend (IndexedDB or Flask) → Configures Flask URL if needed → Tests connection → Migrates data if switching backends → Views database stats → Exports backup if needed → Can import previous backups → Loads Python templates (Euler problems or interactive programs) → Manages sample data → Can clear all data if needed
- Success criteria: Backend switching works seamlessly, Flask connection test validates server availability, data migration preserves all snippets, shows accurate statistics, export creates valid .db file, import restores data correctly, Python templates load successfully (including interactive input examples), clear operation requires confirmation

## Data Persistence

The application supports **flexible data storage** with two backend options:

### Storage Backends

1. **IndexedDB (Local Browser Storage) - Default**
   - Uses SQL.js (SQLite compiled to WebAssembly) for local database management
   - Primary Storage: IndexedDB - Used when available for better performance and larger storage capacity (typically 50MB+)
   - Fallback: localStorage - Used when IndexedDB is unavailable (typically 5-10MB limit)
   - Database Structure: Three tables - `snippets` (user-created snippets with namespaceId foreign key), `snippet_templates` (reusable templates), and `namespaces` (custom organizational categories with one default namespace)
   - Automatic Persistence: Database is automatically saved after every create, update, or delete operation
   - Export/Import: Users can export their entire database as a .db file for backup or transfer

2. **Flask Backend (Remote Server) - Optional**
   - Snippets stored on a Flask REST API server with SQLite database
   - Allows access to snippets from any device
   - Requires running the Flask backend (Docker support included)
   - RESTful API endpoints for all CRUD operations
   - Data migration tools to move snippets between IndexedDB and Flask

### Switching Between Backends

Users can switch storage backends from the Settings page:
- Select desired backend (IndexedDB or Flask)
- Configure Flask URL if using remote backend
- Test connection to Flask server
- Migrate existing snippets between backends
- Configuration persists in localStorage

This approach provides:
- Full SQL query capabilities for complex filtering and sorting
- Choice between local-only or remote storage
- Reliable persistence across browser sessions
- Easy backup and restore functionality
- Protection against localStorage quota exceeded errors
- Multi-device access when using Flask backend

## State Management Architecture

The application now uses **Redux Toolkit** for centralized state management, replacing the previous component-level state approach.

### Redux Store Structure

**Three Main Slices:**
1. **Snippets Slice** (`snippetsSlice.ts`)
   - Manages all snippet data (items, loading states, errors)
   - Handles selection mode and selected snippet IDs
   - Async thunks for CRUD operations (create, read, update, delete, bulk move)
   - Integrates with database layer (IndexedDB or Flask)

2. **Namespaces Slice** (`namespacesSlice.ts`)
   - Manages namespace data and selected namespace
   - Async thunks for namespace operations (fetch, create, delete)
   - Ensures default namespace always exists
   - Handles automatic namespace selection on load

3. **UI Slice** (`uiSlice.ts`)
   - Controls dialog states (snippet dialog, viewer dialog)
   - Manages currently editing/viewing snippets
   - Handles search query state
   - Pure synchronous actions for instant UI updates

### Key Features
- **Centralized State**: All application state in one predictable location
- **TypeScript Integration**: Fully typed state and actions with type inference
- **Memoized Selectors**: Efficient computed state using Reselect
- **Async Actions**: Built-in loading/error states for all database operations
- **Custom Hooks**: `useAppDispatch` and `useAppSelector` for type-safe Redux access
- **DevTools Support**: Redux DevTools integration for time-travel debugging
- **Immutable Updates**: Automatic immutability with Immer (via Redux Toolkit)

### Benefits Over Previous Approach
- **Predictable State Flow**: Actions → Reducers → State → UI (unidirectional)
- **Easier Debugging**: Redux DevTools shows every state change with time-travel
- **Better Testing**: Pure functions and isolated state make testing straightforward
- **Scalability**: Easy to add new features without prop drilling
- **Performance**: Memoized selectors prevent unnecessary re-renders
- **Developer Experience**: TypeScript autocomplete for all state and actions

## Edge Case Handling
- **No Search Results**: Friendly message encouraging users to refine their search
- **Duplicate Titles**: Allow duplicates, use unique IDs for management
- **Empty States**: Display helpful guidance when no snippets exist
- **Navigation on Mobile**: Hamburger menu adapts with full-screen overlay on small devices
- **Storage Quota Exceeded**: Automatically switches from localStorage to IndexedDB if available, warns user if both are full
- **Database Corruption**: Gracefully handles corrupted database files, creates new database if loading fails
- **Import Invalid Database**: Validates imported files, shows clear error message if file is invalid
- **Flask Connection Failure**: Tests connection before switching to Flask backend, shows clear error if server is unreachable
- **Data Migration Errors**: Validates data during migration, provides clear feedback on success or failure
- **Network Errors with Flask**: Shows informative error messages when Flask API calls fail, suggests checking server status

## Design Direction
The design should evoke **precision, technical craftsmanship, and modern developer tools**.

## Color Selection

Color scheme approach: Deep, sophisticated dark theme with vibrant purple accents and cyan highlights for a technical, modern aesthetic.

- **Primary Color**: Deep Purple `oklch(0.55 0.20 280)` - Communicates creativity and technical sophistication, used for main actions and branding
- **Secondary Colors**: Dark Slate `oklch(0.28 0.04 280)` - Provides subtle contrast for secondary elements and hover states
- **Accent Color**: Vibrant Cyan `oklch(0.75 0.18 200)` - Attention-grabbing highlight for CTAs, focus states, and important elements
- **Background**: Very Dark Base `oklch(0.10 0.01 280)` - Deep foundation that reduces eye strain and emphasizes content
- **Card/Surface**: Elevated Slate `oklch(0.18 0.02 280)` - Distinguishes content areas from background
- **Foreground/Background Pairings**: 
  - Background (Dark Base oklch(0.10 0.01 280)): Foreground (oklch(0.96 0.01 280)) - Ratio 9.2:1 ✓
  - Card (Deep Slate oklch(0.18 0.02 280)): Card Foreground (oklch(0.96 0.01 280)) - Ratio 7.8:1 ✓
  - Primary (Purple oklch(0.55 0.20 280)): White (oklch(0.98 0 0)) - Ratio 4.9:1 ✓
  - Accent (Cyan oklch(0.75 0.18 200)): Card Background (oklch(0.18 0.02 280)) - Ratio 6.1:1 ✓

## Font Selection

Typefaces should convey **technical precision** with **modern readability**. Using Inter for UI elements (clean and highly legible) and JetBrains Mono for code (optimized for programming).

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter-spacing (-0.02em)
  - H2 (Section Headers): Inter Bold/24px/tight letter-spacing (-0.01em)
  - H3 (Subsection Headers): Inter Semibold/20px/normal letter-spacing
  - Body Text: Inter Regular/16px/1.5 line-height
  - Code Text: JetBrains Mono Regular/14px/1.6 line-height
  - Small Text/Captions: Inter Regular/14px/muted color

## Animations

Animations should feel **smooth and purposeful**, enhancing navigation and feedback without distracting. Use spring physics for menu transitions, subtle fade-ins for page loads (300-400ms), and scale transforms for interactive elements. Focus on creating a sense of depth and responsive feedback.

## Component Selection

- **Components**: 
  - Router (react-router-dom) for page navigation and routing
  - Custom Navigation component with hamburger menu using Framer Motion for slide-in animations
  - ResizablePanel (shadcn) for split-screen editor with adjustable panel sizes
  - Button (shadcn) for all interactive actions with hover effects
  - Card (shadcn) for snippet cards with hover elevation
  - Dialog (shadcn) for snippet creation and viewing
  - Input (shadcn) for search and form fields
  - Select (shadcn) for language picker dropdown
  - Alert Dialog (shadcn) for delete confirmations
  - Checkbox (shadcn) for preview toggle
  - Monaco Editor (@monaco-editor/react) for code editing with syntax highlighting
- **Customizations**: 
  - Custom Navigation drawer slides from left with backdrop overlay
  - Custom SplitScreenEditor with three view modes (code-only, split-screen, preview-only)
  - Active navigation items show bold text and filled background
  - Page transitions use fade and slide animations
  - Buttons: Rest → Hover (brightness increase) → Active (scale 0.98) → Disabled (opacity 50%)
  - ResizableHandle shows interactive draggable separator with visual feedback
- **States**: 
  - Navigation items: Default → Hover (background muted) → Active (background primary, bold text)
  - Buttons: Rest → Hover (brightness increase) → Active (scale down) → Disabled (opacity 50%)
  - Cards: Rest → Hover (slight elevation and border glow)
  - Split Editor view toggle: Default → Hover (subtle highlight) → Active (filled background)
- **Icon Selection**: 
  - House (regular/bold) for home navigation
  - Sparkle (fill) for split-screen demo page navigation
  - Atom (regular/bold) for atoms page
  - FlowArrow (regular/bold) for molecules and organisms
  - Layout (regular/bold) for templates
  - Gear (regular/bold) for settings navigation
  - List (bold) for hamburger menu
  - X (bold) for close menu
  - Trash (regular) for delete
  - MagnifyingGlass (regular) for search
  - Code (regular) for code-only view
  - Eye (regular) for preview-only view
  - SplitHorizontal (regular) for split-screen view
  - SplitVertical (regular) for toggle preview in viewer
  - Sparkle (fill) for AI error helper and demo page features
  - Database (duotone) for database statistics
  - Download (bold) for export database
  - Upload (bold) for import database
- **Spacing**: 
  - Navigation menu: p-4 for nav container, space-y-2 for items
  - Navigation items: px-4 py-3 (touch-friendly 44px+ targets)
  - Page container: px-6 py-8
  - Section margins: mb-8 for headers
  - Grid: gap-6 (24px) for snippet cards
  - Split editor controls: gap-2 for view mode buttons
- **Mobile**: 
  - Navigation menu expands to full-width overlay on mobile
  - Touch-optimized button sizes (min 44px tap targets)
  - Responsive grid adapts from multi-column to single column
  - Stack navigation items vertically with full-width buttons
  - Split-screen editor stacks vertically on small screens or switches to single view mode






















































