# Enterprise Gated Tree Workflow

## Overview

MetaBuilder now uses an **Enterprise Gated Tree Workflow** that ensures all code changes pass through multiple validation gates before being merged and deployed. This system provides enterprise-grade quality control and deployment safety.

## Workflow Architecture

The gated workflow consists of **5 sequential gates** that code must pass through:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE GATED WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    Pull Request Created
           ↓
    ┌──────────────────┐
    │  GATE 1: Quality │  ← Prisma, TypeScript, Lint, Security
    └────────┬─────────┘
             ↓ ✅
    ┌──────────────────┐
    │  GATE 2: Testing │  ← Unit, E2E, DBAL Daemon Tests
    └────────┬─────────┘
             ↓ ✅
    ┌──────────────────┐
    │ GATE 3: Build    │  ← Application Build, Quality Metrics
    └────────┬─────────┘
             ↓ ✅
    ┌──────────────────┐
    │ GATE 4: Approval │  ← Human Code Review Required
    └────────┬─────────┘
             ↓ ✅ (Auto-merge)
    Merged to Main Branch
           ↓
    ┌──────────────────┐
    │ GATE 5: Deploy   │  ← Staging (auto) → Production (manual)
    └──────────────────┘
```

## Gate Details

### Gate 1: Code Quality

**Purpose:** Ensure code meets quality standards before running expensive tests.

**Checks:**
- **Prisma Schema Validation** - Database schema is valid
- **TypeScript Type Check** - No type errors
- **ESLint** - Code style and quality rules
- **Security Audit** - Dependency vulnerability scan

**Workflow:** `gated-ci.yml`

**Why first?** Fast feedback on basic quality issues prevents wasting resources on broken code.

### Gate 2: Testing

**Purpose:** Verify functionality and prevent regressions.

**Checks:**
- **Unit Tests** - Component and function-level tests
- **E2E Tests** - End-to-end Playwright tests
- **DBAL Daemon Tests** - Database abstraction layer integration tests

**Runs in parallel** after Gate 1 for faster feedback.

**Why second?** Tests only run on code that passes basic quality checks.

### Gate 3: Build & Package

**Purpose:** Ensure the application can be built and packaged for deployment.

**Checks:**
- **Application Build** - Next.js production build
- **Quality Metrics** - Check for console.log, TODO comments
- **Artifact Packaging** - Build artifacts uploaded

**Why third?** Build happens after tests confirm functionality.

### Gate 4: Review & Approval

**Purpose:** Human oversight and knowledge sharing.

**Requirements:**
- ✅ All automated gates (1-3) must pass
- ✅ At least one approved code review
- ❌ No "changes requested" reviews
- ❌ PR must not be in draft state

**Auto-merge:** Once approved and all checks pass, the PR is automatically merged and the branch is deleted.

**Why fourth?** Humans review after automation confirms quality.

### Gate 5: Deployment

**Purpose:** Safe, controlled deployment to staging and production.

**Environments:**

#### Staging (Automatic)
- Triggered on push to `main`/`master` branch
- Automatic deployment after merge
- Runs smoke tests
- No manual approval required
- URL: `https://staging.metabuilder.example.com`

#### Production (Manual Approval Required)
- Triggered by:
  - Release creation
  - Manual `workflow_dispatch` with `environment: production`
- **Requires manual approval** in GitHub UI
- Pre-deployment checklist validation
- Breaking change warnings
- Database migration review
- Rollback plan verification
- Post-deployment monitoring
- URL: `https://metabuilder.example.com`

**Why last?** Deployment only happens to code that passed all quality gates and human review.

## Workflows

### Primary Workflows

1. **`gated-ci.yml`** - Enterprise Gated CI/CD Pipeline
   - Runs on: PR creation, PR updates, push to main/master/develop
   - Implements Gates 1-4
   - Reports gate status on PRs

2. **`gated-deployment.yml`** - Enterprise Gated Deployment
   - Runs on: Push to main/master, releases, manual trigger
   - Implements Gate 5
   - Manages staging and production deployments

