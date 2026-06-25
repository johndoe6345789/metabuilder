# PRD: MetaBuilder Multi-Tenant Architecture with Super God Level & Nerd Mode IDE

## Mission Statement
Elevate MetaBuilder to support multi-tenant architecture with a Super God level (Level 5) that enables supreme administrators to manage multiple tenant instances, assign custom homepages to different god users, and transfer supreme power while maintaining system-wide control and preventing conflicts over homepage ownership. Additionally, provide advanced developers with a powerful Nerd Mode IDE for direct code access, version control integration, and professional debugging tools.

## Experience Qualities
1. **Hierarchical** - Clear power structure with Super God at the apex, preventing homepage conflicts between god-level users through tenant-based isolation
2. **Controlled** - Power transfer mechanism ensures only one Super God exists, with explicit downgrade and upgrade paths that maintain system integrity
3. **Flexible** - Multi-tenant architecture allows multiple god users to operate independently with their own homepage configurations
4. **Professional** - Nerd Mode provides advanced developers with full IDE capabilities for fine-grained control and professional workflows

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

### 7. Declarative Component System (IRC Implementation)
**Functionality:** Components defined declaratively via JSON configuration and Lua scripts instead of TSX files, enabling package-based component distribution
**Purpose:** Allow components to be part of packages, enabling dynamic loading and better separation of concerns
**Trigger:** Component type registered in package catalog, loaded at app initialization
**Progression:** Package defines component config in JSON → Lua scripts handle logic → Component renderer uses config → User adds component to page → Component renders using declarative definition
**Success Criteria:**
- IRC Webchat fully implemented as declarative component
- Component configuration stored in package catalog
- Lua scripts handle message sending, commands, user join/leave
- Component props defined in JSON schema
- UI layout defined in JSON structure
- Original IRCWebchat.tsx removed
- Declarative version fully functional in Level 2
- Package system loads all component definitions on startup

### 8. Docker-Style Package System
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

### 9. Nerd Mode IDE
**Functionality:** Toggleable full-featured web IDE with virtual file tree, Monaco code editor, GitHub/GitLab integration, test runner, and debugging console
**Purpose:** Provide advanced developers with professional development tools for direct code access, version control, and comprehensive testing workflows while maintaining the visual builder for rapid prototyping
**Trigger:** God or Super God user clicks "Nerd" button in Level 4 or Level 5 toolbar
**Progression:** Click Nerd button → Toggle activates IDE panel → Virtual file explorer appears → Select file → Edit code in Monaco editor → Configure Git integration → Push/pull changes → Run tests → Debug in console → Toggle off to hide
**Success Criteria:**
- Nerd Mode toggle button visible in Level 4 (God) and Level 5 (Super God) toolbars
- State persists between sessions using KV storage
- Fixed position panel in bottom-right corner (600px height, max 1400px width)
- Virtual file tree with folder expansion/collapse
- File CRUD operations (create, edit, save, delete files and folders)
- Monaco editor with syntax highlighting for TypeScript, JavaScript, Lua, JSON, HTML, CSS, Python, Markdown
- Tabbed interface for Editor, Console, Tests, and Git views
- Console output panel with command history
- Test runner with mock test execution and visual results (pass/fail/duration)
- Git integration dialog for configuring GitHub/GitLab credentials
- Push/Pull operations with commit message input
- Repository URL, branch, and access token configuration
- File language detection from extension
- Run code button executes selected file
- Visual terminal-style console output
- Delete file confirmation
- Toast notifications for all operations
- Responsive layout adapts to available space
- Z-index ensures IDE floats above other content

### 10. Theme Editor with Dark/Light Mode
**Functionality:** Visual theme customization interface allowing full control over application colors, border radius, and light/dark mode switching
**Purpose:** Enable administrators to customize the visual identity of the application without writing CSS, and provide users with dark/light mode preferences
**Trigger:** God or Super God user navigates to Settings tab and views Theme Editor section
**Progression:** Open Settings → Scroll to Theme Editor → Toggle between Light/Dark theme editing → Modify color values (oklch format) → Adjust border radius → Preview changes in real-time → Save theme → Toggle dark mode switch to test
**Success Criteria:**
- Live theme editor accessible in Level 4/5 Settings tab
- Separate configuration for Light and Dark themes
- All shadcn color variables editable (background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring)
- Color preview swatches show current values
- Border radius configuration with live preview
- Dark/Light mode toggle switch with persistent state
- Theme preview section showing buttons and cards
- Changes apply immediately to entire application
- Theme configuration stored in KV storage
- Reset to defaults button restores original theme
- Color values use oklch format for consistency
- Color groups organized by purpose (Base, Action, Supporting)

