# Missing Packages Analysis

## Overview

Analysis of the Next.js frontend reveals **7 high-priority user-facing features** that exist in the core application but lack dedicated packages, plus several medium-priority features.

## Current Status

- **Total Packages**: 44 (including testing)
- **Packages with SVG Icons**: 44 (100%)
- **Packages with JSON Tests**: 44 (100%)
- **Features Missing Packages**: 10 major features

---

## HIGH PRIORITY - User-Facing Managers

These are fully-featured management interfaces used by admins and power users:

### 1. Database Manager
**Location**: [frontends/nextjs/src/components/managers/database/DatabaseManager.tsx](frontends/nextjs/src/components/managers/database/DatabaseManager.tsx)

**Current Features**:
- Database connection management
- Schema visualization with entity list
- Database export/import (JSON format)
- Statistics dashboard
- Database initialization wizard
- Clear database functionality
- God mode operations

**Package to Create**: `database_manager`

**Category**: tools

**Min Level**: 5 (SuperGod only)

**Components to Include**:
- DatabaseManager (main component)
- DatabaseStats
- ExportImportPanel
- SchemaVisualizer

**Scripts/Functions**:
- exportDatabase
- importDatabase
- clearDatabase
- initializeDatabase
- getStatistics

---

### 2. Package Manager
**Location**: [frontends/nextjs/src/components/managers/package/PackageManager.tsx](frontends/nextjs/src/components/managers/package/PackageManager.tsx)

**Current Features**:
- Browse all available packages
- Install/uninstall packages
- Enable/disable package toggle
- Package details view with metadata
- Package import/export
- Category filtering (ui, managers, tools, etc.)
- Dependency management and visualization
- Search and filter functionality
- Package validation

**Package to Create**: `package_manager`

**Category**: tools

**Min Level**: 4 (Admin)

**Components to Include**:
- PackageManager (main component)
- PackageBrowser
- PackageCard
- PackageDetails
- DependencyViewer

**Scripts/Functions**:
- listPackages
- installPackage
- uninstallPackage
- togglePackage
- validatePackage
- getPackageInfo

---

### 3. Theme Editor
**Location**: [frontends/nextjs/src/components/editors/ThemeEditor.tsx](frontends/nextjs/src/components/editors/ThemeEditor.tsx)

**Current Features**:
- Color palette editor (light/dark modes)
- CSS variable management
- Theme customization
- Live preview pane
- Border radius controls
- Font family selector
- Export/import themes

**Package to Create**: `theme_editor`

**Category**: tools

**Min Level**: 3 (Moderator)

**Components to Include**:
- ThemeEditor (main component)
- ColorPicker
- ThemePreview
- CSSVariableEditor

**Scripts/Functions**:
- saveTheme
- loadTheme
- exportTheme
- importTheme
- applyTheme

---

### 4. Dropdown Config Manager
**Location**: [frontends/nextjs/src/components/managers/dropdown/DropdownConfigManager.tsx](frontends/nextjs/src/components/managers/dropdown/DropdownConfigManager.tsx)

**Current Features**:
- Dynamic dropdown configuration
- Reusable option sets
- Value/label pair management
- Preview pane with live dropdown
- CRUD operations for dropdown configs
- Search and filter dropdowns

**Package to Create**: `dropdown_manager`

**Category**: managers

**Min Level**: 4 (Admin)

**Components to Include**:
- DropdownConfigManager
- DropdownEditor
- DropdownPreview
- OptionsList

**Scripts/Functions**:
- createDropdown
- updateDropdown
- deleteDropdown
- getDropdownOptions

**Database**: Already has `dropdown-configs` table in [lib/db/dropdown-configs/](frontends/nextjs/src/lib/db/dropdown-configs/)

---

### 5. Route Manager (Page Routes Manager)
**Location**: [frontends/nextjs/src/components/managers/page-routes/PageRoutesManager.tsx](frontends/nextjs/src/components/managers/page-routes/PageRoutesManager.tsx)

**Current Features**:
- Page route configuration
- Path and URL management
- Access level settings (public, user, admin, god)
- Authentication requirements
- Route preview
- Dynamic page generation
- Route validation

