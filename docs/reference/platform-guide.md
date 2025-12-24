# MetaBuilder - 4-Level Application Platform

## Overview
MetaBuilder is a comprehensive meta-application platform that allows you to design, build, and manage web applications through a hierarchical 4-level system. Each level provides increasing access and control over the application.

## Application Levels

### Level 1 - Public Website
- Public-facing pages accessible to all visitors
- Marketing content, landing pages, general information
- No authentication required

### Level 2 - User Area
- Authenticated user dashboard and features
- User profile management
- Comment system and user interactions
- Requires user authentication

### Level 3 - Admin Panel (Django-style)
- Data model management
- User administration
- Content moderation
- Requires admin role

### Level 4 - God-Tier Builder Panel
- **Complete application design and configuration**
- Visual component editor with drag-and-drop
- Page routing and URL configuration
- Component hierarchy management
- User management system
- Data schema designer
- Workflow builder
- Lua script editor with live execution
- Database export/import
- Requires god role

## Default Users

After initialization, the following users are available:

| Username | Password | Role  | Access Levels |
|----------|----------|-------|---------------|
| god      | god123   | god   | 1, 2, 3, 4    |
| admin    | admin    | admin | 1, 2, 3       |
| demo     | demo     | user  | 1, 2          |

## Key Features

### Page Routes Manager
- Configure custom page routes and URLs
- Set authentication requirements per page
- Assign minimum role requirements
- Map pages to application levels

### Component Hierarchy Editor
- Visual tree view of component structure
- Drag-and-drop component reorganization
- Add components from catalog
- Real-time hierarchy updates
- Component organization per page

### Component Configuration Dialog
- Configure component properties
- Set custom styles (Tailwind classes + CSS-in-JS)
- Map event handlers to Lua scripts
- JSON-based configuration editing

### User Management
- Create/edit/delete users
- Configure user roles and permissions
- Set user profiles and bios
- SHA-512 password hashing

### Data Schema Designer
- Define data models declaratively
- Field types with validation
- Relationships between models
- Auto-generate CRUD interfaces

### Workflow Builder
- Visual workflow design
- Trigger, action, condition, transform nodes
- Lua script integration
- Edge connections between nodes

### Lua Script System
- Monaco code editor with syntax highlighting
- Live script execution
- Parameter definition
- Return type specification
- Reusable script library
- Common snippet templates

### Database Management
- Complete KV-based persistence
- Export/import functionality
- Stores: users, credentials, pages, components, workflows, schemas, Lua scripts

## Seed Data

The system automatically creates comprehensive seed data including:

### Sample Pages
- Home page (Level 1, public)
- About page (Level 1, public)
- Dashboard (Level 2, user auth)
- Profile (Level 2, user auth)
- Admin Users (Level 3, admin auth)
- Admin Content (Level 3, admin auth)

### Component Hierarchies
- **Home Page**: Full landing page with hero, features grid, and CTA
  - Container with responsive layout
  - Hero section with heading, subtitle, and button
  - 3-column feature cards
  - Call-to-action section
  
- **Dashboard**: User dashboard layout
  - Header with title and status badge
  - Grid of info cards
  - Progress indicators

### Sample Lua Scripts
- Email validation script
- Discount calculator
- Ready-to-use template functions

### Sample Comments
- Pre-populated user comments for testing

## Component Catalog

The platform includes 20+ pre-configured shadcn components:

**Layout**: Container, Flex, Grid, Stack  
**Input**: Button, Input, Textarea, Checkbox, Switch, Slider  
**Typography**: Heading, Text, Label  
**Display**: Card, Badge, Avatar, Separator, Alert  
**Feedback**: Progress, Alert  
**Data**: Table  

Each component includes:
- Default props
- Configurable properties
- Style customization
- Event handler mapping
- Child nesting rules

## Database Schema

The system uses KV storage with the following collections:

```typescript
{
  users: User[]
  credentials: Record<username, passwordHash>
  pages: PageConfig[]
  componentHierarchy: Record<nodeId, ComponentNode>
  componentConfigs: Record<nodeId, ComponentConfig>
  workflows: Workflow[]
  luaScripts: LuaScript[]
  schemas: ModelSchema[]
  comments: Comment[]
  appConfig: AppConfiguration
}
```

## Technical Architecture

### Frontend Stack
- React 19 + TypeScript
- Vite build system
- Tailwind CSS v4
- shadcn/ui components
- Phosphor Icons
- Monaco Editor (code editing)
- Fengari (Lua interpreter)

### State Management
- React hooks for UI state
- Spark KV for persistent data
- Async data loading patterns

### Styling System
- Tailwind utility classes
- CSS custom properties for theming
- Component-level style overrides
- Responsive design patterns

## Usage Guide

### Getting Started
1. Log in with god user (username: `god`, password: `god123`)
2. Navigate to Level 4 (automatically redirected)
3. Explore the different configuration panels

### Creating a New Page
1. Go to "Page Routes" tab
2. Click "New Page Route"
3. Configure path, title, level, and auth requirements
4. Save the page

### Designing Component Layout
1. Go to "Components" tab (Component Hierarchy Editor)
2. Select a page from the dropdown
3. Add components from the catalog (right panel)
4. Drag and drop to reorganize
5. Click gear icon to configure component properties

### Configuring Components
1. In the hierarchy, click the gear icon on any component
2. Switch between Props, Styles, and Events tabs
3. Set component-specific properties
4. Add Tailwind classes or custom styles
5. Map events to Lua script IDs
6. Save configuration

### Managing Users
1. Go to "Users" tab
2. Create new users or edit existing ones
3. Set roles to control access levels
4. Passwords are automatically hashed with SHA-512

### Writing Lua Scripts
1. Go to "Lua Scripts" tab
2. Create a new script
3. Define parameters and return type
4. Write Lua code in Monaco editor
5. Test execution
6. Reference script ID in component event handlers

### Exporting/Importing Data
1. Use the Download button in the header to export entire database
2. Use the Upload button to import previously exported data
3. Data is stored as JSON

## Future Enhancements

Potential additions to the platform:
- Live preview of pages being designed
- Component version control
- Template library for common patterns
- Visual workflow debugger
- API endpoint designer
- Theme customization UI
- Multi-language support
- Collaboration features
- Component marketplace

## Notes

- All data persists in Spark KV storage
- Passwords use SHA-512 hashing
- Component configurations stored separately from hierarchy
- Seed data only loads once (checks for existing pages)
- Full database export/import for backup and migration
