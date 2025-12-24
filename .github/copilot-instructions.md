# GitHub Copilot Instructions for MetaBuilder

## Project Context

MetaBuilder is a data-driven, multi-tenant application platform where 95% of functionality is defined through JSON and Lua, not TypeScript. This is a 5-level architecture system with advanced meta-programming capabilities.

## Key Architectural Principles

1. **Declarative First**: Prefer JSON configuration and Lua scripts over TypeScript code
2. **Modular Packages**: Components should be package-based with isolated seed data
3. **Minimal TSX**: Keep TypeScript files small (<150 LOC), use generic renderers
4. **Database-Driven**: All configuration, routes, workflows, and schemas in database
5. **Multi-Tenant**: Support isolated tenant instances with independent configurations

## Code Conventions

### TypeScript/React
- Keep all components under 150 lines of code
- Use functional components with hooks
- Prefer composition over large components
- Import from `@/` for absolute paths
- Use shadcn components from `@/components/ui`

### Styling
- Use Tailwind utility classes exclusively
- Follow the theme defined in `src/index.css`
- Font family: IBM Plex Sans (body), Space Grotesk (headings), JetBrains Mono (code)
- Colors: Purple/accent theme with oklch color space

### Database (Prisma)
- All schemas in `prisma/schema.prisma`
- Run `npm run db:generate` after schema changes
- Use Database helper class from `@/lib/database`
- Store credentials as SHA-512 hashes

### Lua Integration
- Use Fengari for Lua execution
- Lua scripts stored in database
- Provide sandboxed execution environment
- Common patterns in Lua snippet library

### Package System
- Structure: `/packages/{package-name}/seed/` for data
- Each package is self-contained with scripts, components, assets
- Use package import/export for distribution
- Modular seed data glued together at initialization

## Development Workflow

### Planning Phase
- Review existing PRD.md before making changes
- Check package structure in `/packages/` directory
- Verify database schema supports new features
- Consider multi-tenant implications

### Implementation Phase
- Start with database schema changes if needed
- Create or update seed data in package structure
- Build generic renderers, not hardcoded components
- Add Lua scripts for business logic
- Update UI components last

### Testing Phase
- Run `npm run lint` before committing
- Execute `npm run test:e2e` for end-to-end tests
- Test at multiple permission levels (user, admin, god, supergod)
- Verify package import/export works
- Check security sandbox effectiveness

### Documentation Phase
- Update PRD.md with feature changes
- Document new Lua APIs in appropriate files
- Add examples to code snippet library
- Update workflow documentation if needed

## Security Considerations

- **Never** store plaintext passwords
- **Always** use SHA-512 hashing for credentials
- **Sandbox** all Lua script execution
- **Scan** user-uploaded code for malicious patterns
- **Validate** all user inputs
- **Escape** HTML content to prevent XSS
- **Use** parameterized queries (Prisma handles this)

## Common Patterns

### Adding a New Feature
1. Define in database schema (Prisma)
2. Create seed data in package structure
3. Build generic component renderer if needed
4. Add Lua scripts for logic
5. Wire up in appropriate level UI
6. Add tests
7. Update documentation

### Creating a Package
1. Create `/packages/{name}/` directory
2. Add `/seed/` subdirectory for data
3. Define component configurations as JSON
4. Add Lua scripts in `/seed/scripts/`
5. Include assets in `/static_content/`
6. Export package as ZIP with metadata

### Implementing Declarative Component
1. Define JSON schema for component config
2. Create Lua scripts for behavior
3. Register in component catalog
4. Build generic renderer using RenderComponent
5. Add to PropertyInspector for editing
6. Test in canvas/builder

## AI-Assisted Development Tips

### When Reviewing Code
- Check for hardcoded values that should be in database
- Verify component size is under 150 LOC
- Ensure TypeScript is only used where necessary
- Look for opportunities to make code more generic

### When Writing Code
- Prefer database-driven configuration
- Use existing generic renderers when possible
- Follow established patterns in codebase
- Keep functions pure and testable

### When Fixing Bugs
- Check seed data first (common source of issues)
- Verify Prisma client is generated
- Ensure database is initialized
- Test with different permission levels

### When Suggesting Improvements
- Favor declarative approaches over imperative
- Suggest package structure for new features
- Recommend Lua for business logic when appropriate
- Consider multi-tenant implications

## Integration with Workflows

This file helps Copilot understand the project during:
- **Code Review** (`code-review.yml`): Apply these principles when reviewing PRs
- **Issue Triage** (`issue-triage.yml`): Suggest fixes following these patterns
- **Auto-Fix** (`issue-triage.yml`): Generate fixes that align with architecture
- **PR Management** (`pr-management.yml`): Validate changes follow conventions

## Questions to Ask

When uncertain, Copilot should consider:
1. Can this be declarative instead of imperative?
2. Should this be in the database or in code?
3. Is this feature package-worthy?
4. Does this work across all permission levels?
5. Is the component under 150 LOC?
6. Could Lua handle this logic instead?
7. Does this maintain multi-tenant isolation?

## Useful Commands

```bash
# Database operations
npm run db:generate
npm run db:push
npm run db:studio

# Testing
npm run lint
npm run lint:fix
npm run test:e2e
npm run test:e2e:ui

# Development
npm run dev
npm run build

# Package operations (in app)
# Use PackageManager component to import/export packages
```

## Resources

- PRD: `/PRD.md`
- Database schema: `/prisma/schema.prisma`
- Packages: `/packages/` directory
- Seed data: `/src/seed-data/` and package seed directories
- Documentation: `/docs/` directory
- Components: `/src/components/` directory
- Workflows: `/.github/workflows/` directory
