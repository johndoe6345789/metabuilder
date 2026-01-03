# Database Query Pattern

Always use the `Database` class wrapper, never raw Prisma:

Run app commands from `frontends/nextjs/`.

```typescript
// ✅ Correct - with tenant isolation
const users = await Database.getUsers({ tenantId: user.tenantId })
await Database.setSchemas(schemas, { tenantId })

// ❌ Wrong - raw Prisma, no tenant filter
const users = await prisma.user.findMany()
```

After schema changes in `prisma/schema.prisma`:
```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push to database
```

Key file: `frontends/nextjs/src/lib/database.ts`
