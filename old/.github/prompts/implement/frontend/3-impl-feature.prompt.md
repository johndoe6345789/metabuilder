# Implement Feature

Implement following MetaBuilder conventions:

Run app commands from `frontends/nextjs/` unless a step says otherwise.

## Implementation Order
1. **Schema first**: Update `prisma/schema.prisma` if needed
   ```bash
   npm run db:generate && npm run db:push
   ```

2. **DBAL contracts**: If new entity/operation, update YAML in `dbal/shared/api/schema/`

3. **Database layer**: Add methods to `Database` class in `src/lib/database.ts`

4. **Business logic**: 
   - Simple validation → Lua script
   - Complex logic → TypeScript in `src/lib/`

5. **UI components**:
   - Declarative → `packages/*/seed/components.json`
   - React → `src/components/` (< 150 LOC)

6. **Tests**: Parameterized tests next to source files

## Checklist
- [ ] tenantId filtering on all queries
- [ ] Permission level check
- [ ] Component under 150 LOC
- [ ] No hardcoded values (use DB/config)
- [ ] Tests with `it.each()` pattern