3. **`pr/auto-merge.yml`** - Auto Merge (Updated)
   - Triggers after Gate 4 approval
   - Supports both legacy and gated workflows
   - Automatically merges and cleans up branches

### Legacy Workflows (Still Active)

- **`ci/ci.yml`** - Legacy CI/CD (parallel support)
- **`pr/code-review.yml`** - Automated code review
- **`pr/merge-conflict-check.yml`** - Merge conflict detection
- **`quality/deployment.yml`** - Legacy deployment workflow

## Developer Workflow

### Standard Development Flow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Develop and Commit**
   - Make changes
   - Write tests
   - Commit frequently

3. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   ```
   - Create PR on GitHub
   - Gates 1-3 run automatically

4. **Monitor Gate Progress**
   - Check PR for gate status
   - Fix any failures quickly
   - Gates run in sequence for efficiency

5. **Request Review**
   - Once gates pass, request review
   - Address review feedback
   - Gates re-run on new commits

6. **Approval and Auto-Merge**
   - Get approval from reviewer
   - PR automatically merges when approved
   - Branch automatically deleted

7. **Deployment**
   - Staging deployment happens automatically
   - Production requires manual approval

### Emergency Hotfix Flow

For critical production issues:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/critical-fix main
   ```

2. **Make Minimal Fix**
   - Keep changes small and focused
   - All gates still run

3. **Expedited Review**
   - Request immediate review
   - Communicate urgency

4. **Production Deployment**
   ```bash
   # Use workflow_dispatch
   # Select "production" environment
   # Optional: skip_tests = true (use with extreme caution)
   ```

5. **Manual Approval**
   - Approve in GitHub Actions UI
   - Deployment proceeds

## Gate Bypass (Emergency Only)

**⚠️ Use with extreme caution**

The `gated-deployment.yml` workflow has a `skip_tests` option for emergency deployments:

```yaml
workflow_dispatch:
  inputs:
    skip_tests: true  # Bypasses pre-deployment validation
```

**When to use:**
- Production is down
- Security vulnerability requires immediate patch
- Data loss prevention

**Audit trail:**
- All bypasses are logged
- GitHub audit log captures who triggered
- Deployment creates tracking issue

**Post-bypass:**
- Run full test suite immediately
- Document reason in deployment issue
- Schedule proper fix if needed

## Benefits

### For Developers
- ✅ Fast feedback on quality issues
- ✅ Automated merge process
- ✅ Clear gate status visibility
- ✅ Parallel test execution
- ✅ Automatic branch cleanup

### For Teams
- ✅ Consistent quality standards
- ✅ Enforced code review
- ✅ Audit trail for all changes
- ✅ Reduced human error
- ✅ Knowledge sharing through reviews

### For Operations
- ✅ Safe deployment process
- ✅ Staging environment validation
- ✅ Manual production approval
- ✅ Automatic rollback preparation
- ✅ Post-deployment monitoring

## Monitoring & Observability

### Gate Status

Check gate status in PR:
- Comment shows all gate results
- Each gate marked with ✅/❌/⏳
- Links to detailed logs

### Deployment Tracking

Production deployments automatically create tracking issues:
- Deployment time and commit
- Breaking change warnings
- Monitoring checklist
- Emergency contact info

### Metrics

Track these metrics over time:
- Gate pass/fail rates
- Time to merge (gate duration)
- Deployment frequency
- Rollback rate

## Configuration

### Branch Protection Rules

Configure in GitHub Settings → Branches:

```yaml
Protected Branches: main, master

Required status checks:
  - Gate 1: Code Quality - Passed ✅
  - Gate 2: Testing - Passed ✅
  - Gate 3: Build & Package - Passed ✅

Required reviews: 1
Dismiss stale reviews: true
Require review from code owners: false

Restrictions:
  - Allow force pushes: false
  - Allow deletions: false
```

### Environment Protection

