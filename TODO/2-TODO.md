# TODO 2 - Architecture and refactoring

- [ ] Audit the codebase for components over 150 LOC and split into smaller, declarative, generic renderers.
- [ ] Identify hardcoded configuration in TypeScript/TSX and move it to JSON/Lua and database-driven configuration.
- [ ] Review schema and data access paths to ensure `tenantId` is present and filters are consistently applied.
- [ ] Verify packages follow the standard structure (`seed/metadata.json`, `components.json`, `scripts/`, `index.ts`, `static_content/`) and add missing files.
- [ ] Use Prisma for standard CRUD and DBAL for server-only complex operations; confirm DBAL usage matches docs.
- [ ] Follow the refactoring phases (analysis, planning, implementation, testing, documentation) for any large changes.
