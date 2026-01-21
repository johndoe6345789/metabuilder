# Package Migration Roadmap: Old System → MetaBuilder JSON

> **Status**: Analysis Complete - Ready for Implementation
>
> **Purpose**: Migrate all functionality from `/old/` legacy system into modern MetaBuilder packages using JSON-based components and DBAL

---

## Executive Summary

The subagent exploration of `/old/` system identified **three major functional areas** that need to be migrated to the new packages structure:

1. **Login System** (ui_login package)
2. **Dashboard System** (dashboard package)
3. **Admin System** (user_manager, package_manager, database_manager packages)

Each area has been thoroughly analyzed and mapped to:
- Required database entities (YAML schemas)
- JSON component definitions (using 151+ fakemui components)
- PageConfig routes
- Permission levels and ACL rules
- Data querying patterns via DBAL

---

## 1. LOGIN SYSTEM MIGRATION

### Package: `ui_login`
**Location**: `/packages/ui_login/`

### Current Status
✅ Route defined: `/login` in page-config.json

### What's Needed
- ❌ Login form component (JSON definition)
- ❌ Default users seed data
- ❌ Default credentials seed data
- ⚠️ Session management after successful login

### Database Entities
- **User** ✅ (defined in YAML)
- **Credential** ✅ (defined in YAML)

### Component Definitions Needed
```
login_form - Main login form component
  - Fields: username/email, password, remember-me
  - Validation: required fields, format validation
  - Actions: submit login, navigate to register, forgot password
  - Uses fakemui: Card, TextField, Button, Checkbox, Alert
```

### Seed Data Needed
**File**: `/dbal/shared/seeds/database/users.yaml` (NEW)
```yaml
- username: admin
  email: admin@builder.com
  role: admin
  profilePicture: null
  bio: "System Administrator"

- username: testuser
  email: testuser@builder.com
  role: user
  bio: "Test user for E2E tests"
```

**File**: `/dbal/shared/seeds/database/credentials.yaml` (NEW)
```yaml
- username: admin
  passwordHash: "[SHA-512 hash of password]"

- username: testuser
  passwordHash: "[SHA-512 hash of password]"
```

### API Integration
- **Endpoint**: `POST /api/v1/default/auth/login`
- **Payload**: `{ identifier: string, password: string }`
- **Response**: `{ success: boolean, user: User, error?: string }`

### Tests Affected
- ✅ Flow 1.3 - Navigation to login from CTA
- ❌ Flow 2.1 - Login page renders with form
- ❌ Flow 2.2 - Login validation
- ❌ Flow 2.3 - Login with test credentials
- ❌ Flow 2.4 - Session persists on reload

---

## 2. DASHBOARD SYSTEM MIGRATION

### Package: `dashboard`
**Location**: `/packages/dashboard/`

### Current Status
✅ Route defined: `/dashboard` in page-config.json (basic)
⚠️ Component definitions partially defined

### What's Needed
- ❌ Dashboard home component (user greeting, quick links)
- ❌ User profile view & edit components
- ❌ Comments list component (with pagination)
- ❌ Post comment form component
- ❌ Webchat interface component
- ❌ Page routes for all dashboard pages (6+ new routes)

### Database Entities
- **User** ✅ (defined in YAML)
- **ForumPost** ✅ (use for comments)
- **ForumThread** ✅ (container for comments)
- **IRCChannel** ✅ (chat channels)
- **IRCMessage** ✅ (chat messages)

### Pages to Create
| Path | Component | Auth | Level | Purpose |
|------|-----------|------|-------|---------|
| `/dashboard` | `dashboard_home` | Yes | 1 | Main dashboard landing |
| `/dashboard/profile` | `dashboard_profile` | Yes | 1 | User profile management |
| `/dashboard/comments` | `dashboard_comments` | Yes | 1 | User's comments list |
| `/dashboard/community` | `community_comments` | Yes | 1 | All community comments |
| `/dashboard/chat` | `irc_chat` | Yes | 1 | Webchat interface |

### Component Definitions Needed
```
dashboard_home
  - Displays user greeting, quick stats, shortcuts
  - Uses: Card, Grid, Button, Avatar, Typography

dashboard_profile
  - Edit mode: username, email, bio, avatar
  - Read mode: profile info display
  - Uses: TextField, Card, Avatar, Button

dashboard_comments
  - List of user's comments with pagination
  - Delete button per comment
  - Uses: Table, TablePagination, Avatar, Button, Chip

comment_form
  - Textarea for new comment
  - Submit button
  - Uses: Textarea, Button, Card

irc_chat
  - Message list (scrollable)
  - Message input field
  - Online users list
  - Uses: List, TextField, Avatar, Button, Divider
```

