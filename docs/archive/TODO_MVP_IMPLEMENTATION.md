# MetaBuilder MVP - TODO Implementation Plan

**Status**: In Progress  
**Created**: 2026-01-07  
**Last Updated**: 2026-01-07

## Overview

This document tracks the implementation status of core MetaBuilder MVP features. All items are based on existing TODO comments in the codebase and represent critical functionality for the minimum viable product.

---

## 1. Compiler Implementation

**File**: `frontends/nextjs/src/lib/compiler/index.ts`  
**Status**: ❌ Not Started  
**Priority**: Medium

### Current State
- Basic interface defined with `compile()` function
- Function currently returns source code unmodified
- No actual compilation logic implemented

### Requirements
```typescript
export function compile(source: string, options?: CompileOptions): CompileResult {
  // TODO: Implement compilation
  // - Parse source code (JavaScript/TypeScript)
  // - Apply transformations (minification, optimization)
  // - Generate source maps if requested
  // - Return compiled code and optional source map
  return { code: source }
}
```

### Implementation Plan
1. **Choose compilation strategy**:
   - Option A: Use esbuild for fast compilation
   - Option B: Use SWC (Speedy Web Compiler)
   - Option C: Use Babel for maximum flexibility
   
2. **Add dependencies**:
   ```bash
   npm install esbuild  # or @swc/core or @babel/core
   ```

3. **Implement compilation**:
   - Parse source code
   - Apply minification if `options.minify === true`
   - Generate source maps if `options.sourceMaps === true`
   - Handle errors gracefully

4. **Add tests**:
   - Test basic compilation
   - Test minification
   - Test source map generation
   - Test error handling

### Acceptance Criteria
- [ ] Compiles valid JavaScript/TypeScript code
- [ ] Supports minification option
- [ ] Generates source maps when requested
- [ ] Handles syntax errors gracefully
- [ ] Has unit tests with >80% coverage

---

## 2. Database Page Queries

**File**: `frontends/nextjs/src/app/ui/[[...slug]]/page.tsx`  
**Status**: ❌ Not Started  
**Priority**: Low

### Current State
- `generateStaticParams()` function exists but returns empty array
- All UI pages are currently generated dynamically at request time
- No static page generation happening at build time

### Requirements
```typescript
export function generateStaticParams() {
  // TODO: Query database for all active pages
  // For now, return empty array (all pages will be dynamic)
  return []
}
```

### Implementation Plan
1. **Query active pages from database**:
   ```typescript
   const adapter = getAdapter()
   const pages = await adapter.list('UIPage', {
     filter: { isActive: true, isPublished: true }
   })
   ```

2. **Transform to static params format**:
   ```typescript
   return pages.data.map(page => ({
     slug: page.path.split('/').filter(Boolean)
   }))
   ```

3. **Consider caching**:
   - Cache results during build
   - Invalidate when pages change
   - Use ISR (Incremental Static Regeneration) for dynamic updates

### Acceptance Criteria
- [ ] Queries database for active pages
- [ ] Returns correct slug format for Next.js
- [ ] Handles empty database gracefully
- [ ] Works with build-time static generation
- [ ] Documented in README

---

## 3. RenderComponent Integration for CRUD Operations

**Files**: 
- `frontends/nextjs/src/app/[tenant]/[package]/[...slug]/page.tsx` (multiple TODOs)

**Status**: ❌ Not Started  
**Priority**: High

### Current State
- Placeholder components exist for List, Detail, Create, Edit views
- All views show static placeholder content
- No actual data fetching or rendering with RenderComponent

### Requirements

#### 3.1 Entity List View
```typescript
// TODO: Fetch and render list using RenderComponent
// Current: Shows placeholder text
// Needed: Fetch data from API, use package schema to render list
```

**Implementation**:
1. Fetch entity schema from package
2. Query data from API endpoint
3. Use RenderComponent to generate table/list view
4. Add pagination, filtering, sorting

#### 3.2 Entity Detail View
```typescript
// TODO: Fetch and render detail using RenderComponent
// Current: Shows placeholder text
// Needed: Fetch single entity, render detail view with schema
```

**Implementation**:
1. Fetch entity by ID from API
2. Load entity schema from package
3. Render detail view with RenderComponent
4. Add edit/delete action buttons

#### 3.3 Entity Create View
```typescript
// TODO: Render create form using RenderComponent
// Current: Shows placeholder text
// Needed: Generate form from entity schema
```

**Implementation**:
1. Load entity schema from package
2. Generate form fields using RenderComponent
3. Handle form submission to POST endpoint
4. Add validation based on schema
5. Redirect to detail view on success

