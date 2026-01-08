# GitHub Workflows Documentation

This directory contains automated workflows for CI/CD, code quality, and comprehensive AI-assisted development throughout the entire SDLC.

## 🚦 Enterprise Gated Tree Workflow

MetaBuilder uses a **Unified Enterprise Gated Pipeline** that consolidates all CI/CD, deployment, and development assistance into a single workflow with clear gate visualization.

**📖 Complete Guide:** [Enterprise Gated Workflow Documentation](../../docs/ENTERPRISE_GATED_WORKFLOW.md)

### Quick Overview

All PRs and deployments flow through 6 sequential gates in a single workflow:

1. **Gate 1: Code Quality** - Prisma, TypeScript, Lint, Security (7 atomic steps)
2. **Gate 2: Testing** - Unit, E2E, DBAL Daemon tests (3 atomic steps)
3. **Gate 3: Build & Package** - Application build, quality metrics (2 atomic steps)
4. **Gate 4: Development Assistance** - Architectural feedback, Copilot interaction (PR only)
5. **Gate 5: Staging Deployment** - Automatic deployment to staging (main branch push)
6. **Gate 6: Production Deployment** - Manual approval required (release/workflow_dispatch)

**Key Benefits:**
- ✅ **Single unified workflow** - No confusion about which pipeline runs what
- ✅ Sequential gates prevent wasted resources
- ✅ Tree structure for clear visualization of all validation steps
- ✅ Automatic merge after approval
- ✅ Conditional execution based on trigger (PR vs push vs release)
- ✅ Complete audit trail for all deployments

### Pipeline Consolidation (Jan 2026)

**Consolidated into `gated-pipeline.yml`:**
- ✅ `gated-ci.yml` (1048 lines) - CI with gates 1-5
- ✅ `gated-deployment.yml` (617 lines) - Deployment workflows
- ✅ `development.yml` (360 lines) - Development assistance

**Result:** Single 1287-line workflow with all functionality preserved and no duplication.

**Previous Deprecated and Removed (Dec 2025):**
- ❌ `ci/ci.yml` - Replaced by gated workflows
- ❌ `quality/deployment.yml` - Replaced by gated workflows

See [Legacy Pipeline Cruft Report](../../docs/LEGACY_PIPELINE_CRUFT_REPORT.md) for analysis.

## 🤖 GitHub Copilot Integration

All workflows are designed to work seamlessly with **GitHub Copilot** to assist throughout the Software Development Lifecycle:

- **Planning Phase**: Architecture review, PRD alignment, implementation guidance
- **Development Phase**: Continuous quality feedback, code suggestions, refactoring opportunities
- **Testing Phase**: Automated code review, security checks, quality validation
- **Deployment Phase**: Pre-deployment validation, health checks, monitoring
- **Maintenance Phase**: Issue triage, automated fixes, dependency management

**📖 Copilot Instructions:** [.github/copilot-instructions.md](../copilot-instructions.md)

## Workflows Overview

### 🚦 Enterprise Gated Workflow (Unified)

#### Enterprise Gated Pipeline (`gated-pipeline.yml`) 🆕
**Triggered on:** Push to main/master/develop, Pull requests, Releases, Manual dispatch, Issue comments

**Consolidates:** All CI/CD, deployment, and development assistance in one workflow

**Structure:**
- **Gate 1:** Code Quality - 7 validation steps
  - 1.1 Prisma Validation
  - 1.2 TypeScript Check (+ strict mode analysis)
  - 1.3 ESLint (+ any-type detection + ts-ignore detection)
  - 1.4 Security Scan (+ dependency audit)
  - 1.5 File Size Check
  - 1.6 Code Complexity Analysis
  - 1.7 Stub Implementation Detection
- **Gate 2:** Testing - 3 validation steps
  - 2.1 Unit Tests (+ coverage analysis)
  - 2.2 E2E Tests
  - 2.3 DBAL Daemon Tests
- **Gate 3:** Build & Package - 2 validation steps
  - 3.1 Application Build (+ bundle analysis)
  - 3.2 Quality Metrics (PR only)
- **Gate 4:** Development Assistance (PR only)
  - 4.1 Code metrics analysis
  - 4.2 Architectural compliance
  - 4.3 Refactoring suggestions
  - 4.4 Copilot interaction handler
- **Gate 5:** Staging Deployment (main branch push)
  - Automatic deployment to staging environment
  - Smoke tests and health checks
- **Gate 6:** Production Deployment (release/manual)
  - Manual approval gate
  - Production deployment with health monitoring
  - Deployment tracking issue creation

