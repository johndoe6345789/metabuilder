# Code Review Checklist

Review code against MetaBuilder standards:

Run checks from `frontends/nextjs/`.

## Architecture
- [ ] No raw Prisma calls - uses `Database` class
- [ ] tenantId filter on all data queries
- [ ] Permission level enforced appropriately
- [ ] DBAL changes follow YAML-first pattern

## Components
- [ ] Under 150 LOC (exception: recursive renderers)
- [ ] Uses declarative pattern where possible
- [ ] No hardcoded values that belong in DB
- [ ] Uses `@/` absolute imports
- [ ] Uses Material UI (`@mui/*`) and `sx`/SCSS modules (no Radix UI / Tailwind)

## Testing
- [ ] Parameterized tests with `it.each()`
- [ ] Test file next to source (`*.test.ts`)
- [ ] Edge cases covered

## Security
- [ ] No credentials in code
- [ ] Input validation present
- [ ] Lua scripts use sandbox (no os/io/require)

## Run Checks
```bash
npm run lint:fix
npm run test:unit
npm run act
```
