# Package Enhancement Plan

## Overview

Based on analysis of the Next.js frontend, many user-facing features exist in the core app but aren't packaged. This plan outlines which packages need enhancement and which new packages to create.

## Current Package Status

### Existing Packages (44 total)
- admin_dialog, arcade_lobby, audit_log, code_editor, codegen_studio
- config_summary, css_designer, dashboard, data_table, dbal_demo
- form_builder, forum_forge, github_tools, irc_webchat, json_script_example
- lua_test, media_center, nav_menu, notification_center, package_validator
- quick_guide, role_editor, schema_editor, screenshot_analyzer, smtp_config
- social_hub, stats_grid, stream_cast, ui_auth, ui_dialogs, ui_footer
- ui_header, ui_home, ui_intro, ui_login, ui_pages, ui_permissions
- user_manager, workflow_editor

### Missing SVG Icons
**Problem:** No packages currently have SVG icons in `static_content/icon.svg`

**Solution:** Create SVG icons for all 44 packages

## Priority 1: Add SVG Icons to All Packages

### Icon Categories

**Auth & User Management (🔐)**
- ui_auth, ui_login, user_manager, ui_permissions, role_editor

**UI Components (🎨)**
- ui_header, ui_footer, ui_home, ui_intro, ui_pages, ui_dialogs
- nav_menu, admin_dialog

**Developer Tools (⚙️)**
- code_editor, schema_editor, workflow_editor, package_validator
- codegen_studio, lua_test, json_script_example

**Media & Content (📱)**
- media_center, social_hub, stream_cast, screenshot_analyzer
- forum_forge, irc_webchat

**Data & Analytics (📊)**
- dashboard, stats_grid, data_table, audit_log

**Configuration (🔧)**
- config_summary, css_designer, smtp_config, dbal_demo

**Entertainment (🎮)**
- arcade_lobby, quick_guide

**Integration (🔗)**
- github_tools, notification_center

## Priority 2: Enhance Existing Packages

### Packages Needing Major Updates

#### 1. **user_manager** → Add Full CRUD
**Current:** Basic user list
**Add:**
- User creation form
- User editing dialog
- Role assignment UI
- Password reset
- User search/filter
- User statistics

**Files to Reference:**
- `/components/level/levels/Level3.tsx` - Admin user management
- `/components/dialogs/EditUserDialog.tsx`
- `/lib/db/users/` - All user operations

#### 2. **ui_auth** → Complete Auth System
**Current:** Basic auth components
**Add:**
- Registration form
- Password change dialog
- Session management UI
- "Forgot password" flow
- Social login buttons (placeholders)
- Two-factor auth UI (future)

**Files to Reference:**
- `/components/auth/UnifiedLogin.tsx`
- `/components/dialogs/PasswordChangeDialog.tsx`
- `/lib/auth/` - Auth system

#### 3. **dashboard** → Rich Analytics
**Current:** Basic dashboard
**Add:**
- User count widget
- Comment statistics
- Recent activity feed
- System health indicators
- Chart components
- Customizable widgets

**Files to Reference:**
- `/components/level/levels/Level2.tsx` - User dashboard
- `/components/level/levels/Level3.tsx` - Admin dashboard
- `/api/levels/metrics/route.ts`

#### 4. **workflow_editor** → Visual Builder
**Current:** Basic workflow UI
**Add:**
- Node palette (start, action, condition, end)
- Visual canvas with drag-drop
- Node connection editor
- Workflow execution controls
- Variable inspector
- Execution history

**Files to Reference:**
- `/components/managers/workflow/WorkflowEditor.tsx`
- `/lib/workflow/` - Workflow engine
- `/lib/db/workflows/` - DB operations

#### 5. **schema_editor** → Data Model Builder
**Current:** Basic schema UI
**Add:**
- Field type selector
- Validation rules builder
- Relationship mapper
- Schema visualization
- Import/export schemas
- Generate forms from schema

**Files to Reference:**
- `/components/managers/schema/SchemaEditorLevel4.tsx`
- `/lib/db/core/types.ts` - Schema types

#### 6. **admin_dialog** → Full Admin Panel
**Current:** Basic admin UI
**Add:**
- Database manager
- Error logs viewer
- System settings
- God credentials manager
- Power transfer UI
- Database export/import

**Files to Reference:**
- `/components/managers/database/DatabaseManager.tsx`
- `/components/managers/errors/ErrorLogsTab.tsx`
- `/lib/db/power-transfers/` - Power transfer operations

## Priority 3: Create New Packages

### 1. **theme_editor** (NEW)
**Purpose:** Customize application themes
**Components:**
- Color palette editor (light/dark)
- CSS variable manager
- Border radius controls
- Font family selector
- Theme preview
- Export/import themes