**Features:**
- Individual validation steps for superior visualization
- **Gate artifacts** persisted between steps (30-day retention)
- Conditional execution based on trigger type
- Granular failure detection
- Parallel execution within gates
- Complete audit trail with JSON artifacts
- Individual step timing and status
- Sequential gate execution for efficiency
- Clear gate status reporting on PRs
- Summary report with all gate results

### 🔄 Supporting Workflows

#### Issue and PR Triage (`triage.yml`)
**Triggered on:** Issues (opened/edited/reopened) and Pull Requests (opened/reopened/synchronize/edited)

**Purpose:** Quickly categorize inbound work so reviewers know what to look at first.

- Auto-applies labels for type (bug/enhancement/docs/security/testing/performance) and area (frontend/backend/database/workflows/documentation)
- Sets a default priority and highlights beginner-friendly issues
- Flags missing information (repro steps, expected/actual results, versions) with a checklist comment
- For PRs, labels areas touched, estimates risk based on change size and critical paths, and prompts for test plans/screenshots/linked issues
- Mentions **@copilot** to sanity-check the triage with GitHub-native AI

This workflow runs alongside the gated pipeline to provide quick triage feedback.

### 🗑️ Legacy Workflows (Removed)

#### CI/CD Workflow (`ci/ci.yml`) - ❌ REMOVED
**Status:** Deprecated and removed (Dec 2025)  
**Reason:** 100% functionality superseded by gated pipeline

**Jobs:** ~~Prisma Check, Lint, Build, E2E Tests, Quality Check~~

**Replacement:** Consolidated into `gated-pipeline.yml`

### 3. Automated Code Review (`pr/code-review.yml`)
**Triggered on:** Pull request opened, synchronized, or reopened

**Features:**
- Analyzes code changes for security issues (eval, innerHTML, XSS risks)
- Checks for code quality issues (console.log, debugger, any types)
- Provides suggestions for improvements
- **Auto-approves PRs** if no blocking issues are found
- Adds appropriate labels (needs-changes, ready-for-review, has-warnings)

**Review Criteria:**
- ✅ Security vulnerabilities
- ✅ Code quality issues
- ✅ Type safety
- ✅ React best practices
- ✅ File size warnings

### 4. Auto Merge (`pr/auto-merge.yml`) - Updated for Gated Pipeline
**Triggered on:** PR approval, CI workflow completion

**Features:**
- Automatically merges PRs when:
  - PR is approved by reviewers
  - All gates pass in unified gated pipeline
  - No merge conflicts
  - PR is not in draft
- **Automatically deletes the branch** after successful merge
- Uses squash merge strategy
- Posts comments about merge status
- **Updated:** Now supports unified Enterprise Gated Pipeline checks

### 5. Issue Triage (`issue-triage.yml`)
**Triggered on:** New issues opened, issues labeled

**Features:**
- Automatically categorizes and labels issues:
  - Type: bug, enhancement, documentation, testing, security, performance
  - Priority: high, medium, low
  - AI-fixable flag for automated fixes
- Posts welcome message with issue summary
- Suggests automated fix attempts for simple issues
- Can create fix branches automatically with `create-pr` label

### 6. PR Management (`pr/pr-management.yml`)
**Triggered on:** PR opened, synchronized, labeled

**Features:**
- Auto-labels PRs based on changed files:
  - workflows, tests, documentation, ui, styling, configuration, dependencies
  - Size labels (small/medium/large)
  - Type labels from PR title (bug, enhancement, refactor, etc.)
- Validates PR descriptions
- Links related issues automatically
- Posts comments on related issues

### 7. Merge Conflict Check (`pr/merge-conflict-check.yml`)
**Triggered on:** PR opened/synchronized, push to main/master

**Features:**
- Detects merge conflicts
- Posts comment mentioning @copilot to resolve
- Adds/removes `merge-conflict` label
- Fails CI if conflicts exist

### 8. Planning & Design (`quality/planning.yml`) 🆕
**Triggered on:** Issues opened or labeled with enhancement/feature-request

**Features:**
- **Architecture Review**: Analyzes feature requests against architectural principles
- **PRD Alignment Check**: Ensures new features align with project mission
- **Implementation Suggestions**: Provides step-by-step implementation guidance
- Validates declarative-first approach
- Checks multi-tenant and permission considerations
- Creates design checklists for feature implementation
- **@copilot integration** for architecture guidance

**SDLC Phase:** Planning & Design

### 9. Code Size Limits (`quality/size-limits.yml`)
**Triggered on:** Pull requests, pushes to main (when source files change)

**Features:**
- Enforces file size limits and posts PR comments on violations
- Uploads a size report artifact
- Monitors `frontends/nextjs/src/**` and runs `scripts/enforce-size-limits.ts` from `frontends/nextjs`

## SDLC Coverage

