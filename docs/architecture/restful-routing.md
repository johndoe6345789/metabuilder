# RESTful Multi-Tenant Routing Architecture

## Overview

MetaBuilder uses a unified RESTful routing pattern across all frontends and the DBAL daemon. This pattern provides consistent, predictable URLs for accessing tenant-scoped, package-specific data with full authentication, authorization, and tenant isolation.

## Route Pattern

```
/{tenant}/{package}/{entity}[/{id}[/{action}]]
```

### Components

| Segment    | Required | Description                              | Example            |
|------------|----------|------------------------------------------|--------------------|
| `tenant`   | Yes      | Tenant username or slug                  | `acme`, `testuser` |
| `package`  | Yes      | Package ID (snake_case)                  | `forum_forge`      |
| `entity`   | Yes      | Entity name (PascalCase or snake_case)   | `Posts`, `posts`   |
| `id`       | No       | Record identifier                        | `123`, `abc-uuid`  |
| `action`   | No       | Custom action name                       | `publish`, `archive` |

### HTTP Methods

| Method   | Route                                 | Operation      |
|----------|---------------------------------------|----------------|
| `GET`    | `/{t}/{p}/{e}`                        | List all       |
| `GET`    | `/{t}/{p}/{e}/{id}`                   | Get one        |
| `POST`   | `/{t}/{p}/{e}`                        | Create         |
| `PUT`    | `/{t}/{p}/{e}/{id}`                   | Full update    |
| `PATCH`  | `/{t}/{p}/{e}/{id}`                   | Partial update |
| `DELETE` | `/{t}/{p}/{e}/{id}`                   | Delete         |
| `POST`   | `/{t}/{p}/{e}/{id}/{action}`          | Custom action  |

## Authentication & Authorization

### Request Flow

```
Request → Session Validation → Package Validation → Tenant Validation → DBAL Execute
```

1. **Session Validation**: Extract user from `mb_session` cookie
2. **Package Validation**: Check package exists and user meets `minLevel`
3. **Tenant Validation**: Verify user belongs to or can access the tenant
4. **DBAL Execution**: Execute operation with tenant isolation

### Access Rules

| User Level | Can Access                                    |
|------------|-----------------------------------------------|
| 1 (Public) | Public routes (minLevel: 1) only             |
| 2 (User)   | Own tenant, packages with minLevel ≤ 2       |
| 3 (Mod)    | Own tenant, packages with minLevel ≤ 3       |
| 4 (Admin)  | Own tenant, packages with minLevel ≤ 4       |
| 5+ (God)   | All tenants, all packages                    |

### Package Route Claiming

Packages claim routes through `metadata.json`:

```json
{
  "packageId": "forum_forge",
  "minLevel": 2,
  "schema": {
    "entities": ["ForumCategory", "ForumThread", "ForumPost"]
  }
}
```

This automatically generates CRUD routes for each entity:
- `GET /{tenant}/forum_forge/forumcategory` - List
- `POST /{tenant}/forum_forge/forumcategory` - Create
- `GET /{tenant}/forum_forge/forumcategory/{id}` - Read
- `PUT /{tenant}/forum_forge/forumcategory/{id}` - Update
- `DELETE /{tenant}/forum_forge/forumcategory/{id}` - Delete

### Custom Actions

Packages can define custom actions:

```json
{
  "routes": [
    { "path": "/posts/:id/publish", "method": "POST", "handler": "publish", "level": 3 }
  ]
}
```

Built-in actions available for all entities:
- `POST /{t}/{p}/{e}/count` - Count records
- `POST /{t}/{p}/{e}/{id}/exists` - Check existence  
- `GET /{t}/{p}/{e}/schema` - Get entity schema

## Entity Naming Conventions

### Prefixed Entity Names (Prisma/DBAL)

To avoid naming collisions between packages, entities are prefixed:

```
Pkg_{PascalPackage}_{EntityName}
```