### 11. SMTP Email Configuration
**Functionality:** Configuration interface for SMTP email settings used for password reset and system notifications
**Purpose:** Allow administrators to configure email delivery for password reset, registration, and system notifications
**Trigger:** God or Super God user navigates to Settings tab and views SMTP Configuration section
**Progression:** Open Settings → Scroll to SMTP Config → Enter SMTP host and port → Add username/password → Configure from email/name → Toggle secure connection → Save configuration → Send test email to verify
**Success Criteria:**
- SMTP configuration form in Level 4/5 Settings tab
- Fields for host, port, username, password, from email, from name
- Secure connection (TLS/SSL) toggle
- Configuration stored in database (KV storage)
- Test email functionality with simulated send
- Test email displays in browser console (simulated mode)
- Form validation for required fields
- Password field masked by default
- Configuration persists between sessions
- Used by password reset and registration flows

### 12. Password Reset via Email
**Functionality:** Email-based password reset system using scrambled 16-character passwords, available from login screen and user profile
**Purpose:** Enable secure password recovery without administrator intervention
**Trigger:** User clicks Reset tab on login screen, or clicks "Request New Password" button in user profile
**Progression:** Enter email address → Click Reset Password → System finds user by email → Generate 16-char scrambled password → Email sent (simulated) → Password shown in console → User logs in with new password → Change password in profile if desired
**Success Criteria:**
- Password Reset tab on login screen alongside Login/Register
- "Request New Password via Email" button in Level 2 user profile
- Email lookup by address to find matching user
- 16-character scrambled password generation using crypto.getRandomValues
- Simulated email send displays in browser console
- Toast notification confirms email sent
- Password immediately active (hash updated in database)
- Help text mentions contacting administrator if needed
- Works for all user types (user, admin, god, supergod)
- Secure password generation using charset with letters, numbers, symbols

### 13. Registration Without Password Input
**Functionality:** Simplified registration requiring only username and email, with password automatically generated and emailed
**Purpose:** Streamline registration process and ensure strong passwords by default
**Trigger:** User navigates to Register tab on login screen
**Progression:** Enter username → Enter email → Click Create Account → System validates inputs → Generate 16-char scrambled password → Create user account → Email password (simulated) → Password shown in console → User notified to check email → Login with emailed password
**Success Criteria:**
- Register tab shows only username and email fields
- No password/confirm password inputs
- Alert explains password will be emailed
- 16-character scrambled password auto-generated
- Simulated email displayed in console with username and password
- Toast notification: "Account created! Check console for password"
- Help text: "Your password will be sent to your email address"
- User account immediately active
- First login does NOT force password change (optional feature)
- Strong password guaranteed by generation algorithm

### 14. Scrambled Default Passwords
**Functionality:** System-generated scrambled passwords for default accounts (supergod, god, admin, demo)
**Purpose:** Improve security by removing hardcoded weak passwords, while still displaying them on first login
**Trigger:** Database initialization on first application load
**Progression:** App loads → Database initializes → Check if credentials exist → Generate scrambled passwords for default users → Store hashed passwords → Set first login flags → Display credentials on Level 1 homepage → User copies password → Login → Change password
**Success Criteria:**
- Default passwords generated using crypto.getRandomValues (16 chars)
- Passwords displayed on Level 1 homepage in alerts for god/supergod
- Show/hide password toggle with eye icon
- Copy button to copy password to clipboard
- Passwords visible until first password change
- God credentials disappear after expiry timer or password change
- Super God credentials disappear after password change
- Passwords use mix of uppercase, lowercase, numbers, symbols
- Same scrambled password generation function used throughout app
- Console logs display default passwords for reference during development

### 15. IRC-Style Webchat Package
**Functionality:** Real-time IRC-style text chat with channels, user presence, commands, and persistent message history
**Purpose:** Provide built-in communication system for community discussion and collaboration
**Trigger:** Level 2 user clicks Webchat tab in their dashboard
**Progression:** Open Webchat tab → Join #general channel → See online users → Type message → Send message → View scrolling chat history → Use commands (/help, /users, /clear, /me) → Toggle user list panel → Leave channel on navigation
**Success Criteria:**
- Webchat tab accessible in Level 2 user area
- IRC-style monospace font display
- Timestamp on every message (HH:MM format)
- Username displayed with angle brackets: <username> message
- System messages in italics (join/leave/actions)
- Join/leave notifications with colored arrows
- Online user count badge
- User list panel (toggleable)
- Commands: /help, /users, /clear, /me <action>
- /help shows available commands
- /users lists online users with count
- /clear removes all messages from view
- /me creates action message: * username action
- Enter key sends message
- Message persistence using KV storage per channel
- User presence tracking (online users list)
- Auto-scroll to bottom on new message
- Collapsible settings/users sidebar
- Channel name displayed with # prefix
- 600px height card with scrollable message area
- Color coding: system messages, join (green), leave (orange)
- Unknown command error handling

### 10. CSS Class Builder
**Functionality:** Visual selector for Tailwind CSS classes organized into logical categories
**Purpose:** Eliminate the need to memorize or type CSS class names, reducing errors and speeding up styling
**Trigger:** User clicks palette icon next to any className field in PropertyInspector
**Progression:** Open builder → Browse categories (Layout, Spacing, Typography, etc.) → Click classes to select → See live preview → Apply to component
**Success Criteria:** 
- User can style components without typing a single class name
- Selected classes display in real-time preview
- 200+ predefined classes organized into 10 categories
- Custom class input available for edge cases

