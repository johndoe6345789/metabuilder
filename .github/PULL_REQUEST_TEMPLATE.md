## Description

<!-- Provide a clear and concise description of your changes -->

## Related Issue

<!-- Link to the issue this PR addresses -->
Fixes #<!-- issue number -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test additions or updates
- [ ] 🔧 Configuration/tooling change
- [ ] 📦 Package system change
- [ ] 🔒 Security fix

## Component/Area Affected

<!-- Mark all that apply with an "x" -->

- [ ] Frontend (Next.js UI)
- [ ] Backend (API/Auth)
- [ ] Database (Prisma/Schema)
- [ ] DBAL (TypeScript/C++)
- [ ] Package System
- [ ] Lua Scripting
- [ ] Multi-Tenant System
- [ ] Permission System (Levels 1-6)
- [ ] Workflows
- [ ] Documentation
- [ ] Testing
- [ ] CI/CD
- [ ] Other: <!-- specify -->

## Changes Made

<!-- Provide a detailed list of changes -->

### Code Changes
- 
- 

### Database Changes
- [ ] Schema changes (Prisma migrations)
- [ ] Seed data updates
- [ ] DBAL contract changes (YAML)

### Configuration Changes
- [ ] Environment variables
- [ ] Build configuration
- [ ] Package dependencies

## Testing

<!-- Describe the tests you ran and their results -->

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] No tests needed (documentation, config, etc.)

### Test Commands Run
```bash
# Example:
# npm run lint
# npm run typecheck
# npm run test:unit -- --run
# npm run test:e2e
```

### Manual Testing
<!-- Describe manual testing performed -->
- [ ] Tested locally
- [ ] Tested in development environment
- [ ] Tested with different user permission levels
- [ ] Tested multi-tenant scenarios

## Screenshots/Recordings

<!-- If applicable, add screenshots or recordings to demonstrate UI changes -->

### Before
<!-- Screenshot or description of before state -->

### After
<!-- Screenshot or description of after state -->

## Architecture & Design Decisions

<!-- Document any architectural or design decisions made -->

### Data-Driven Approach
- [ ] Changes follow MetaBuilder's data-driven (JSON/Lua) architecture
- [ ] Declarative components used instead of hardcoded JSX where applicable
- [ ] DBAL used for database operations (not raw Prisma)

### Multi-Tenancy
- [ ] All queries include `tenantId` filtering
- [ ] Tenant isolation verified
- [ ] N/A - No database queries

### Permission System
- [ ] Permission checks implemented at correct levels
- [ ] AuthGate or canAccessLevel used where needed
- [ ] N/A - No permission-sensitive features

### Package System
- [ ] Package metadata follows correct structure (metadata.json, components.json)
- [ ] Package uses snake_case naming and semver versioning
- [ ] Dependencies declared in package metadata
- [ ] N/A - No package changes

### Security
- [ ] Input validation implemented
- [ ] No XSS vulnerabilities introduced
- [ ] No SQL injection vulnerabilities
- [ ] Passwords hashed with SHA-512 (if applicable)
- [ ] Lua sandbox restrictions maintained (if applicable)
- [ ] No secrets committed to code

## Breaking Changes

<!-- If this PR introduces breaking changes, describe them and migration steps -->

**Breaking Changes:** Yes / No

<!-- If yes, describe:
- What breaks
- Why the change was necessary
- How to migrate existing code/data
- Impact on different user levels
-->

## Migration Steps

<!-- If database migrations or data migrations are needed -->

```bash
# Commands needed to migrate:
# npm run db:generate
# npm run db:migrate
```

## Documentation

<!-- Mark all that apply -->

- [ ] README.md updated
- [ ] API documentation updated
- [ ] Architecture docs updated (docs/architecture/)
- [ ] Code comments added/updated
- [ ] Migration guide created (if breaking change)
- [ ] No documentation needed

## Pre-Submission Checklist

<!-- Verify all items before submitting -->

### Code Quality
- [ ] Code follows project conventions (one lambda per file, MUI not Radix/Tailwind)
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] No console errors or warnings
- [ ] Code is DRY (Don't Repeat Yourself)

### Testing & Verification
- [ ] All tests pass (`npm run test:unit -- --run`)
- [ ] Test coverage for new code meets standards
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed
- [ ] Tested across different browsers (if UI change)

### Database & Schema
- [ ] Prisma schema validated (`npx prisma validate`)
- [ ] Database migrations tested
- [ ] DBAL conformance tests pass (if DBAL changes)
- [ ] N/A - No database changes

### Security
- [ ] Security vulnerabilities checked
- [ ] No sensitive data in commits
- [ ] Input validation implemented
- [ ] CSRF/XSS protections in place (if applicable)

### MetaBuilder-Specific
- [ ] Changes align with data-driven architecture principles
- [ ] Multi-tenant safety verified (tenantId filtering)
- [ ] Permission checks implemented correctly
- [ ] DBAL used instead of raw Prisma (where applicable)
- [ ] Generic components used where possible (RenderComponent)

### Review
- [ ] Self-reviewed code changes
- [ ] Added TODO comments for deferred work (if any)
- [ ] Commit messages are clear and descriptive
- [ ] PR title is descriptive
- [ ] No unrelated changes included

## Additional Notes

<!-- Any additional information, context, or concerns -->

## Deployment Considerations

<!-- Notes for deployment -->

- [ ] No special deployment steps needed
- [ ] Requires environment variable changes
- [ ] Requires database migration
- [ ] Requires cache invalidation
- [ ] Requires server restart
- [ ] Other: <!-- specify -->

## Reviewer Notes

<!-- Specific areas where you'd like reviewer focus -->

**Focus Areas:**
- 
- 

**Questions for Reviewers:**
- 
- 

---

<!-- 
By submitting this PR, I confirm that:
- My contribution follows the project's code of conduct
- I have the right to submit this code
- I understand this will be released under the project's license
-->