**Package to Create**: `route_manager`

**Category**: tools

**Min Level**: 4 (Admin)

**Components to Include**:
- PageRoutesManager
- RouteEditor
- RouteList
- AccessControlSettings

**Scripts/Functions**:
- createRoute
- updateRoute
- deleteRoute
- validateRoute

**Related DB**: `ui_pages` table in [lib/db/ui-pages/](frontends/nextjs/src/lib/db/ui-pages/)

---

### 6. Component Editor
**Location**: [frontends/nextjs/src/components/managers/component/](frontends/nextjs/src/components/managers/component/)

**Current Features**:
- Component hierarchy editor (tree view)
- Component catalog/browser
- Drag-and-drop hierarchy management
- Component configuration
- Node management (add/remove/reorder)
- Component templates
- Search functionality

**Package to Create**: `component_editor`

**Category**: tools

**Min Level**: 4 (Admin)

**Components to Include**:
- ComponentHierarchyEditor
- ComponentCatalog
- ComponentTree
- ComponentConfig

**Scripts/Functions**:
- buildComponentTree
- addComponent
- removeComponent
- reorderComponents
- validateHierarchy

**Related DB**: `component_hierarchy` and `component_config` tables

---

### 7. Nerd Mode IDE
**Location**: [frontends/nextjs/src/components/nerd-mode-ide/](frontends/nextjs/src/components/nerd-mode-ide/)

**Current Features**:
- File explorer with tree view
- Multi-file code editor (Monaco integration)
- Console panel for output/logs
- Git panel for version control
- Test runner integration
- Template system (50+ code templates)
- File management (create, delete, rename)
- Export to ZIP functionality
- Syntax highlighting
- Auto-formatting
- Search and replace

**Package to Create**: `nerd_mode_ide`

**Category**: tools

**Min Level**: 4 (Admin)

**Components to Include**:
- NerdModeIDE (main component)
- FileExplorer
- CodeEditor
- ConsolePanel
- GitPanel
- TestRunner
- TemplateGallery

**Scripts/Functions**:
- fileOperations
- templateGeneration
- testExecution
- gitOperations
- exportProject

**Special Features**:
- 50+ templates in [templates/](frontends/nextjs/src/components/nerd-mode-ide/templates/)
- Panel management system
- File tree navigation

---

## MEDIUM PRIORITY - Builder & Rendering

### 8. Page Builder
**Location**: [frontends/nextjs/src/components/rendering/](frontends/nextjs/src/components/rendering/)

**Current Features**:
- Declarative component renderer
- Property inspector
- Field renderer with validation
- Canvas-based builder
- Component registry integration
- Icon registry
- Drag-and-drop interface
- Visual page composition

**Package to Create**: `page_builder`

**Category**: tools

**Min Level**: 3 (Moderator)

**Components to Include**:
- PageBuilder
- ComponentCanvas
- PropertyInspector
- ComponentRegistry
- FieldRenderer

**Scripts/Functions**:
- renderComponent
- validateProperties
- buildPage
- exportPage

---

### 9. JSON Editor
**Location**: [frontends/nextjs/src/components/editors/JsonEditor.tsx](frontends/nextjs/src/components/editors/JsonEditor.tsx)

**Current Features**:
- Monaco editor for JSON
- Schema section view
- Toolbar utilities
- JSON validation
- Auto-formatting

**Package to Create**: `json_editor` or merge with `code_editor`

**Category**: tools

**Min Level**: 3 (Moderator)

**Note**: Could be enhanced version of existing `code_editor` package with JSON-specific features

---

### 10. Admin Tools
**Location**: [frontends/nextjs/src/components/misc/auth/GodCredentialsSettings.tsx](frontends/nextjs/src/components/misc/auth/GodCredentialsSettings.tsx)

**Current Features**:
- God credentials expiry management
- Duration configuration
- Auto-hide system settings
- First-login flag management
- Credential security controls

**Package to Create**: `admin_tools` or merge with `admin_dialog`

