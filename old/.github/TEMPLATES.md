# Issue and Pull Request Templates

This document describes the issue and PR templates available for MetaBuilder and how to use them effectively.

## Overview

MetaBuilder uses structured templates to ensure consistent, high-quality issues and pull requests. These templates are specifically designed for MetaBuilder's data-driven, multi-tenant architecture.

## Issue Templates

### Available Templates

#### 🐛 Bug Report (`bug_report.yml`)
Use this template to report bugs or unexpected behavior.

**Key Features:**
- Environment details capture (OS, Node version, browser, database)
- Severity levels (Critical, High, Medium, Low)
- Component categorization
- Reproducible steps
- Pre-submission checklist

**Best For:**
- Application crashes or errors
- Features not working as expected
- Performance issues
- UI/UX bugs

#### ✨ Feature Request (`feature_request.yml`)
Request new features or enhancements aligned with MetaBuilder's architecture.

**Key Features:**
- Problem statement and solution proposal
- Target user permission levels (Level 1-6)
- Priority assessment
- Use case descriptions
- Technical considerations
- Contribution willingness

**Best For:**
- New feature ideas
- Improvements to existing features
- API enhancements
- User experience improvements

#### 📚 Documentation (`documentation.yml`)
Report documentation issues or request improvements.

**Key Features:**
- Documentation type categorization
- Location/path specification
- Suggested improvements
- Documentation area targeting

**Best For:**
- Missing documentation
- Outdated information
- Unclear explanations
- Broken links or typos
- Missing code examples

#### 📦 Package Request (`package_request.yml`)
Request new packages for MetaBuilder's package system.

**Key Features:**
- Package naming (snake_case convention)
- Package type selection
- Minimum permission level
- Component and Lua script planning
- Database schema requirements
- Multi-tenant consideration

**Best For:**
- New package ideas
- Package integrations
- Package improvements
- Community packages

**Special Considerations:**
- Package names must use snake_case
- Must specify multi-tenant requirements
- Should include Lua script needs (MetaBuilder is 95% JSON/Lua)
- Must declare dependencies

#### 🔧 DBAL Issue (`dbal_issue.yml`)
Report issues with the Database Abstraction Layer.

**Key Features:**
- Implementation selection (TypeScript/C++)
- Operation type categorization
- Conformance test status
- Implementation parity checks
- Severity levels

**Best For:**
- DBAL TypeScript SDK issues (`dbal/ts/`)
- DBAL C++ daemon issues (`dbal/production/`)
- YAML contract problems (`api/schema/`)
- Conformance test failures
- Implementation inconsistencies

**Special Considerations:**
- Check YAML schema definitions first
- Run conformance tests if applicable
- Verify tenant isolation
- Note if both implementations behave differently

### Template Configuration (`config.yml`)

The config file provides:
- Documentation links
- Community discussion links
- Private security reporting
- Disables blank issues to ensure structure

## Pull Request Template

### Structure

The PR template (`PULL_REQUEST_TEMPLATE.md`) includes comprehensive sections:

#### 1. Basic Information
- Description of changes
- Related issue linking
- Type of change
- Component/area affected

#### 2. Changes Made
- Detailed list of code changes
- Database/schema changes
- Configuration changes

#### 3. Testing
- Test coverage (unit, integration, E2E)
- Manual testing verification
- Permission level testing
- Multi-tenant scenario testing

#### 4. Architecture & Design Decisions

**Data-Driven Approach:**
- Verify JSON/Lua architecture alignment
- Use of declarative components
- DBAL usage for database operations

**Multi-Tenancy:**
- TenantId filtering verification
- Tenant isolation checks

**Permission System:**
- Permission checks at correct levels
- AuthGate/canAccessLevel usage

**Package System:**
- Metadata structure compliance
- Naming conventions (snake_case, semver)
- Dependency declarations

**Security:**
- Input validation
- XSS/SQL injection checks
- Password hashing (SHA-512)
- Lua sandbox restrictions
- No secrets in code

#### 5. Breaking Changes
- Migration steps
- Impact assessment
- Upgrade guide

#### 6. Documentation
- README updates
- API documentation
- Architecture docs
- Migration guides

#### 7. Pre-Submission Checklist

**Code Quality:**
- Follows conventions (one lambda per file)
- Uses MUI (not Radix/Tailwind)
- ESLint passes
- TypeScript compiles

**Testing:**
- All tests pass
- Test coverage adequate
- E2E tests pass (if applicable)
- Cross-browser testing (if UI)

**Database & Schema:**
- Prisma schema validated
- Migrations tested
- DBAL conformance tests pass

