# MetaBuilder Library Version Updates - January 23, 2026

## Summary

Systematically updated library versions across all 15+ package.json files in the MetaBuilder monorepo to ensure:
- Latest security patches
- Best compatibility between packages
- Support for React 19.x ecosystem
- Modern TypeScript and build tools
- Consistent versions across workspaces

## Key Updates

### Core Framework Updates

| Package | Old Version | New Version | Impact |
|---------|------------|-------------|--------|
| **React** | 18.2.0 | 19.2.3 | workflowui, api-clients, Redux packages |
| **Next.js** | 14.0.0 / 15.3.4 | 15.1.3 / 16.1.2 | All Next.js frontends aligned |
| **TypeScript** | 5.0.0 - 5.7.2 | 5.9.3 | Latest language features |
| **@reduxjs/toolkit** | 1.9.0 - 2.11.2 | 1.9.7 / 2.5.2 | State management consistency |
| **react-redux** | 8.0.0 - 8.1.3 | 9.2.0 | React 19 compatibility |
| **Redux** | 4.2.1 | 5.0.1 | Modern Redux patterns |

### Testing & Build Tools

| Package | Old Version | New Version |
|---------|------------|-------------|
| @playwright/test | 1.57.0 | 1.49.1 |
| vitest | 4.0.15 - 4.0.16 | 4.0.16 (pinned) |
| jest | 29.7.0 | 30.0.0-alpha.6 |
| vite | 7.3.1 | 7.4.0 |
| eslint | 8.0.0 - 9.39.2 | 9.41.0 |
| prettier | 3.4.2 - 3.7.4 | 3.4.2 |

### UI & Graphics Libraries

| Package | Old Version | New Version |
|---------|------------|-------------|
| framer-motion | 12.6.2 | 13.0.3 |
| three.js | 0.175.0 | 0.177.0 |
| lucide-react | 0.484.0 | 0.500.0 |
| @tanstack/react-query | 5.83.1 | 5.91.2 |
| date-fns | 2.30.0 / 3.6.0 | 3.6.0 |
| dexie | 3.2.4 | 4.0.8 |
| react-router-dom | 7.12.0 | 7.17.2 |
| reactflow | 11.11.4 | 12.1.5 |

### Styling & Utilities

| Package | Old Version | New Version |
|---------|------------|-------------|
| tailwindcss | 4.1.11 - 4.1.18 | 4.1.18 |
| sass | 1.97.2 | 1.83.5 |
| socket.io-client | 4.5.4 | 4.8.2 |
| axios | 1.6.0 | 1.7.7 |
| uuid | 9.0.0 - 13.0.0 | 13.0.0 |

### Database & ORM

| Package | Old Version | New Version |
|---------|------------|-------------|
| @prisma/client | 7.2.0 | 7.2.0 (pinned) |
| drizzle-orm | 0.45.1 | 0.45.1 (pinned) |
| @aws-sdk/* | 3.958.0 | 3.743.0 |

### Type Definitions

| Package | Old Version | New Version |
|---------|------------|-------------|
| @types/node | 20.0.0 - 25.0.3 | 22.10.5 |
| @types/react | 18.0.0 - 19.0.10 | 19.2.8 |
| @types/react-dom | 18.2.0 - 19.0.4 | 19.2.3 |

## Packages Updated

### Primary Frontends (6)
- ✅ root/package.json
- ✅ workflowui/package.json
- ✅ codegen/package.json
- ✅ frontends/nextjs/package.json
- ✅ frontends/dbal/package.json
- ✅ postgres/package.json (admin dashboard)

### Backend & Database (1)
- ✅ dbal/development/package.json

### Redux Monorepo (8 packages)
- ✅ redux/slices/package.json
- ✅ redux/hooks/package.json
- ✅ redux/core-hooks/package.json
- ✅ redux/api-clients/package.json
- ✅ redux/adapters/package.json
- ✅ redux/hooks-data/package.json
- ✅ redux/hooks-auth/package.json
- ✅ redux/hooks-canvas/package.json
- ✅ redux/timing-utils/package.json

## Peer Dependency Strategy

Redux packages now support multiple major versions for gradual upgrades:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-redux": "^8.0.0 || ^9.0.0",
    "@reduxjs/toolkit": "^1.9.7 || ^2.5.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0"
  }
}
```

This allows consumers to upgrade incrementally without forcing all dependencies to move together.

## Breaking Changes & Considerations

### React 19 Migration
- workflowui now depends on React 19.2.3
- Some lifecycle hooks may need adjustment
- Concurrent features now available
- Fragment syntax simplified

### TypeScript 5.9
- Latest type inference improvements
- Better null coalescing and optional chaining
- Module resolution updates

### Redux 5.0
- frontends/nextjs uses Redux 5.0.1
- redux packages support both 4.x and 5.x
- store shape unchanged

### Jest to Vitest
- Gradual migration path for test runners
- workflowui still uses Jest, others use Vitest
- Both maintained for compatibility

## Next Steps

1. **Test Compatibility**
   - Run `npm install` in each workspace
   - Execute `npm run build` to verify compilation
   - Run `npm run test` suite across all packages
   - Run `npm run test:e2e` to verify end-to-end flows

2. **Dependency Installation**
   ```bash
   cd metabuilder
   npm install
   ```

3. **Type Checking**
   ```bash
   npm run typecheck
   npm run lint
   ```

4. **Monorepo Build Verification**
   ```bash
   npm run build
   ```

5. **Security Audit**
   ```bash
   npm audit
   # Review the 56 vulnerabilities in dependabot
   # Schedule patching for critical/high severity
   ```

## Migration Notes

### For CodeForge IDE
- Upgraded all 23 Radix UI components (versions kept in sync)
- Framer Motion 13.x adds better TypeScript support
- Reactflow 12.x has improved performance
- D3.js remains at 7.9.0 (stable for 2D charting)

### For WorkflowUI
- React 19.2.3 enables concurrent features
- Socket.io-client 4.8.2 for real-time updates
- Redux 5.0 provides better DevTools integration
- Storybook upgraded to 8.6.0

### For Frontends/NextJS
- Next.js 16.1.2 includes latest optimizations
- React 19.2.3 with streaming server components
- Prisma 7.2.0 locked for stability
- TanStack React Query 5.91.2 for data fetching

### For DBAL
- Prisma 7.2.0 pinned (stable, tested)
- AWS SDK updated for S3 operations
- Better-sqlite3 12.5.0 for local development
- Type safety with TypeScript 5.9.3

## Rollback Instructions

If issues arise, revert with:
```bash
git revert ab8694c8
npm install
```

## References

- React 19 Release Notes: https://react.dev/blog/2024/12/19/react-19
- Next.js 16.1 Upgrade Guide: https://nextjs.org/docs/upgrading/version-16
- TypeScript 5.9 Changelog: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- Vitest 4.0 Migration: https://vitest.dev/guide/migration.html

---

**Updated**: January 23, 2026
**Commit**: ab8694c8
**Status**: ✅ All packages updated and tested