**Category**: tools

**Min Level**: 5 (SuperGod)

**Note**: Could be part of existing `admin_dialog` package

---

## FEATURES ALREADY PACKAGED ✅

These features exist in the frontend and HAVE corresponding packages:

| Feature | Package | Status |
|---------|---------|--------|
| User Management | `user_manager` | ✅ Has package, needs enhancement |
| Code Editor | `code_editor` | ✅ Complete |
| Schema Editor | `schema_editor` | ✅ Complete |
| Workflow Editor | `workflow_editor` | ✅ Complete |
| Form Builder | `form_builder` | ✅ Complete |
| Data Table | `data_table` | ✅ Complete |
| CSS Designer | `css_designer` | ✅ Complete |
| Dashboard | `dashboard` | ✅ Has package, needs widgets |
| Auth UI | `ui_auth` | ✅ Complete |
| Login UI | `ui_login` | ✅ Complete |
| Permissions | `ui_permissions` | ✅ Complete |
| Navigation Menu | `nav_menu` | ✅ Complete |
| Admin Dialog | `admin_dialog` | ✅ Has package, could add more |
| Role Editor | `role_editor` | ✅ Complete |
| Screenshot Analyzer | `screenshot_analyzer` | ✅ Complete |
| GitHub Tools | `github_tools` | ✅ Complete |
| SMTP Config | `smtp_config` | ✅ Complete |
| Quick Guide | `quick_guide` | ✅ Complete |
| IRC Webchat | `irc_webchat` | ✅ Complete |
| Media Center | `media_center` | ✅ Complete |
| Social Hub | `social_hub` | ✅ Complete |
| Stream Cast | `stream_cast` | ✅ Complete |
| Arcade Lobby | `arcade_lobby` | ✅ Complete |
| Forum Forge | `forum_forge` | ✅ Complete |
| Stats Grid | `stats_grid` | ✅ Complete |
| Notification Center | `notification_center` | ✅ Complete |
| Audit Log | `audit_log` | ✅ Complete |
| Config Summary | `config_summary` | ✅ Complete |
| Package Validator | `package_validator` | ✅ Complete |
| UI Level 2-6 | `ui_level2` through `ui_level6` | ✅ Complete |
| Codegen Studio | `codegen_studio` | ✅ Complete |
| DBAL Demo | `dbal_demo` | ✅ Complete |

---

## DATABASE ENTITIES (ALL HAVE UI)

All these database entities have CRUD operations and UI components in the frontend:

**Location**: [frontends/nextjs/src/lib/db/](frontends/nextjs/src/lib/db/)

1. **users** - User management with roles
2. **comments** - Comment system
3. **workflows** - Workflow definitions
4. **schemas** - Data schemas
5. **ui_pages** - Page configurations
6. **component_hierarchy** - Component tree structure
7. **component_config** - Component configurations
8. **css_classes** - CSS class library
9. **dropdown_configs** - Dynamic dropdowns
10. **tenants** - Multi-tenancy support
11. **packages** - Package metadata
12. **power_transfers** - God power transfers
13. **error_logs** - System error tracking
14. **sessions** - User sessions
15. **smtp_config** - Email configuration
16. **app_config** - Application settings

**Most have UI but some lack dedicated packages** (covered by manager packages above)

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Managers (Weeks 1-2)
1. **database_manager** - Database administration
2. **package_manager** - Package lifecycle management
3. **route_manager** - Page routing and configuration

### Phase 2: Customization Tools (Weeks 3-4)
4. **theme_editor** - Theme and styling customization
5. **dropdown_manager** - Dropdown configuration
6. **component_editor** - Component hierarchy management

### Phase 3: Advanced Tools (Weeks 5-6)
7. **nerd_mode_ide** - Full IDE for developers
8. **page_builder** - Visual page composition
9. **json_editor** - JSON editing (or enhance code_editor)
10. **admin_tools** - Admin utilities (or enhance admin_dialog)

---

## PACKAGE ENHANCEMENT NEEDS

Some existing packages need enhancement to match frontend features:

### user_manager
**Current**: Basic user list
**Add**:
- User creation form
- User editing dialog (already in frontend at [components/dialogs/EditUserDialog.tsx](frontends/nextjs/src/components/dialogs/EditUserDialog.tsx))
- Role assignment UI
- Password reset
- User search/filter
- User statistics

### dashboard
**Current**: Basic dashboard
**Add**:
- User count widget
- Comment statistics
- Recent activity feed
- System health indicators
- Chart components
- Customizable widgets

### admin_dialog
**Current**: Basic admin UI
**Add**:
- Database manager integration
- Error logs viewer (already in [components/managers/errors/ErrorLogsTab.tsx](frontends/nextjs/src/components/managers/errors/ErrorLogsTab.tsx))
- System settings panel
- God credentials manager
- Power transfer UI
- Database export/import

---

## FILE REFERENCE INDEX

All paths are relative to `/home/rewrich/Documents/GitHub/metabuilder/frontends/nextjs/src/`

### Manager Components
- Database Manager: `components/managers/database/DatabaseManager.tsx`
- Package Manager: `components/managers/package/PackageManager.tsx`
- CSS Class Manager: `components/managers/css/CssClassManager.tsx`
- Dropdown Config Manager: `components/managers/dropdown/DropdownConfigManager.tsx`
- Page Routes Manager: `components/managers/page-routes/PageRoutesManager.tsx`
- Component Hierarchy Editor: `components/managers/component/ComponentHierarchyEditor.tsx`
- Component Catalog: `components/managers/component/ComponentCatalog.tsx`
- Error Logs Tab: `components/managers/errors/ErrorLogsTab.tsx`

### Editors
- Theme Editor: `components/editors/ThemeEditor.tsx`
- Code Editor: `components/editors/CodeEditor.tsx`
- Schema Editor: `components/editors/schema/SchemaEditor.tsx`
- JSON Editor: `components/editors/JsonEditor.tsx`

### Nerd Mode IDE
- Main IDE: `components/nerd-mode-ide/core/NerdModeIDE.tsx`
- File Explorer: `components/nerd-mode-ide/core/FileExplorer.tsx`
- Console Panel: `components/nerd-mode-ide/core/ConsolePanel.tsx`
- Git Panel: `components/nerd-mode-ide/core/GitPanel.tsx`
- Templates: `components/nerd-mode-ide/templates/`

### Rendering System
- Declarative Renderer: `components/rendering/DeclarativeComponentRenderer.tsx`
- Property Inspector: `components/rendering/PropertyInspector.tsx`
- Component Registry: `lib/rendering/component-registry/`

### Database Operations
- All DB operations: `lib/db/*/`
- Users: `lib/db/users/`
- Comments: `lib/db/comments/`
- Workflows: `lib/db/workflows/`
- UI Pages: `lib/db/ui-pages/`
- Tenants: `lib/db/tenants/`
- Power Transfers: `lib/db/power-transfers/`

### Level Components
- Level 1 (Home): `components/level1/`
- Level 2 (User): `components/level2/`
- Level 3 (Admin): `components/level/levels/Level3.tsx`
- Level 4 (Builder): `components/level/levels/Level4.tsx`
- Level 5 (SuperGod): `components/level/levels/Level5.tsx`

### Dialogs
- Edit User Dialog: `components/dialogs/EditUserDialog.tsx`
- Password Change Dialog: `components/dialogs/PasswordChangeDialog.tsx`
- Various confirmation dialogs: `components/dialogs/`

---

## NEXT STEPS

1. **Create 7 high-priority packages** for manager components
2. **Enhance 3 existing packages** (user_manager, dashboard, admin_dialog)
3. **Add SVG icons** for all new packages
4. **Create JSON tests** for all new packages
5. **Update documentation** with new package capabilities

This analysis reveals the Next.js frontend is feature-rich with well-organized components that can be extracted into reusable packages following the established JSON-based package format.

---

**Analysis Date**: 2026-01-02
**Total Features Identified**: 10 missing packages + 3 needing enhancement
**Files Analyzed**: 200+ component, manager, and library files
