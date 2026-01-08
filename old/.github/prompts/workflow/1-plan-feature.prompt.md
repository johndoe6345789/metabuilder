# Plan Feature Implementation

Before implementing, analyze the feature requirements:

1. **Check existing docs**: `docs/architecture/` for design patterns
2. **Identify affected areas**:
   - Database schema changes? → `prisma/schema.prisma`
   - New API/DBAL operations? → `dbal/shared/api/schema/`
   - UI components? → Use declarative `RenderComponent`
   - Business logic? → Consider Lua script in `packages/*/seed/scripts/`

3. **Multi-tenant impact**: Does this need `tenantId` filtering?

4. **Permission level**: Which of the 5 levels can access this?
   - Level 1: Public
   - Level 2: User
   - Level 3: Admin
   - Level 4: God
   - Level 5: Supergod

5. **Create implementation checklist** with specific files to modify.