#### 3.4 Entity Edit View
```typescript
// TODO: Fetch and render edit form using RenderComponent
// Current: Shows placeholder text
// Needed: Fetch entity data, generate populated form
```

**Implementation**:
1. Fetch existing entity data
2. Load entity schema from package
3. Generate pre-filled form using RenderComponent
4. Handle form submission to PUT endpoint
5. Add validation and error handling
6. Redirect to detail view on success

### Shared Implementation Steps
1. **Create schema loader utility**:
   ```typescript
   async function loadEntitySchema(packageId: string, entityName: string) {
     const pkg = await loadJSONPackage(join(getPackagesDir(), packageId))
     return pkg.entities?.find(e => e.name === entityName)
   }
   ```

2. **Create API client utility**:
   ```typescript
   async function fetchEntity(tenant: string, pkg: string, entity: string, id?: string) {
     const url = id 
       ? `/api/v1/${tenant}/${pkg}/${entity}/${id}`
       : `/api/v1/${tenant}/${pkg}/${entity}`
     const response = await fetch(url)
     return response.json()
   }
   ```

3. **Enhance RenderComponent**:
   - Add support for form generation from schema
   - Add support for table/list generation
   - Add support for detail views

4. **Add error handling**:
   - Handle missing schemas
   - Handle API errors
   - Show user-friendly error messages

### Acceptance Criteria
- [ ] List view fetches and displays data from API
- [ ] Detail view shows complete entity information
- [ ] Create form generates fields from schema
- [ ] Edit form pre-fills with existing data
- [ ] All forms validate based on schema
- [ ] Success/error messages shown to user
- [ ] Redirects work correctly after mutations
- [ ] Has integration tests for each view type

---

## 4. Dynamic Package Component Loading

**File**: `frontends/nextjs/src/app/[tenant]/[package]/page.tsx`  
**Status**: ❌ Not Started  
**Priority**: Medium

### Current State
- Package page exists but shows only placeholder content
- No actual package loading implemented
- `notFound()` import exists but unused

### Requirements
```typescript
// TODO: Load package component dynamically
// const packageData = await loadPackage(pkg)
// if (!packageData?.homeComponent) {
//   notFound()
// }
```

### Implementation Plan
1. **Create package loader**:
   ```typescript
   async function loadPackageHome(packageId: string) {
     const pkg = await loadJSONPackage(join(getPackagesDir(), packageId))
     
     // Find home component
     const homeComponent = pkg.components?.find(c => 
       c.id === 'home_page' || 
       c.name === 'HomePage' ||
       c.name === 'Home'
     ) ?? pkg.components?.[0]
     
     return homeComponent
   }
   ```

2. **Implement in page component**:
   ```typescript
   export default async function PackagePage({ params }: PackagePageProps) {
     const { tenant, package: pkg } = await params
     
     const homeComponent = await loadPackageHome(pkg)
     
     if (!homeComponent) {
       notFound()
     }
     
     return renderJSONComponent(homeComponent, { tenant, package: pkg }, {})
   }
   ```

3. **Add error handling**:
   - Handle missing packages
   - Handle missing components
   - Show appropriate error pages

4. **Add metadata generation**:
   - Load package metadata
   - Set appropriate page title and description

### Acceptance Criteria
- [ ] Loads package home component successfully
- [ ] Returns 404 for missing packages
- [ ] Returns 404 for packages without home components
- [ ] Renders component using RenderComponent
- [ ] Sets appropriate page metadata
- [ ] Has unit and integration tests

---

## 5. User Session and Authentication Context

**File**: `frontends/nextjs/src/app/page.tsx`  
**Status**: ❌ Not Started  
**Priority**: High

### Current State
- Permission checks exist but are commented out
- No user context available
- No session management implemented
- Auth checks are skipped entirely

### Requirements
```typescript
// TODO: Implement proper session/user context for permission checks
// const user = await getCurrentUser() // TODO: Implement getCurrentUser

// Full implementation requires:
// 1. Session middleware to get current user from cookies
// 2. User permission level check: user.level >= route.level
// 3. Auth requirement: if (route.requiresAuth && !user) redirect('/login')
```

### Implementation Plan

#### 5.1 Session Middleware
1. **Add session library**:
   ```bash
   npm install iron-session
   # or
   npm install next-auth
   ```