**Security:**
- Vulnerabilities checked
- Input validation implemented
- No sensitive data committed

**MetaBuilder-Specific:**
- Data-driven architecture alignment
- Multi-tenant safety verified
- Permission checks correct
- DBAL used (not raw Prisma)
- Generic components where possible

#### 8. Additional Sections
- Deployment considerations
- Reviewer notes
- Focus areas for review

## Using the Templates

### Creating an Issue

1. Go to the [Issues page](https://github.com/johndoe6345789/metabuilder/issues)
2. Click "New issue"
3. Select the appropriate template
4. Fill in all required fields (marked with red asterisk)
5. Complete the pre-submission checklist
6. Submit the issue

### Creating a Pull Request

1. Push your branch to GitHub
2. Navigate to the repository
3. Click "Pull requests" → "New pull request"
4. Select your branch
5. The PR template will auto-populate
6. Fill in all sections thoroughly
7. Mark checkboxes in the pre-submission checklist
8. Submit the PR

### Template Tips

**For Issues:**
- Be specific and detailed
- Include reproduction steps for bugs
- Provide environment details
- Search for duplicates first
- Check documentation before submitting

**For PRs:**
- Link related issues
- Include screenshots for UI changes
- Document breaking changes clearly
- Run all tests before submitting
- Complete the entire checklist
- Focus on minimal, surgical changes

## MetaBuilder-Specific Guidelines

### Data-Driven Architecture
MetaBuilder is 95% JSON/Lua, not TypeScript. When contributing:
- Prefer JSON/Lua configuration over hardcoded TS
- Use `RenderComponent` for declarative UI
- Add Lua scripts to `packages/*/seed/scripts/`
- Keep TypeScript as adapters/wrappers

### Multi-Tenancy
All contributions must respect tenant isolation:
- Include `tenantId` in all queries
- Use `Database` class methods, not raw Prisma
- Test with multiple tenants
- Document tenant-specific behavior

### Permission System (Levels 1-6)
- Level 1: Public (no auth)
- Level 2: User (basic auth)
- Level 3: Moderator (content moderation)
- Level 4: Admin (user management)
- Level 5: God (system config, packages)
- Level 6: Supergod (full system control)

When adding features, specify the minimum required level and use `canAccessLevel()` checks.

### Package System
Packages follow strict conventions:
- Name: `snake_case` (e.g., `blog_engine`)
- Version: Semver (e.g., `1.2.3`)
- Structure: `packages/{name}/seed/` with `metadata.json`, `components.json`
- Lua scripts in `packages/{name}/seed/scripts/`
- Optional React components in `packages/{name}/src/`

### DBAL (Database Abstraction Layer)
- TypeScript implementation: `dbal/ts/` (development)
- C++ implementation: `dbal/production/` (production)
- YAML contracts: `api/schema/` (source of truth)
- Always update YAML first
- Run conformance tests: `python tools/conformance/run_all.py`
- Ensure both implementations behave identically

## Best Practices

### Issue Reporting
1. **Search first**: Check if the issue already exists
2. **Be specific**: Provide exact steps and details
3. **Be respectful**: Follow the code of conduct
4. **Be patient**: Maintainers will respond when available
5. **Follow up**: Provide additional info if requested

### Pull Requests
1. **Small changes**: Keep PRs focused and minimal
2. **Test thoroughly**: Run all tests and linters
3. **Document well**: Update docs with changes
4. **Follow conventions**: Match existing code style
5. **Respond quickly**: Address review feedback promptly

### Security
- **Never commit secrets**: No API keys, passwords, tokens
- **Report privately**: Use GitHub Security Advisories for vulnerabilities
- **Hash passwords**: Always use SHA-512 via `password-utils.ts`
- **Validate input**: Never trust user input
- **Sandbox Lua**: Maintain Lua script restrictions

## Getting Help

If you have questions about the templates or contribution process:

1. **Documentation**: Check [docs/](../docs/) for guides
2. **Discussions**: Ask in [GitHub Discussions](https://github.com/johndoe6345789/metabuilder/discussions)
3. **Examples**: Look at existing issues and PRs
4. **Workflow Guide**: See `.github/prompts/0-kickstart.md`

## Template Maintenance

These templates are living documents. If you find:
- Missing fields or options
- Unclear instructions
- Better ways to structure
- New categories needed

Please submit an issue with the "documentation" template to suggest improvements!

## Related Files

- **Workflow Guide**: `.github/prompts/0-kickstart.md`
- **Contributing**: `README.md` → Contributing section
- **Architecture**: `docs/architecture/`
- **DBAL Guide**: `dbal/docs/AGENTS.md`
- **UI Standards**: `UI_STANDARDS.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`