### Pagination Requirements
- Comments list: 10 items per page
- Community comments: 20 items per page
- Chat history: 50 messages per page
- Use `TablePagination` component with DBAL `limit`/`offset`

### Tests Affected
- ✅ Flow 1.1 - Home page loads
- ❌ Flow 3.1 - Dashboard displays user profile
- ❌ Flow 3.2 - Dashboard shows available packages
- ❌ Flow 3.3 - Dashboard navigation menu works

---

## 3. ADMIN SYSTEM MIGRATION

### Packages
- `user_manager` - User management interface
- `package_manager` - Package installation/management
- `database_manager` - Database administration
- `role_editor` - Role management (optional)
- `schema_editor` - Schema management (optional)

### Permission Levels
```
Level 3 (Admin):        /admin/users
Level 4 (God):          /admin/packages, /admin/database, /admin/schemas
Level 5 (SuperGod):     /admin/tenants, /admin/power-transfer
```

### User Manager (Level 3+)

**Pages to Create**:
```
/admin/users - User list with CRUD
/admin/users/create - Create user form
/admin/users/[id] - Edit user form
/admin/users/[id]/delete - Delete confirmation
```

**Component Definitions**:
```
user_list_table
  - Columns: Avatar, Username, Email, Role (badge), Created Date
  - Sorting: Click headers to sort
  - Filtering: By role, search by username/email
  - Actions: Edit, Delete
  - Uses: Table, Avatar, Badge, Button, TextField, Select

user_form
  - Fields: username (read-only), email, role, bio, profilePicture
  - Validation: Email format, role selection
  - Uses: TextField, Select, Textarea, Button, Card

role_badge
  - Color-coded role display (god=purple, admin=orange, user=blue)
  - Uses: Chip or Badge component
```

**Database Queries**:
```typescript
// List users with pagination
const users = await db.users.list({
  limit: 10,
  offset: (page - 1) * 10,
  orderBy: { createdAt: 'desc' }
})

// Find user by ID
const user = await db.users.findOne({ id: userId })

// Create user
const newUser = await db.users.create({
  username: 'john_doe',
  email: 'john@example.com',
  role: 'user'
})

// Update user
await db.users.update(userId, { role: 'admin', bio: '...' })

// Delete user
await db.users.delete(userId)
```

### Package Manager (Level 4+)

**Pages to Create**:
```
/admin/packages - Installed packages list
/admin/packages/catalog - Available packages to install
/admin/packages/[id]/settings - Package configuration
```

**Component Definitions**:
```
package_list
  - Display: Package name, version, enabled toggle, uninstall button
  - Sorting: By name, by install date
  - Filtering: By category
  - Uses: Table, Toggle, Button, Badge

package_card
  - Package name, description, version, downloads, rating
  - Install button (for catalog view)
  - Uses: Card, Button, Chip, Typography

installed_packages_table
  - Quick view of installed packages
  - Enable/disable toggle per package
  - Uses: Table, Toggle, Button
```

**Database Queries**:
```typescript
// List installed packages
const installed = await db.installedPackages.list({
  filter: { tenantId: currentTenant.id }
})

// Update package status
await db.installedPackages.update(packageId, { enabled: false })

// Install package
await db.installedPackages.create({
  packageId: 'dashboard',
  version: '1.0.0',
  enabled: true
})
```

### Database Manager (Level 5)

**Pages to Create**:
```
/admin/database - Statistics & management
/admin/database/export - Export database
/admin/database/import - Import database
```

**Component Definitions**:
```
database_stats
  - Cards showing: Users count, Comments count, Workflows count, etc.
  - Action buttons: Clear database, Export, Import
  - Uses: Card, Button, Typography, Grid

export_import_dialog
  - Download/upload database as JSON
  - Progress indicators
  - Confirmation dialogs
  - Uses: Dialog, Button, ProgressBar, Alert
```

---

## Implementation Priority

### Phase 1 (MVP) - Complete E2E Test Coverage
**Target**: Get 73 failing tests to pass

1. ✅ Create page routes (DONE - page-config.json files created)
2. ❌ Create login form component
3. ❌ Create default users seed data
4. ❌ Create dashboard home component
5. ❌ Create user profile component
6. ❌ Create admin users list component

**Estimated Impact**: 30-40 tests passing

### Phase 2 (Core Features)
6. ❌ Implement pagination for all lists
7. ❌ Create comments list component
8. ❌ Create package manager interface
9. ❌ Create database admin interface
10. ❌ Add all CRUD operations

**Estimated Impact**: 60-80 tests passing

### Phase 3 (Polish & Advanced)
11. ❌ Add search/filtering to all lists
12. ❌ Implement real-time chat (optional)
13. ❌ Add form validation
14. ❌ Add loading states
15. ❌ Add error boundaries

**Estimated Impact**: 95+ tests passing

---