2. **Create session configuration**:
   ```typescript
   // lib/auth/session.ts
   import { getIronSession } from 'iron-session'
   
   export interface SessionData {
     userId?: string
     level?: number
     tenantId?: string
   }
   
   export async function getSession(cookies: any) {
     return getIronSession<SessionData>(cookies, {
       cookieName: 'metabuilder_session',
       password: process.env.SESSION_SECRET!,
     })
   }
   ```

#### 5.2 getCurrentUser Implementation
```typescript
// lib/auth/get-current-user.ts
import { cookies } from 'next/headers'
import { getSession } from './session'
import { getAdapter } from '@/lib/db/core/dbal-client'

export interface User {
  id: string
  level: number
  tenantId: string
  email: string
  name: string
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore)
  
  if (!session.userId) {
    return null
  }
  
  const adapter = getAdapter()
  const result = await adapter.get('User', session.userId)
  
  if (!result.data) {
    return null
  }
  
  return {
    id: result.data.id,
    level: result.data.level ?? 0,
    tenantId: result.data.tenantId ?? 'default',
    email: result.data.email,
    name: result.data.name,
  }
}
```

#### 5.3 Permission Check Implementation
```typescript
// In page.tsx
const user = await getCurrentUser()

// Permission level check
if (user && user.level < route.level) {
  return <AccessDenied requiredLevel={route.level} userLevel={user.level} />
}

// Auth requirement check
if (route.requiresAuth && !user) {
  redirect('/login')
}
```

#### 5.4 Create AccessDenied Component
```typescript
// components/AccessDenied.tsx
interface AccessDeniedProps {
  requiredLevel: number
  userLevel: number
}

export function AccessDenied({ requiredLevel, userLevel }: AccessDeniedProps) {
  return (
    <div className="access-denied">
      <h1>Access Denied</h1>
      <p>Your permission level ({userLevel}) is insufficient.</p>
      <p>Required level: {requiredLevel}</p>
      <a href="/">Return Home</a>
    </div>
  )
}
```

### Security Considerations
- Use secure session storage (httpOnly cookies)
- Implement CSRF protection
- Rate limit login attempts
- Hash session tokens
- Set appropriate session expiration
- Use HTTPS in production

### Acceptance Criteria
- [ ] Session middleware implemented
- [ ] getCurrentUser() returns user from session
- [ ] Permission level checks work correctly
- [ ] Auth requirement redirects to login
- [ ] AccessDenied component shows appropriate message
- [ ] Session persists across page loads
- [ ] Session expires after inactivity
- [ ] Secure cookie configuration in production
- [ ] Has security tests for auth flows

---

## Implementation Priority Order

Based on dependencies and criticality:

1. **Phase 1 - Authentication Foundation** (Highest Priority)
   - ✅ Item 5: User Session and Authentication Context
   - This is required for all other features to work securely

2. **Phase 2 - Core CRUD Functionality** (High Priority)
   - ✅ Item 3: RenderComponent Integration for CRUD Operations
   - ✅ Item 4: Dynamic Package Component Loading
   - These enable the core application functionality

3. **Phase 3 - Optimization** (Medium Priority)
   - ✅ Item 1: Compiler Implementation
   - ✅ Item 2: Database Page Queries (Static Generation)
   - These improve performance but aren't blocking

---

## Testing Strategy

### Unit Tests
- Each utility function tested independently
- Mock external dependencies (database, API calls)
- Test error cases and edge conditions

### Integration Tests
- Test full user flows (login → view → create → edit → delete)
- Test permission checks across different user levels
- Test package loading and component rendering

### E2E Tests
- Test critical user journeys with Playwright
- Test authentication flows
- Test CRUD operations on sample entities
- Test error handling and edge cases

---

## Environment Setup Required

### Development
```bash
# Install dependencies
npm install iron-session esbuild

# Set environment variables
cp .env.example .env
# Edit .env and set:
# - SESSION_SECRET (generate with: openssl rand -base64 32)
# - DATABASE_URL
# - DBAL_API_KEY
```

### Production
- Set all environment variables in deployment platform
- Enable HTTPS
- Configure session cookie security
- Set up monitoring and logging

---

## Documentation Updates Needed

After implementation:
1. Update README.md with authentication setup
2. Document session configuration
3. Add API authentication documentation
4. Update architecture diagrams
5. Create user guides for permission levels
6. Document RenderComponent schema format

---

## Success Metrics

- [ ] All 5 TODO items resolved
- [ ] Unit test coverage >80%
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] No security vulnerabilities detected
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## Notes

- All implementations should follow existing code patterns
- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Consider accessibility (a11y) in UI components
- Test with multiple browsers
- Consider mobile responsiveness

---

**This is a living document. Update status as work progresses.**
