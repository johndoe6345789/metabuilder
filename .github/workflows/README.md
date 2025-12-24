# GitHub Workflows Documentation

This directory contains automated workflows for CI/CD, code quality, and AI-assisted development.

## Workflows Overview

### 1. CI/CD Workflow (`ci.yml`)
**Triggered on:** Push to main/master/develop branches, Pull requests

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Build**: Builds the application and uploads artifacts
- **E2E Tests**: Runs Playwright end-to-end tests
- **Quality Check**: Checks for console.log statements and TODO comments

### 2. Automated Code Review (`code-review.yml`)
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

### 3. Auto Merge (`auto-merge.yml`)
**Triggered on:** PR approval, CI workflow completion

**Features:**
- Automatically merges PRs when:
  - PR is approved by reviewers
  - All CI checks pass (lint, build, e2e tests)
  - No merge conflicts
  - PR is not in draft
- **Automatically deletes the branch** after successful merge
- Uses squash merge strategy
- Posts comments about merge status

### 4. Issue Triage (`issue-triage.yml`)
**Triggered on:** New issues opened, issues labeled

**Features:**
- Automatically categorizes and labels issues:
  - Type: bug, enhancement, documentation, testing, security, performance
  - Priority: high, medium, low
  - AI-fixable flag for automated fixes
- Posts welcome message with issue summary
- Suggests automated fix attempts for simple issues
- Can create fix branches automatically with `create-pr` label

### 5. PR Management (`pr-management.yml`)
**Triggered on:** PR opened, synchronized, labeled

**Features:**
- Auto-labels PRs based on changed files:
  - workflows, tests, documentation, ui, styling, configuration, dependencies
  - Size labels (small/medium/large)
  - Type labels from PR title (bug, enhancement, refactor, etc.)
- Validates PR descriptions
- Links related issues automatically
- Posts comments on related issues

### 6. Merge Conflict Check (`merge-conflict-check.yml`)
**Triggered on:** PR opened/synchronized, push to main/master

**Features:**
- Detects merge conflicts
- Posts comment mentioning @copilot to resolve
- Adds/removes `merge-conflict` label
- Fails CI if conflicts exist

## Labels Used

### Automated Labels
- `bug` - Bug fixes
- `enhancement` - New features
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

### Running Locally

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode
npm run test:e2e:headed

# Build the project
npm run build
```

### Triggering Workflows

**For Issues:**
1. Create an issue - automatically triaged and labeled
2. Add `auto-fix` label to request automated fix
3. Add `create-pr` label to create a fix branch

**For PRs:**
1. Open a PR - automatically reviewed, labeled, and validated
2. Push changes - triggers CI/CD pipeline
3. Get approval + pass tests - automatically merged and branch deleted

### Working with AI Assistance

**Request automated fixes:**
- Comment "@copilot fix this issue" on any issue
- Add `ai-fixable` label to issues that can be auto-fixed

**Get code review feedback:**
- Reviews are automatic on every PR
- Address feedback and push changes
- Workflow will re-review automatically

## Best Practices

1. **Write descriptive PR titles** - Used for automatic labeling
2. **Link issues in PR descriptions** - Enables automatic issue closing
3. **Keep PRs focused and small** - Easier to review and merge
4. **Address all review comments** - Even warnings should be considered
5. **Test locally before pushing** - Run lint and tests
6. **Don't commit console.log statements** - Will be flagged in review
7. **Remove debugger statements** - Treated as blocking issues

## Troubleshooting

### PR Not Auto-Merging
- Check that all CI checks passed
- Verify PR has approval
- Ensure no merge conflicts
- Confirm PR is not in draft mode

### Tests Failing
- Run tests locally: `npm run test:e2e`
- Check test report artifacts in GitHub Actions
- Ensure dev server starts correctly

### Linting Errors
- Run `npm run lint:fix` to auto-fix
- Review errors: `npm run lint`
- Check `eslint.config.js` for rule configuration

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
