# Document Feature

Add documentation for a new feature:

## Code Documentation
```typescript
/**
 * Fetches users filtered by tenant
 * @param tenantId - The tenant to filter by (required for isolation)
 * @returns Array of User objects
 * @example
 * const users = await Database.getUsers({ tenantId: 'tenant_123' })
 */
```

## Architecture Docs
Location: `docs/architecture/`
- Explain the "why" not just "what"
- Include diagrams for data flow
- Document permission requirements

## Package Docs
Each package needs:
- `seed/metadata.json` - version, dependencies
- `tests/README.md` - testing instructions
- `static_content/examples.json` - usage examples

## Update Index
Add to `docs/INDEX.md` or `docs/NAVIGATION.md`

## JSDoc Coverage Check (optional)
Run from `frontends/nextjs/` (requires `tsx` via `npx`).
```bash
npx tsx ../../tools/check-jsdoc-coverage.ts
```