**Examples:**
- `forum_forge` + `Posts` → `Pkg_ForumForge_Posts`
- `user_manager` + `Role` → `Pkg_UserManager_Role`
- `dashboard` + `Widget` → `Pkg_Dashboard_Widget`

### Table Names (Database)

Tables use snake_case with package prefix:

```
{package}_{lowercase_entity}
```

**Examples:**
- `forum_forge` + `Posts` → `forum_forge_posts`
- `user_manager` + `Role` → `user_manager_role`

## Implementation by Component

### C++ DBAL Daemon

Routes registered via Drogon framework:

```cpp
// In server_routes.cpp
app().registerHandler(
    "/{tenant}/{package}/{entity}",
    [](const HttpRequestPtr& req, ..., 
       const std::string& tenant, 
       const std::string& package, 
       const std::string& entity) {
        return handleRestfulRequest(req, tenant, package, entity, "", "");
    },
    {Get, Post}
);
```

**Files:**
- [dbal/production/src/daemon/rpc_restful_handler.hpp](../../dbal/production/src/daemon/rpc_restful_handler.hpp)
- [dbal/production/src/daemon/rpc_restful_handler.cpp](../../dbal/production/src/daemon/rpc_restful_handler.cpp)
- [dbal/production/src/daemon/server_routes.cpp](../../dbal/production/src/daemon/server_routes.cpp)

### C++ CLI

```bash
# List all posts for acme tenant
metabuilder dbal rest acme forum_forge posts

# Get specific post
metabuilder dbal rest acme forum_forge posts 123

# Create new post
metabuilder dbal rest acme forum_forge posts POST title="Hello" body="World"

# Update post
metabuilder dbal rest acme forum_forge posts 123 PUT title="Updated"

# Delete post
metabuilder dbal rest acme forum_forge posts 123 DELETE

# Custom action
metabuilder dbal rest acme forum_forge posts 123 publish
```

**File:** [frontends/cli/src/commands/dbal_commands.cpp](../../frontends/cli/src/commands/dbal_commands.cpp)

### Next.js API Routes

Catch-all route handles all RESTful requests:

```
/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
```

**Files:**
- [frontends/nextjs/src/app/api/v1/[...slug]/route.ts](../../frontends/nextjs/src/app/api/v1/[...slug]/route.ts)
- [frontends/nextjs/src/lib/routing/route-parser.ts](../../frontends/nextjs/src/lib/routing/route-parser.ts)
- [frontends/nextjs/src/lib/routing/rest-handler.ts](../../frontends/nextjs/src/lib/routing/rest-handler.ts)

### Next.js Pages

Dynamic page routes for UI:

```
/{tenant}/{package}                     → Package home
/{tenant}/{package}/{entity}            → Entity list
/{tenant}/{package}/{entity}/new        → Create form
/{tenant}/{package}/{entity}/{id}       → Detail view
/{tenant}/{package}/{entity}/{id}/edit  → Edit form
```

**Files:**
- [frontends/nextjs/src/app/[tenant]/[package]/page.tsx](../../frontends/nextjs/src/app/[tenant]/[package]/page.tsx)
- [frontends/nextjs/src/app/[tenant]/[package]/[...slug]/page.tsx](../../frontends/nextjs/src/app/[tenant]/[package]/[...slug]/page.tsx)
- [frontends/nextjs/src/middleware.ts](../../frontends/nextjs/src/middleware.ts)

## React Hooks

### useTenant

Access current tenant context in components:

```tsx
import { useTenant } from '@/app/[tenant]/[package]/tenant-context'

function MyComponent() {
  const { tenant, package: pkg, buildApiUrl } = useTenant()
  
  // buildApiUrl('posts') → '/api/v1/acme/forum_forge/posts'
  // buildApiUrl('posts', '123') → '/api/v1/acme/forum_forge/posts/123'
}
```

### useRestApi

Generic REST API hook:

