# Add Database Migration

Add or modify database schema:

Run app commands from `frontends/nextjs/` unless a step says otherwise.

## 1. Update Schema
Edit `prisma/schema.prisma`:
```prisma
model NewEntity {
  id        String  @id @default(cuid())
  name      String
  tenantId  String  // Required for multi-tenancy
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  createdAt BigInt
}
```

## 2. Generate & Apply
```bash
npm run db:generate      # Update Prisma client
npm run db:push          # Push to dev database
# OR for production:
npx prisma migrate dev --name describe_change
npm run db:migrate       # Apply in production
```

## 3. Add Database Wrapper Methods
In `src/lib/database.ts`:
```typescript
static async getNewEntities(filter: { tenantId: string }) {
  return prisma.newEntity.findMany({
    where: { tenantId: filter.tenantId }
  })
}
```

## 4. Update DBAL (if applicable)
Add entity to `dbal/shared/api/schema/entities/`