### 🎯 Complete Lifecycle Support

```
┌─────────────┐
│  Planning   │ ← quality/planning.yml (Architecture Review, PRD Check)
└──────┬──────┘
       ↓
┌─────────────┐
│ Development │ ← gated-pipeline.yml Gate 4 (Dev Feedback, Copilot)
└──────┬──────┘
       ↓
┌─────────────┐
│   Testing   │ ← ci.yml, code-review.yml (Lint, Build, E2E)
└──────┬──────┘
       ↓
┌─────────────┐
│ Integration │ ← pr-management.yml, auto-merge.yml
└──────┬──────┘
       ↓
┌─────────────┐
│ Deployment  │ ← deployment.yml (Validation, Health Checks)
└──────┬──────┘
       ↓
┌─────────────┐
│ Maintenance │ ← issue-triage.yml, dependabot.yml
└─────────────┘
```

## Labels Used

### Automated Labels
- `bug` - Bug fixes
- `enhancement` - New features
- `feature-request` - Proposed new features
- `ready-to-implement` - Features ready for development
- `documentation` - Documentation changes
- `tests` - Test-related changes
- `security` - Security issues
- `performance` - Performance improvements
- `needs-changes` - PR requires changes
- `ready-for-review` - PR is ready for review
- `has-warnings` - PR has warnings to address
- `large-pr` - PR with many changes
- `size: small/medium/large` - PR size indicators
- `ai-fixable` - Issues that can be auto-fixed
- `good first issue` - Good for newcomers
- `priority: high/medium/low` - Issue priority
- `merge-conflict` - PR has merge conflicts
- `auto-fix` - Request automated fix
- `create-pr` - Create fix PR for issue
- `deployment` - Deployment tracking
- `monitoring` - Monitoring and observability
- `dependencies` - Dependency updates
- `refactor` - Code refactoring
- `chore` - Maintenance tasks
- `workflows` - Workflow changes
- `ui` - UI/UX changes
- `styling` - CSS/Tailwind changes
- `configuration` - Config file changes

## Configuration

### ESLint
The project uses ESLint with TypeScript support and React-specific rules:
- File: `eslint.config.js`
- Strict type checking (warnings for gradual adoption)
- React hooks validation
- Code quality rules

### Playwright E2E Tests
- Configuration: `playwright.config.ts`
- Tests directory: `e2e/`
- Runs on Chromium browser
- Tests include:
  - Login functionality
  - Navigation
  - CRUD operations
  - Form interactions

## Usage

### Working with GitHub Copilot

**In Issues:**
```markdown
@copilot implement this issue
@copilot review the architecture
@copilot suggest testing strategy
@copilot help with this
```

**In Pull Requests:**
- Automated feedback on every push
- Continuous quality metrics
- Refactoring suggestions
- Architectural compliance checks

**In Your IDE:**
- Reference `.github/copilot-instructions.md` for context
- Use docs/getting-started/PRD.md for feature context
- Follow existing patterns in `/packages/`
- Ask Copilot about architectural decisions

### Testing Workflows Locally with Act