```tsx
import { useRestApi } from '@/lib/hooks/use-rest-api'

function PostList() {
  const { data, loading, error, list } = useRestApi<Post>('acme', 'forum_forge', 'posts')
  
  useEffect(() => { list() }, [])
  
  if (loading) return <Loading />
  return <PostTable posts={data} />
}
```

### useEntity

Higher-level entity operations:

```tsx
import { useEntity } from '@/lib/hooks/use-rest-api'

function PostManager() {
  const posts = useEntity<Post>('posts') // Uses tenant from context
  
  const handleCreate = async (data: Partial<Post>) => {
    await posts.create(data)
    await posts.list() // Refresh
  }
}
```

## Middleware

Edge middleware extracts tenant/package from URL and adds headers:

```typescript
// Adds headers to all requests
// x-tenant-id: acme
// x-package-id: forum_forge
```

## Reserved Paths

These paths are not treated as tenant routes:

- `api/*` - API endpoints
- `_next/*` - Next.js internals  
- `auth/*` - Authentication flows
- `static/*` - Static assets
- `favicon.ico`, `robots.txt`, `sitemap.xml`

## Security Considerations

### Tenant Isolation

All queries MUST filter by `tenantId`:

```typescript
// ✅ Correct
const posts = await dbal.query('Pkg_ForumForge_Posts', {
  where: { tenantId: tenant.id }
})

// ❌ Wrong - leaks data across tenants
const posts = await dbal.query('Pkg_ForumForge_Posts', {})
```

### Authorization

Routes validate:
1. User is authenticated
2. User belongs to the tenant
3. User has permission for the operation
4. Package is enabled for the tenant

## Auth Module Files

The routing auth system is implemented in `frontends/nextjs/src/lib/routing/auth/`:

| File | Purpose |
|------|---------|
| `get-session-user.ts` | Extract user from `mb_session` cookie |
| `validate-tenant-access.ts` | Check user can access tenant |
| `validate-package-route.ts` | Check package exists and user meets minLevel |
| `execute-dbal-operation.ts` | Execute CRUD operations with tenant isolation |
| `index.ts` | Re-exports all auth functions |

### Usage in API Routes

```typescript
import {
  getSessionUser,
  validateTenantAccess,
  validatePackageRoute,
  executeDbalOperation,
} from '@/lib/routing'

// 1. Get session
const { user } = await getSessionUser()

// 2. Check package access
const pkgResult = validatePackageRoute('forum_forge', 'posts', user)
if (!pkgResult.allowed) return errorResponse(pkgResult.reason, 403)

// 3. Check tenant access
const tenantResult = await validateTenantAccess(user, 'acme', pkgResult.package.minLevel)
if (!tenantResult.allowed) return errorResponse(tenantResult.reason, 403)

// 4. Execute operation
const result = await executeDbalOperation(dbalOp, {
  user,
  tenant: tenantResult.tenant,
  body: requestBody,
})
```

## Examples

### Full Request Flow

```
GET /api/v1/acme/forum_forge/posts/123

1. Middleware extracts: tenant=acme, package=forum_forge
2. Route parser extracts: entity=posts, id=123
3. Session validated from mb_session cookie
4. Package minLevel checked (user.level >= package.minLevel)
5. Tenant access validated (user belongs to tenant OR is God+)
6. Entity prefixer builds: Pkg_ForumForge_Posts
7. DBAL executes: SELECT * FROM forum_forge_posts WHERE id=123 AND tenant_id=...
8. Response returned as JSON
```

### Creating a New Record

```bash
curl -X POST /api/v1/acme/forum_forge/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: mb_session=your-session-token" \
  -d '{"title": "Hello", "body": "World"}'
```

### Custom Actions

```bash
# Publish a draft post
curl -X POST /api/v1/acme/forum_forge/posts/123/publish \
  -H "Cookie: mb_session=your-session-token"

# Count records
curl -X POST /api/v1/acme/forum_forge/posts/count \
  -H "Cookie: mb_session=your-session-token" \
  -d '{"filter": {"status": "published"}}'