### 11. Dynamic Dropdown Configuration
**Functionality:** Centralized management of dropdown option sets usable across multiple components
**Purpose:** Prevent duplication and ensure consistency when the same options appear in multiple places
**Trigger:** User navigates to "Dropdowns" tab in god-tier panel or components reference dropdown by name
**Progression:** Create dropdown config → Name it → Add options (value/label pairs) → Save → Reference in component schemas → Options appear automatically
**Success Criteria:**
- Dropdown created once, usable in unlimited component properties
- Changes to dropdown propagate to all components using it
- Visual GUI for managing options (no JSON required)
- Pre-loaded with common examples (status, priority, category)

### 12. CSS Class Library Manager
**Functionality:** Manage the catalog of CSS classes available in the builder
**Purpose:** Allow customization of available classes and organization for project-specific needs
**Trigger:** User navigates to "CSS Classes" tab in god-tier panel
**Progression:** View categories → Create/edit category → Add/remove classes → Save → Classes appear in CSS Class Builder
**Success Criteria:**
- Categories can be added, edited, or deleted
- Each category contains unlimited class names
- Changes immediately reflected in CSS Class Builder
- System initializes with comprehensive Tailwind utilities

### 13. Monaco Code Editor Integration
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

### 14. Simplified UI with Nerd Mode Toggle
**Functionality:** Toggle between simplified user-friendly mode and advanced technical mode
**Purpose:** Hide complex code editors and technical tabs from non-technical users while keeping them accessible to developers
**Trigger:** User clicks "Nerd" button in top navigation bar
**Progression:** Default simple mode → Shows only Guide, Packages, Pages, Components, Users, Schemas, Settings → Click Nerd button → Reveals Workflows, Lua Scripts, Snippets, CSS Classes, Dropdowns, Database tabs → Shows full IDE panel → Advanced JSON editors in component config → Click Nerd again to hide
**Success Criteria:**
- Simple mode (default) hides: Workflows, Lua Scripts, Snippets, CSS Classes, Dropdowns, Database tabs
- Simple mode hides: JSON property editors, CSS-in-JS editors, Event handlers tab in component config
- Simple mode hides: Nerd Mode IDE floating panel at bottom
- Nerd mode shows all tabs and advanced features
- Toggle persists in KV storage across sessions
- Quick Guide explains the toggle and what each mode offers
- Tab bar adjusts grid layout based on visible tab count
- Configuration summary hides workflow/Lua metrics in simple mode

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

### 8. Security Scanning & Sandboxing
**Functionality:** Comprehensive code security analysis with sandboxed execution for Lua scripts
**Purpose:** Protect against malicious code, XSS attacks, SQL injection, and other vulnerabilities
**Trigger:** Automatic scan on save/execute, manual scan via Security Scan button
**Progression:** User writes code → Clicks save/execute → System scans for security issues → If critical/high severity detected → Show security warning dialog → Display all issues with details → User reviews and either fixes code or force-proceeds (non-critical only) → System logs security events
**Success Criteria:**
- All JavaScript code scanned for: eval(), innerHTML, XSS patterns, prototype pollution
- All Lua code scanned for: os/io module usage, file loading, infinite loops, global manipulation
- All JSON scanned for: __proto__ injection, script tags, malformed data
- Critical severity blocks execution/saving completely
- High severity requires user acknowledgment to proceed
- Medium/Low severity shows warnings but allows operation
- Each issue shows: type, severity, message, line number, code pattern, recommendation
- Lua scripts execute in sandbox with: disabled os/io/debug modules, 5s timeout, restricted globals
- Security scan button available in: Lua Editor, Code Editor, JSON Editor
- Security dialog shows color-coded severity levels with icons
- Sandboxed Lua engine blocks file system, OS commands, and package loading

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
- **Malicious code injection** - Security scanner blocks critical threats, warns on suspicious patterns
- **XSS attacks via innerHTML** - Scanner detects and prevents dangerous HTML injection patterns
- **Lua sandbox escape attempts** - Sandboxed engine disables os/io modules and dangerous functions
- **Infinite loops in Lua** - Execution timeout (5s) prevents resource exhaustion
- **SQL injection in strings** - Pattern matching detects and warns about SQL injection attempts
- **Prototype pollution** - Scanner detects __proto__ manipulation in JavaScript and JSON

## Design Direction
The Level 5 interface should feel like a command center with regal, powerful aesthetics distinct from the purple god-tier panel. Use amber/gold accents to signify supreme authority. The multi-tenant view uses card-based layouts with organizational emphasis. Power transfer UI employs serious warning states with amber colors to communicate irreversibility. The interface balances grandeur with usability—never sacrificing clarity for visual flair. Color hierarchy: amber for supergod actions, purple for god-level previews, standard accent colors for tenant management.

**Security UX:** Security warnings use shield icons and color-coded severity badges. Critical issues display prominent red warnings with block actions. The security scan dialog provides educational content explaining each issue with recommendations. Warnings are never dismissive—they empower users to write better, safer code.

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