Before pushing to GitHub, test workflows locally using [act](https://github.com/nektos/act):

```bash
# Quick diagnostics (no act required)
./scripts/diagnose-workflows.sh

# Interactive workflow testing
./scripts/test-workflows.sh

# Or use act directly
act -l                    # List all workflows
act push                  # Run CI pipeline
act -j lint              # Test linting job
act -j build             # Test build job
```

**📖 See [ACT_TESTING.md](../../docs/ACT_TESTING.md) for comprehensive act testing guide**

### Running Locally

```bash
# Run linter
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Run e2e tests
bun run test:e2e

# Run e2e tests with UI
bun run test:e2e:ui

# Run e2e tests in headed mode
bun run test:e2e:headed

# Build the project
bun run build
```

### Triggering Workflows

**Planning Phase:**
1. Create issue with `enhancement` or `feature-request` label
2. Automated architecture review and PRD alignment check
3. Add `ready-to-implement` label for implementation guidance
4. Follow suggested step-by-step plan

**Development Phase:**
1. Create feature branch: `git checkout -b feature/issue-X`
2. Push changes - triggers continuous quality feedback
3. Get real-time metrics on declarative ratio, component sizes
4. Mention `@copilot` in commits/PRs for specific help
5. Review refactoring suggestions

**Testing & Review Phase:**
1. Open PR - automatically reviewed, labeled, and validated
2. Address any architectural compliance issues
3. Get approval + pass tests
4. Automatically merged and branch deleted

**Deployment Phase:**
1. Merge to main - triggers pre-deployment validation
2. Create release - generates deployment notes and tracking issue
3. Post-deployment health checks run automatically
4. Monitor deployment tracking issue for 48 hours

**Maintenance Phase:**
1. Security audits run on every deployment
2. Dependabot creates automated dependency PRs
3. Issue triage handles new bug reports
4. @copilot assists with fixes and improvements

### For Issues:
1. Create an issue - automatically triaged and labeled
2. Add `enhancement` label - triggers architecture review
3. Add `ready-to-implement` label - get implementation guidance
4. Add `auto-fix` label to request automated fix
5. Add `create-pr` label to create a fix branch
6. Mention `@copilot` for specific assistance

**For PRs:**
1. Open a PR - automatically reviewed, labeled, and validated
2. Push changes - triggers CI/CD pipeline and quality feedback
3. Get approval + pass tests - automatically merged and branch deleted
4. Receive continuous refactoring suggestions

### Working with AI Assistance

**In Issues & PRs:**
- Mention `@copilot implement this` - Get implementation guidance
- Mention `@copilot review` - Request code review
- Mention `@copilot architecture` - Get architectural guidance
- Mention `@copilot test` - Get testing help
- Mention `@copilot fix this issue` - Request automated fix

**In Your IDE:**
- Use GitHub Copilot extension with context from `.github/copilot-instructions.md`
- Reference docs/getting-started/PRD.md when prompting for features
- Follow patterns from existing packages
- Ask about architectural decisions before implementing

**Automated Copilot Features:**
- Architecture review on feature requests
- Continuous quality feedback during development
- Refactoring opportunity detection
- PRD alignment checking
- Implementation step-by-step guidance

## Best Practices

### For Development
1. **Follow declarative-first principles** - Prefer JSON + Lua over TypeScript
2. **Keep components under 150 LOC** - Break large files into smaller ones
3. **Use generic renderers** - Avoid hardcoded component TSX files
4. **Store config in database** - Use Prisma, not hardcoded values
5. **Organize as packages** - Self-contained features with seed data

### For Pull Requests

### For Pull Requests
1. **Write descriptive PR titles** - Used for automatic labeling
2. **Link issues in PR descriptions** - Enables automatic issue closing
3. **Keep PRs focused and small** - Easier to review and merge
4. **Address all review comments** - Even warnings should be considered
5. **Test locally before pushing** - Run lint and tests
6. **Don't commit console.log statements** - Will be flagged in review
7. **Remove debugger statements** - Treated as blocking issues
8. **Review refactoring suggestions** - Continuous improvement opportunities

### For Issues
1. **Use clear, descriptive titles** - Helps with automatic categorization
2. **Provide context** - Link to docs/getting-started/PRD.md sections, mention permission levels
3. **Consider architecture** - Is this declarative? Package-worthy? Multi-tenant?
4. **Use labels appropriately** - Triggers relevant workflow automation
5. **Engage with @copilot** - Get AI assistance throughout implementation

## Troubleshooting

### Running Act to Find Workflow Issues

Use act to test workflows locally and identify issues before pushing:

```bash
# Run full diagnostics
./scripts/diagnose-workflows.sh

# Test specific failing job
act -j <job-name> -v

# Test entire CI pipeline
./scripts/test-workflows.sh
```

**📖 Complete guide:** [ACT_TESTING.md](../../docs/ACT_TESTING.md)

### PR Not Auto-Merging
- Check that all CI checks passed
- Verify PR has approval
- Ensure no merge conflicts
- Confirm PR is not in draft mode

### Tests Failing
- Run tests locally: `bun run test:e2e`
- Check test report artifacts in GitHub Actions
- Ensure dev server starts correctly
- Test with act: `act -j test-e2e`

### Linting Errors
- Run `bun run lint:fix` to auto-fix
- Review errors: `bun run lint`
- Check `eslint.config.js` for rule configuration
- Test with act: `act -j lint`

### Build Failures
- Test locally: `bun run build`
- Check for TypeScript errors
- Verify all dependencies are installed
- Test with act: `act -j build`

### Prisma Issues
- Ensure schema exists: `prisma/schema.prisma`
- Generate client: `bunx prisma generate`
- Run migrations: `bunx prisma migrate dev`
- Test with act: `act -j prisma-check`

## Contributing

When adding new workflows:
1. Document the workflow in this README
2. Add appropriate error handling
3. Test the workflow on a test branch
4. Ensure proper permissions are set
5. Add labels if needed (they'll be created automatically)

## Security

Workflows use `GITHUB_TOKEN` with minimal required permissions:
- `contents: read/write` - For reading code and merging PRs
- `pull-requests: write` - For commenting and managing PRs
- `issues: write` - For managing issues
- `checks: read` - For reading CI status

No secrets are required for basic functionality.
