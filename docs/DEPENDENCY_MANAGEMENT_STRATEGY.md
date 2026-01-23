# Dependency Management Strategy

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-23  
**Status**: Phase 4 - Maintenance Infrastructure  
**Scope**: All 34 directories, 27,826+ files

---

## Executive Summary

This document establishes the long-term strategy for managing dependencies across the MetaBuilder ecosystem. Following Phases 1-3 of the Dependency Remediation Plan (completed January 2026), this strategy ensures ongoing consistency, security, and stability.

**Key Principles**:
- **Canonical versions** define the source of truth for each dependency
- **Workspace consistency** prevents dependency drift
- **Risk-based update strategy** balances innovation with stability
- **Automated auditing** catches issues early
- **Clear escalation paths** for critical issues

---

## Table of Contents

1. [Version Standardization Policy](#version-standardization-policy)
2. [Canonical Version Registry](#canonical-version-registry)
3. [When to Update Dependencies](#when-to-update-dependencies)
4. [Evaluation Framework](#evaluation-framework)
5. [Pre-release Package Policy](#pre-release-package-policy)
6. [Workspace Consistency Guidelines](#workspace-consistency-guidelines)
7. [Monthly Audit Process](#monthly-audit-process)
8. [Risk Assessment Framework](#risk-assessment-framework)
9. [Emergency Procedures](#emergency-procedures)
10. [Documentation Requirements](#documentation-requirements)

---

## Version Standardization Policy

### Philosophy

MetaBuilder uses a **tiered standardization approach**:

1. **Tier 1 - Critical Infrastructure** (must match exactly)
   - TypeScript: `5.9.3`
   - Node.js: `24.13.0`
   - npm: `11.7.0`
   
2. **Tier 2 - Major Frameworks** (minor version flexibility)
   - React: Primary `19.2.3`, Secondary `18.3.1`
   - Next.js: Version depends on project (14.2.35, 15.1.3, 16.1.1 all supported)
   - Material-UI: `7.3.6+` (latest patch acceptable)

3. **Tier 3 - Utility Libraries** (patch version flexibility)
   - Most dependencies allow patch version variation within minor version

### When to Enforce Exact Versions

Use exact versions (`1.2.3`) for:
- Security-critical packages (crypto, auth)
- Compiler/transpiler packages (TypeScript, Babel)
- Build tools (webpack, Vite, esbuild)
- Cross-workspace packages that must interoperate

### When to Allow Ranges

Use semver ranges (`^1.2.3` or `~1.2.3`) for:
- UI component libraries
- Utility functions
- Data transformation libraries
- Logging and monitoring tools

**Range Definitions**:
- `^1.2.3`: Allows minor and patch updates (1.x.x compatible)
- `~1.2.3`: Allows only patch updates (1.2.x compatible)
- `1.2.3`: Exact version (no updates)

---

## Canonical Version Registry

### As of 2026-01-23

**Core Infrastructure**

| Package | Canonical | Category | Status |
|---------|-----------|----------|--------|
| Node.js | 24.13.0 | Runtime | Stable |
| npm | 11.7.0 | Package Manager | Stable |
| TypeScript | 5.9.3 | Compiler | Stable |
| Prisma | 7.2.0 | Database | Stable |

**Frontend Frameworks**

| Package | Canonical | Alternative | Category | Notes |
|---------|-----------|-------------|----------|-------|
| React | 19.2.3 | 18.3.1 | Framework | 19.x in new projects |
| Next.js | 15.1.3+ | 14.2.35, 16.1.1 | Framework | Version per project |
| Material-UI | 7.3.6 | - | UI Library | Latest patch OK |

**Development Tools**

| Package | Canonical | Category | Status |
|---------|-----------|----------|--------|
| Vite | 6.0.0+ | Build Tool | Preferred |
| Playwright | Latest LTS | Testing | Stable |
| ESLint | 8.x | Linting | Stable |
| Prettier | 3.x | Formatting | Stable |

**Mono-workspace Root**

| Package | Canonical | Purpose |
|---------|-----------|---------|
| typescript | ~5.9.3 | Language support |
| @types/node | ^24.0.0 | Type definitions |
| eslint | ^8.57.0 | Code quality |
| prettier | ^3.4.2 | Code formatting |

### Package-Specific Overrides

Some packages intentionally deviate from canonical versions:

**workflowui**: Uses React 18.3.1 (stable enterprise release)
**pastebin**: Uses React 19.0.0 (cutting edge experiment)
**exploded-diagrams**: Uses Next 15.3.4 (latest available)
**gameengine**: C++ native, no Node dependencies

---

## When to Update Dependencies

### Update Schedule

- **Security patches**: Immediately (zero tolerance)
- **Critical bug fixes**: Weekly review cycle
- **Minor version updates**: Monthly review cycle
- **Major version updates**: Quarterly review cycle (planned)

### Decision Tree

```
New package/version available
    ↓
Is it a security patch?
    ├─ YES → Update immediately, test, document
    ├─ NO → Continue
    ↓
Is it fixing a known issue impacting us?
    ├─ YES → Schedule for next cycle
    ├─ NO → Continue
    ↓
Is it a major version bump?
    ├─ YES → Schedule for quarterly review
    ├─ NO → Continue
    ↓
Minor/patch for stable package?
    ├─ YES → Safe to include in next batch update
    ├─ NO → Hold for evaluation

```

### Update Batches

Group updates by category for testing:

1. **Security batch**: All security patches (test immediately)
2. **Infrastructure batch**: Node, npm, TypeScript (test across all projects)
3. **Framework batch**: React, Next, Material-UI (test web frontends)
4. **Utility batch**: Logging, validation, data libs (test functionality)

---

## Evaluation Framework

### Pre-Update Checklist

Before updating ANY dependency:

- [ ] Reason: Why is this update needed? (security/bug fix/feature)
- [ ] Impact: What areas of code does this affect?
- [ ] Compatibility: Any breaking changes in release notes?
- [ ] Test scope: Which projects must be tested?
- [ ] Rollback: Can we quickly roll back if issues arise?
- [ ] Timeline: When must this be completed?

### Risk Assessment Template

**Package**: `@mui/material` (example)  
**Current**: 7.3.6  
**Target**: 7.3.7  

**Risk Level**: LOW (patch version)
- Changelog impact: Bug fixes only
- API changes: None
- Dependencies affected: None
- Test scope: docker-terminal frontend, postgres dashboard
- Rollback complexity: Simple (revert patch number)

---

## Pre-release Package Policy

### Policy

- **Beta/RC packages**: Acceptable in experimental branches only
  - Allowed in: `pastebin`, `exploded-diagrams`, research projects
  - Never in: `dbal`, `workflow`, `frontends/nextjs`

- **0.x versions**: Not allowed for critical infrastructure
  - Exception: Can be used if no stable alternative exists
  - Must be pinned to exact version (no `^` or `~`)

- **Pre-release in package.json**: Document why in PR description

### Current Pre-releases (Allowed)

| Package | Version | Project | Justification |
|---------|---------|---------|---|
| React | 19.3.0-canary | Next.js internal | Managed by Next.js |
| React | 0.0.0-experimental | Next.js internal | Managed by Next.js |

---

## Workspace Consistency Guidelines

### Monorepo Structure

```
metabuilder/
├── package.json (root workspace config)
├── dbal/development/package.json
├── workflow/package.json
├── frontends/nextjs/package.json
├── frontends/qt6/ (no package.json - C++)
├── codegen/package.json
├── pastebin/package.json
├── postgres/package.json
├── ... (32+ more standalone projects)
```

### Consistency Rules

1. **Root package.json** defines shared dev dependencies
2. **Workspace packages** extend root config, don't duplicate
3. **Standalone projects** may override if justified
4. **Version pinning**: Use workspace protocol where available

### Tools for Enforcement

**Command: Check consistency**
```bash
npm run audit:versions
```

**Command: Fix workspace issues**
```bash
npm install  # Re-resolve dependencies
npm ls --depth=0  # List top-level deps across workspace
```

### What to Check Monthly

1. **TypeScript version consistency**
   ```bash
   grep -r '"typescript":' --include="package.json" | sort | uniq -c
   ```

2. **React version consistency**
   ```bash
   grep -r '"react":' --include="package.json" | sort | uniq -c
   ```

3. **Peer dependency warnings**
   ```bash
   npm ls 2>&1 | grep -i "peer"
   ```

---

## Monthly Audit Process

### Audit Checklist (Run 1st of each month)

**Step 1: Vulnerability Scan**
```bash
npm audit --workspace root
npm audit --workspace dbal/development
npm audit --workspace frontends/nextjs
# ... run for all workspace packages
```

**Step 2: Outdated Package Review**
```bash
npm outdated --workspace root
npm outdated --all  # See all outdated across workspace
```

**Step 3: Peer Dependency Check**
```bash
npm ls --depth=0 2>&1 | tee audit-report.txt
```

**Step 4: Pre-release Detection**
```bash
grep -r '"@.*":.*-alpha\|^.*-beta\|^.*-rc' --include="package.json"
```

**Step 5: Version Consistency Report**
```bash
# See section: Common Audit Commands (below)
```

### Output: Audit Report

Create monthly file: `txt/AUDIT_REPORT_2026-{MONTH}.txt`

**Content template**:
```
DEPENDENCY AUDIT REPORT
Date: 2026-01-23
Auditor: [Name]

VULNERABILITIES
Critical: 0
High: 0
Medium: 0
Low: 0

OUTDATED PACKAGES
[list with current → target versions]

PEER DEPENDENCY WARNINGS
[list any warnings]

PRE-RELEASE PACKAGES
[list any pre-releases]

VERSION INCONSISTENCIES
[list packages with multiple versions across workspace]

RECOMMENDATIONS
[action items for this month]

STATUS: [PASS / FAIL / ACTION REQUIRED]
```

### Monthly Review Cadence

| Day | Activity |
|-----|----------|
| 1st | Run audit scripts |
| 2-3 | Review results, file issues |
| 4-5 | Create PRs for patch updates |
| 6-10 | Test updates in CI/CD |
| 11-15 | Evaluate minor version updates |
| 16-20 | Batch and prepare for merge |
| 21-30 | Create monthly summary in CLAUDE.md |

---

## Risk Assessment Framework

### Severity Levels

**CRITICAL** - Must fix immediately
- Active security vulnerability (CVSS 9+)
- Breaking compiler bug affecting production
- Data loss risk
- Security audit failure

**HIGH** - Fix within 1 week
- Security vulnerability (CVSS 7-8.9)
- Significant bug impacting core functionality
- Compiler regression

**MEDIUM** - Fix within 1 month
- Security vulnerability (CVSS 4-6.9)
- Bug impacting non-critical features
- Performance regression
- Dependency has newer stable alternative

**LOW** - Include in next regular cycle
- Minor bug fixes
- Feature additions (non-critical)
- Dependency maintenance updates
- Patch version updates

### Major Version Bump Assessment

When considering React 18→19, TypeScript 4→5, etc.:

**Must Answer**:
1. Why upgrade? (security, features, maintenance)
2. What breaks? (breaking changes list)
3. How long to migrate? (hours/days estimate)
4. Who is affected? (list projects)
5. Rollback cost? (complexity estimate)
6. Timeline? (proposed schedule)
7. Regression risk? ( 1-10 scale)
8. Team readiness? (training needed?)

**Go/No-Go Criteria**:
- Go if: Clear benefit, manageable risk, team ready
- No-go if: Unclear benefit OR high risk OR team unready

---

## Emergency Procedures

### Security Vulnerability (CVSS 9+)

**IMMEDIATE ACTIONS** (within 1 hour):

1. Notify team in `#security` Slack channel
2. Create GitHub issue labeled `security-critical`
3. Begin assessment:
   - Does this affect us?
   - What versions are affected?
   - What is the fix/workaround?

**RESPONSE** (within 24 hours):

1. If fixable by dependency update:
   - Update to patched version
   - Run full test suite
   - Deploy fix to production

2. If requires code change:
   - Create emergency PR
   - Expedite review
   - Deploy same day if possible

3. If no fix available:
   - Implement workaround
   - Document mitigation
   - Set timer for patch release check

### Dependency Deadlock (npm install fails)

**Diagnosis**:
```bash
npm install 2>&1 | head -50  # See error
npm ls --all | grep UNMET   # List unmet dependencies
```

**Resolution**:
1. Check `.npmrc` for `legacy-peer-deps=true` (should be set)
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` fresh
4. If still fails, investigate conflicting versions
5. See Phase 3 procedures for workspace-wide fixes

### Performance Regression Post-Update

**Symptoms**: Build time increased, bundle size larger, runtime slower

**Investigation**:
```bash
npm ls [package]               # Check what version got installed
npm dedupe                    # Remove duplicate dependencies
npm prune                     # Remove unused dependencies
```

**Rollback if needed**:
```bash
git checkout package.json
npm install
npm rebuild                   # Rebuild native modules
```

---

## Documentation Requirements

### What Must Be Documented

Every dependency change must include:

1. **In PR Description**
   - Why: Reason for update
   - From/To: Version numbers
   - Risk: Assessment level
   - Testing: What was tested

2. **In CHANGELOG** (if major version bump)
   - Migration steps
   - Breaking changes
   - API changes

3. **In Project CLAUDE.md** (if significant)
   - Updated version in canonical table
   - Any new patterns or concerns

4. **In Release Notes** (if shipping to production)
   - User-visible implications
   - Migration instructions for end-users

### Example PR Description

```markdown
## Update Material-UI from 7.3.6 to 7.3.7

**Reason**: Bug fix for button styling regression (#12345)

**Testing**:
- [x] docker-terminal frontend build succeeds
- [x] postgres dashboard renders correctly
- [x] All existing tests pass
- [x] Visual regression test clean

**Risk**: LOW (patch version, no breaking changes)

**Rollback**: Simple (revert version number in package.json)
```

---

## Integration with CI/CD

### Pre-commit Hook

Should verify:
```bash
npm install --workspace root
npm ls --depth=0  # No UNMET dependencies
```

### PR Validation

Should check:
```bash
npm audit fix --dry-run
npm ls --depth=0
typescript --version
```

### Release Validation

Before shipping to production:
```bash
npm install
npm run build
npm run test:e2e
npm audit
```

---

## Contact & Escalation

### Dependencies & Architecture Team

- **Lead**: [To be assigned]
- **Review**: @metabuilder-core
- **Security Issues**: Report privately to [security@]

### Escalation Path

1. **Days 1-3**: File GitHub issue (ask for help)
2. **Day 4**: Ping dependencies lead
3. **Day 5**: Discuss in team meeting
4. **Day 6+**: Escalate to architecture review

### When to Escalate

- Dependency has no maintained alternative
- Requires major architectural change
- Affects multiple frameworks/runtimes
- Creates version conflict that can't be resolved
- Introduces new language/runtime

---

## Quarterly Business Review

Every 3 months, review:

1. **Dependency health**: How many vulnerabilities found/fixed?
2. **Update velocity**: How long between release and adoption?
3. **Version spread**: How many versions of each package in use?
4. **Team impact**: How much time spent on dependency issues?
5. **Risk profile**: Are we ahead of CVE announcements?

### Metrics to Track

- [ ] Average time to security patch
- [ ] Number of peer dependency warnings
- [ ] Version consistency percentage
- [ ] Pre-release package usage (should trend to zero)
- [ ] Build time trends
- [ ] Bundle size trends

---

## References

- **Phase 1-3 Summary**: docs/DEPENDENCY_UPDATE_SUMMARY_2026-01-23.md
- **Quick Reference**: txt/DEPENDENCY_QUICK_REFERENCE_2026-01-23.txt
- **Team Guide**: txt/DEPENDENCY_TEAM_GUIDE_2026-01-23.txt
- **Audit Checklist**: .github/workflows/DEPENDENCY_AUDIT_CHECKLIST.md
- **CLAUDE.md**: Updated monthly with new findings

---

**Status**: APPROVED for implementation  
**Effective Date**: 2026-01-23  
**Next Review**: 2026-04-23 (Quarterly)

