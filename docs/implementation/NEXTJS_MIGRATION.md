# Next.js Migration Guide

## Overview
Complete migration from Vite SPA to Next.js 15 App Router while maintaining all existing functionality.

## Migration Strategy

### Phase 1: Setup ✅
- [x] Install Next.js 15.1.6 and React 19
- [x] Install Next.js dependencies (@next/third-parties, sharp)
- [ ] Create next.config.ts
- [ ] Create App Router structure
- [ ] Migrate environment variables

### Phase 2: Core Structure (In Progress)
- [ ] Convert App.tsx to root layout + page structure
- [ ] Setup authentication middleware
- [ ] Create nested layouts for each level
- [ ] Implement file-based routing
- [ ] Migrate DBAL integration to Next.js

### Phase 3: Component Migration
- [ ] Convert Level components to route pages
- [ ] Setup Server Components (public pages)
- [ ] Setup Client Components (interactive features)
- [ ] Migrate shadcn/ui components
- [ ] Update imports and paths

### Phase 4: Features
- [ ] Implement API routes for DBAL operations
- [ ] Setup server actions for auth
- [ ] Add SSR/SSG for public pages
- [ ] Implement middleware for auth protection
- [ ] Image optimization with next/image
- [ ] Font optimization

### Phase 5: Docker & Deployment
- [ ] Update Dockerfile for Next.js standalone
- [ ] Update docker-compose files
- [ ] Test production build
- [ ] Update CI/CD workflows

## File Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Level 1 (public home)
├── login/
│   └── page.tsx            # Login/Register page
├── (auth)/                 # Auth-protected routes
│   ├── layout.tsx          # Auth layout with user context
│   ├── dashboard/          # Level 2 - User area
│   │   └── page.tsx
│   ├── admin/              # Level 3 - Admin panel
│   │   └── page.tsx
│   ├── builder/            # Level 4 - God mode
│   │   └── page.tsx
│   └── supergod/           # Level 5 - Supergod mode
│       └── page.tsx
├── api/                    # API routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── logout/route.ts
│   └── dbal/
│       └── [...path]/route.ts  # DBAL proxy routes
└── _components/            # Shared components (not routes)
```

## Key Decisions

### Server vs Client Components
- **Server Components** (default):
  - Level 1 (public landing)
  - Static content
  - Layout shells
  
- **Client Components** ("use client"):
  - Level 2-5 (require interactivity)
  - Forms and inputs
  - State management
  - DBAL operations
  - Canvas/editor components

### Routing Strategy
- File-based routing with App Router
- Route groups `(auth)` for protected routes
- Middleware for authentication checks
- Dynamic routes for user-specific pages

### State Management
- Server state: Server components + server actions
- Client state: React Context + hooks (existing)
- Form state: React Hook Form (existing)
- Async state: TanStack Query (existing)

### DBAL Integration
- Keep existing TypeScript DBAL client
- API routes proxy to C++ daemon
- Client components use DBAL hooks
- Server components use direct Prisma

## Benefits of Next.js

1. **Performance**:
   - Server-side rendering for faster initial load
   - Automatic code splitting
   - Image optimization
   - Font optimization

2. **SEO**:
   - Server-rendered pages
   - Dynamic meta tags
   - Sitemap generation

3. **Developer Experience**:
   - File-based routing
   - Built-in API routes
   - TypeScript support
   - Fast Refresh

4. **Production**:
   - Optimized builds
   - Edge runtime support
   - Middleware for auth
   - Better error handling

## Compatibility

### Preserved Features
- ✅ All 5 levels functionality
- ✅ Authentication system
- ✅ DBAL integration
- ✅ Prisma database
- ✅ Shadcn/ui components
- ✅ Tailwind CSS
- ✅ Docker deployment
- ✅ Multi-tenant support
- ✅ All existing hooks and utilities

### New Capabilities
- ✅ SSR for public pages
- ✅ API routes
- ✅ Middleware auth
- ✅ Image optimization
- ✅ Incremental Static Regeneration (ISR)

## Testing Strategy

1. **Development**: Test each level after migration
2. **Build**: Ensure production build works
3. **E2E**: Run existing Playwright tests
4. **Docker**: Verify container deployment
5. **Performance**: Compare bundle sizes and load times

## Rollback Plan

Git tags mark each phase - can rollback to any phase if issues arise.

## Progress Tracking

- Phase 1: ✅ Complete
- Phase 2: 🔄 In Progress
- Phase 3: ⏳ Pending
- Phase 4: ⏳ Pending
- Phase 5: ⏳ Pending