**Reference:**
- `/components/managers/theme/ThemeEditor.tsx`

### 2. **page_builder** (NEW)
**Purpose:** Create dynamic pages
**Components:**
- Page route manager
- Component tree editor
- Auth requirements setter
- Page metadata editor
- Visual page preview
- Template library

**Reference:**
- `/components/managers/page-routes/PageRoutesManager.tsx`
- `/lib/ui-pages/` - Page loading

### 3. **comment_system** (NEW)
**Purpose:** User comments and discussions
**Components:**
- Comment list
- Comment form
- Reply threading
- Comment moderation (admin)
- User mention autocomplete
- Rich text editor

**Reference:**
- Level 2/3 comment components
- `/lib/db/comments/` - Comment operations

### 4. **power_manager** (NEW)
**Purpose:** SuperGod power transfers
**Components:**
- Power transfer request form
- Pending requests list
- Accept/reject dialogs
- Power history log
- Request expiry timer

**Reference:**
- `/components/level/levels/Level5.tsx`
- `/lib/db/power-transfers/`

### 5. **tenant_manager** (NEW)
**Purpose:** Multi-tenant administration
**Components:**
- Tenant list
- Create tenant dialog
- Tenant switching UI
- Tenant settings
- Tenant statistics
- Data isolation viewer

**Reference:**
- Level 5 tenant management
- `/app/[tenant]/` - Tenant routing

### 6. **error_dashboard** (NEW)
**Purpose:** Error tracking and monitoring
**Components:**
- Error list with filtering
- Error statistics charts
- Error details viewer
- Stack trace formatter
- Clear logs button
- Error severity badges

**Reference:**
- `/components/managers/errors/ErrorLogsTab.tsx`

### 7. **css_manager** (NEW)
**Purpose:** Custom CSS class management
**Components:**
- CSS class list
- Class editor
- Category organization
- CSS rule builder
- Class preview
- Export CSS

**Reference:**
- `/components/managers/css/CssClassManager.tsx`
- `/lib/db/css-classes/`

### 8. **dropdown_manager** (NEW)
**Purpose:** Configure dropdown options
**Components:**
- Dropdown list
- Option editor
- Value/label pairs
- Dropdown preview
- Import/export configs

**Reference:**
- `/components/managers/dropdown/DropdownConfigManager.tsx`

## Priority 4: Package Metadata Enhancements

### Add to ALL Packages

#### 1. **SVG Icons**
Create `static_content/icon.svg` for each package with:
- Consistent size (64x64 viewBox)
- Simple, recognizable design
- Package-appropriate symbolism
- Monochrome or 2-color max

#### 2. **Enhanced package.json**
Add missing fields:
```json
{
  "icon": "static_content/icon.svg",
  "keywords": ["user", "management", "admin"],
  "homepage": "https://metabuilder.dev/packages/user_manager",
  "storybook": {
    "featured": true,
    "category": "Administration"
  }
}
```

#### 3. **README Files**
Create `README.md` for each package:
- Description
- Features list
- Screenshots (optional)
- Usage examples
- Configuration options
- Dependencies

#### 4. **Storybook Stories**
Add `storybook.json` configuration:
```json
{
  "stories": [
    {
      "name": "Default View",
      "type": "component",
      "component": "UserManager",
      "props": {
        "users": []
      }
    }
  ]
}
```

## Implementation Plan

### Phase 1: Icons (Week 1)
1. Design icon system and templates
2. Create SVG icons for all 44 packages
3. Add to `static_content/icon.svg`
4. Update package.json to reference icons

### Phase 2: Enhance Existing (Weeks 2-3)
1. user_manager - Full CRUD
2. ui_auth - Complete auth flows
3. dashboard - Rich widgets
4. workflow_editor - Visual builder
5. schema_editor - Model builder
6. admin_dialog - Full admin panel

### Phase 3: New Packages (Weeks 4-5)
1. theme_editor
2. page_builder
3. comment_system
4. power_manager
5. tenant_manager
6. error_dashboard
7. css_manager
8. dropdown_manager

### Phase 4: Documentation (Week 6)
1. README for all packages
2. Storybook configurations
3. Usage examples
4. API documentation

## Success Metrics

- ✅ All 44 packages have SVG icons
- ✅ Top 6 packages enhanced with full features
- ✅ 8 new packages created
- ✅ All packages have README
- ✅ All packages have Storybook stories
- ✅ 100% JSON format (no Lua)
- ✅ Full schema validation

## Next Steps

1. **Immediate:** Create SVG icon template
2. **Day 1:** Generate 10 icons for priority packages
3. **Day 2:** Generate remaining 34 icons
4. **Week 1:** Start enhancing user_manager
5. **Week 2:** Continue with ui_auth and dashboard