## File Creation Checklist

### Login Package
- [ ] `/packages/ui_login/components/ui.json` - Add login_form component
- [ ] `/dbal/shared/seeds/database/users.yaml` - Default users (NEW)
- [ ] `/dbal/shared/seeds/database/credentials.yaml` - User passwords (NEW)

### Dashboard Package
- [ ] `/packages/dashboard/components/ui.json` - Expand components
- [ ] `/packages/dashboard/page-config/page-config.json` - Add new routes
- [ ] `/packages/dashboard/components/dashboard-home.json` - Home component
- [ ] `/packages/dashboard/components/user-profile.json` - Profile component
- [ ] `/packages/dashboard/components/comments-list.json` - Comments component
- [ ] `/packages/dashboard/components/chat.json` - Chat component

### Admin Packages
- [ ] `/packages/user_manager/components/ui.json` - User management components
- [ ] `/packages/user_manager/page-config/page-config.json` - Admin user routes
- [ ] `/packages/package_manager/components/ui.json` - Package manager components
- [ ] `/packages/package_manager/page-config/page-config.json` - Admin package routes
- [ ] `/packages/database_manager/components/ui.json` - Database admin components
- [ ] `/packages/database_manager/page-config/page-config.json` - Admin database routes

---

## Key Integration Points

### DBAL Client Usage
All components should use the new DBAL client pattern:
```typescript
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
const users = await db.users.list()
```

### Fakemui Component Registry
Use the 151+ available components in:
```typescript
// /frontends/nextjs/src/lib/fakemui-registry.ts
// Components available: Button, TextField, Table, Card, Avatar, Badge, etc.
```

### JSON Component Format
All components defined using MetaBuilder JSON schema:
```json
{
  "id": "component_id",
  "name": "ComponentName",
  "render": {
    "type": "Container",
    "children": [...]
  }
}
```

---

## Testing Strategy

### E2E Tests
Use Playwright tests to verify:
- Pages navigate correctly
- Components render
- CRUD operations work
- Permission checks enforced
- Pagination works
- Search/filter works

### Test Categories
- ✅ api_tests - REST API endpoints
- ❌ pagination - List pagination
- ❌ dashboard - Dashboard pages
- ❌ auth - Login/authentication
- ❌ crud - Create, read, update, delete
- ❌ ui_home - Home page
- ❌ admin - Admin pages
- ❌ system_critical_flows - End-to-end user flows

---

## Notes & Considerations

### Session Management
- After successful login, create session/JWT token
- Store in `mb_session` cookie
- Validate in middleware for protected routes

### Password Security
- Current system uses SHA-512 (not bcrypt/Argon2) - SECURITY NOTE
- Consider upgrading to bcrypt in Phase 2

### Multi-Tenancy
- System supports multi-tenant via `tenantId` field
- For MVP, use "default" tenant only
- Allow super god to create new tenants in Phase 2

### Real-Time Features
- Chat messages currently static
- Could add WebSocket support in Phase 3
- For MVP, use polling/refresh pattern

### Component Reusability
- Create generic `TableWithPagination` component
- Create generic `EntityForm` component
- Create generic `CRUD Manager` component
- Reuse across user_manager, package_manager, etc.

---

## Success Metrics

### Phase 1 Completion
- ✅ 50+ tests passing
- ✅ Login system working
- ✅ Dashboard accessible
- ✅ All critical flows passing

### Phase 2 Completion
- ✅ 80+ tests passing
- ✅ All CRUD operations working
- ✅ Pagination functional
- ✅ Admin interfaces operational

### Phase 3 Completion
- ✅ 95+ tests passing
- ✅ Search/filter working
- ✅ Real-time features (if implemented)
- ✅ Full system functional

---

## References

- **E2E Tests**: `/packages/system_critical_flows/playwright/tests.json`
- **Failing Tests**: 95 tests with "element not found" errors
- **Old System**: `/old/` directory contains legacy implementation
- **DBAL**: `/dbal/development/src/` contains data access layer
- **Fakemui**: `/frontends/nextjs/src/lib/fakemui-registry.ts` - 151+ components
- **Schemas**: `/dbal/shared/api/schema/entities/` - Database entity definitions

---

## Next Steps

1. **Immediate** (Next commit):
   - Create default users and credentials seed data
   - Create login form component definition

2. **Week 1**:
   - Create dashboard components
   - Create admin user manager interface
   - Verify 50+ tests passing

3. **Week 2**:
   - Create package manager interface
   - Create database admin interface
   - Implement pagination

4. **Week 3+**:
   - Add search/filtering
   - Add form validation
   - Polish and testing

---

**Generated**: Analysis from subagent exploration of `/old/` system
**Status**: Ready for implementation
**Next**: Dispatch implementation subagents to create component definitions and seed data
