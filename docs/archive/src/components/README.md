# Source Code Components

## Overview
This directory contains all reusable React components organized by architectural pattern.

## Location
[/src/components/](/src/components/)

## Structure

### Atoms
Basic, reusable UI building blocks (buttons, inputs, labels, etc.)

### Molecules
Small groups of atoms that form functional units

### Organisms
Large, complex components composed of groups of molecules/atoms

### Shared
Shared/common components used across multiple contexts

### UI
UI component library (shadcn components and custom wrappers)

### Level-Specific Components
- **level1/**: Level 1 components
- **level2/**: Level 2 components
- **level4/**: Level 4 components
- **level5/**: Level 5 components

## Key Components

### Core Application Components
- `Canvas.tsx` - Main canvas for building interfaces
- `Builder.tsx` - Builder interface
- `GenericPage.tsx` - Generic page renderer
- `RenderComponent.tsx` - Component renderer

### Data Management
- `SchemaEditor.tsx` - Schema editing interface
- `DatabaseManager.tsx` - Database management
- `ModelListView.tsx` - Data model list view
- `RecordForm.tsx` - Form for record editing

### Feature Components
- `WorkflowEditor.tsx` - Workflow editor
- `LuaEditor.tsx` - Lua script editor
- `JsonEditor.tsx` - JSON editor
- `ComponentCatalog.tsx` - Component catalog browser

### Configuration & Admin
- `UserManagement.tsx` - User management interface
- `PackageManager.tsx` - Package management
- `GodCredentialsSettings.tsx` - Credentials management
- `ThemeEditor.tsx` - Theme configuration

### Development Tools
- `NerdModeIDE.tsx` - Advanced IDE for developers
- `LuaSnippetLibrary.tsx` - Lua code snippets
- `QuickGuide.tsx` - Quick reference guide
- `DBALDemo.tsx` - DBAL demonstration

## Component Size Guidelines
All components should be kept under 150 lines of code. Larger components should be split into smaller, more focused components.

## Styling
Components use Tailwind CSS utility classes. See [/docs/src/styles](/docs/src/styles) for styling conventions.

## Related Documentation
- [Component Architecture](/docs/architecture)
- [Rendering System](/docs/implementation/rendering)