Configure in GitHub Settings → Environments:

#### Staging Environment
```yaml
Name: staging
Protection rules: None (automatic deployment)
```

#### Production Environment
```yaml
Name: production
Protection rules:
  - Required reviewers: 1-2 designated approvers
  - Wait timer: 0 minutes
  - Deployment branches: main, master only
```

### Secrets Required

Add these secrets in GitHub Settings → Secrets:

```
STAGING_DATABASE_URL - Staging database connection
PRODUCTION_DATABASE_URL - Production database connection
```

## Troubleshooting

### Gate 1 Failures

**TypeScript errors:**
```bash
cd frontends/nextjs
npm run typecheck
```

**Lint errors:**
```bash
cd frontends/nextjs
npm run lint:fix
```

### Gate 2 Failures

**Unit test failures:**
```bash
cd frontends/nextjs
npm run test:unit
```

**E2E test failures:**
```bash
cd frontends/nextjs
npm run test:e2e
```

### Gate 3 Failures

**Build errors:**
```bash
cd frontends/nextjs
npm run build
```

### Gate 4 Issues

**No approval:**
- Request review from team member
- Address review feedback

**Changes requested:**
- Make requested changes
- Respond to review comments
- Request re-review

### Gate 5 Issues

**Staging deployment fails:**
- Check pre-deployment validation logs
- Verify database migrations
- Check application logs

**Production approval needed:**
- Verify staging is stable
- Review breaking changes
- Approve in GitHub Actions UI

## Testing Locally

Use `act` to test workflows locally:

```bash
# Test gated CI workflow
cd frontends/nextjs
npm run act -- -W ../.github/workflows/gated-ci.yml

# Test specific gate
npm run act -- -j gate-1-start

# Test deployment workflow
npm run act -- -W ../.github/workflows/gated-deployment.yml
```

## Migration from Legacy Workflows

Both legacy (`ci/ci.yml`) and new gated workflows run in parallel during migration:

1. **Phase 1 (Current):** Both workflows run
2. **Phase 2:** Teams validate gated workflow
3. **Phase 3:** Disable legacy workflow
4. **Phase 4:** Remove legacy workflow files

## Best Practices

### Writing Gate-Friendly Code

1. **Keep PRs small** - Faster to review and merge
2. **Write tests first** - Catch issues early
3. **Fix lint errors** - Gate 1 is fastest feedback
4. **Run locally** - Test before pushing
5. **Commit frequently** - Easier to identify issues

### Reviewing PRs

1. **Check gate status** - All gates should pass
2. **Review code changes** - Focus on logic and design
3. **Verify tests** - New features should have tests
4. **Consider impact** - Breaking changes need extra care
5. **Approve quickly** - Don't block development

### Deploying

1. **Validate staging** - Test thoroughly before production
2. **Review breaking changes** - Communicate to users
3. **Monitor after deployment** - Watch for issues
4. **Keep rollback ready** - Be prepared to revert
5. **Document incidents** - Learn from problems

## Future Enhancements

Planned improvements:

- [ ] Automated performance regression testing
- [ ] Visual regression testing
- [ ] Canary deployments
- [ ] Blue-green deployment support
- [ ] Automatic rollback on high error rates
- [ ] Integration with observability platforms
- [ ] Custom gate configurations per repository
- [ ] Gate metrics dashboard

## Support

For issues or questions:

1. **Check logs** - Gate failures include detailed logs
2. **Read error messages** - Often self-explanatory
3. **Review this guide** - Common issues covered
4. **Ask the team** - Team chat or issue tracker
5. **Emergency:** Contact on-call engineer

## Related Documentation

- [GitHub Workflows README](.github/workflows/README.md)
- [ACT Testing Guide](docs/guides/ACT_TESTING.md)
- [Deployment Procedures](docs/deployment/)
- [SDLC TODO](docs/todo/core/21-SDLC-TODO.md)

---

**Last Updated:** December 27, 2025
**Version:** 1.0.0
**Status:** Active
