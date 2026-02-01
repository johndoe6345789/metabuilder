# Dependency CI/CD Validation Rules

**Document**: MetaBuilder Phase 4 - Dependency Management  
**Date**: 2026-01-23  
**Scope**: GitHub Actions and pre-commit validation

---

## Overview

This document defines the CI/CD checks that validate dependency health and consistency. These checks run automatically on every PR and commit.

---

## Pre-Commit Validation

### Hook: Check npm install succeeds

**When**: Before commit
**Command**: `npm install --dry-run`

**Pass Criteria**:
- No UNMET peer dependencies
- No npm error codes
- All workspaces resolve correctly

**Fail Action**: Block commit with error message pointing to dependency conflict

### Hook: Check for security vulnerabilities

**When**: Before commit
**Command**: `npm audit --audit-level=moderate`

**Pass Criteria**:
- No vulnerabilities at MODERATE level or higher
- CRITICAL and HIGH return non-zero exit code
- LOW vulnerabilities allowed in local commits

**Fail Action**: Block commit if CRITICAL or HIGH found

---

## GitHub Actions Validation

### Workflow: NPM Install & Resolve

**Trigger**: On every PR, push to main, push to dev branches

**Steps**:

```yaml
- name: Install dependencies
  run: npm install
  
- name: Check peer dependencies
  run: npm ls --depth=0 2>&1 | tee peer-deps.log

- name: Report peer dependency violations
  if: failure()
  run: |
    echo "::error::Peer dependency violations detected"
    cat peer-deps.log
    exit 1
```

**Pass Criteria**:
- `npm install` succeeds
- No `npm ERR!` messages
- Workspace resolution completes

**Failure Handling**: Block PR merge with error details

### Workflow: Security Audit

**Trigger**: On every PR, daily scheduled (6 AM UTC)

**Steps**:

```yaml
- name: Run npm audit
  run: npm audit --production
  
- name: Check for vulnerabilities
  run: |
    AUDIT_RESULT=$(npm audit --json)
    CRITICAL=$(echo "$AUDIT_RESULT" | jq '.metadata.vulnerabilities.critical')
    HIGH=$(echo "$AUDIT_RESULT" | jq '.metadata.vulnerabilities.high')
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
      echo "::error::Critical or High vulnerabilities found"
      echo "$AUDIT_RESULT" | jq '.'
      exit 1
    fi
```

**Pass Criteria**:
- No CRITICAL vulnerabilities
- No HIGH vulnerabilities in production code
- MEDIUM/LOW allowed but reported

**Failure Handling**: 
- Block PR merge if CRITICAL/HIGH
- Create GitHub issue if daily scan finds new issues
- Notify #security Slack channel

### Workflow: Version Consistency Check

**Trigger**: On every PR that modifies package.json

**Steps**:

```bash
# Check TypeScript consistency
VERSIONS=$(grep -r '"typescript":' --include="package.json" | grep -oE '5\.[0-9]+\.[0-9]+' | sort | uniq)
if [ $(echo "$VERSIONS" | wc -l) -gt 1 ]; then
  echo "::warning::Multiple TypeScript versions found:"
  grep -r '"typescript":' --include="package.json"
  exit 1
fi

# Check React consistency in web projects
grep -r '"react":' frontends/nextjs --include="package.json" | head -1
grep -r '"react":' codegen --include="package.json" | head -1
```

**Pass Criteria**:
- All TypeScript versions match (5.9.3)
- React versions are documented in CLAUDE.md
- No version ranges on security-critical packages

**Failure Handling**: Block PR with explanation

### Workflow: Pre-release Detection

**Trigger**: On every PR that modifies package.json

**Steps**:

```bash
# Find pre-release packages
PRERELEASE=$(grep -r '"@.*":.*-alpha\|^.*-beta\|^.*-rc\|0\.0\.0-' --include="package.json")

if [ ! -z "$PRERELEASE" ]; then
  echo "::warning::Pre-release packages detected:"
  echo "$PRERELEASE"
  echo "Please document why in PR description"
fi
```

**Pass Criteria**:
- No pre-releases in critical infrastructure
- Pre-releases documented in PR if present
- Pre-releases allowed only in experimental projects

**Failure Handling**: Warning comment, not blocking

### Workflow: Build Success Check

**Trigger**: On every PR

**Steps**:

```yaml
- name: TypeScript compilation
  run: npm run typecheck
  
- name: Production build
  run: npm run build
  
- name: Check build artifacts
  run: |
    if [ ! -f dist/index.js ]; then
      echo "::error::Build artifact missing"
      exit 1
    fi
```

**Pass Criteria**:
- `npm run typecheck` exits with 0
- `npm run build` completes without errors
- Build artifacts created

**Failure Handling**: Block PR merge

### Workflow: Dependency Graph Validation

**Trigger**: Scheduled daily (midnight UTC)

**Steps**:

```bash
# Analyze dependency graph for circular dependencies
npm ls --all > dependency-graph.txt

# Check for duplicates
DUPLICATES=$(npm ls --all | grep -c "duplicate")
if [ "$DUPLICATES" -gt 5 ]; then
  echo "::warning::Excessive duplicate dependencies detected"
fi

# Check depth (should be <20 levels)
MAX_DEPTH=$(npm ls --all | grep -oE '\-{2,}' | wc -L)
if [ "$MAX_DEPTH" -gt 20 ]; then
  echo "::warning::Dependency tree very deep: $MAX_DEPTH levels"
fi
```

**Pass Criteria**:
- No circular dependencies
- <10 duplicate dependencies
- Dependency tree depth <20 levels

**Failure Handling**: Create issue if problem detected

---

## Validation Matrix

| Check | Type | Trigger | Pass | Fail |
|-------|------|---------|------|------|
| npm install | Pre-commit | Every commit | Allow | Block |
| npm audit (CRITICAL/HIGH) | Pre-commit | Every commit | Allow | Block |
| npm audit | GitHub Actions | Every PR + daily | Warning | Block if CRITICAL |
| Version consistency | GitHub Actions | package.json changes | Allow | Block |
| Pre-release detection | GitHub Actions | package.json changes | Warning | Notify |
| Build success | GitHub Actions | Every PR | Allow | Block |
| Type checking | GitHub Actions | Every PR | Allow | Block |
| Dependency graph | Scheduled | Daily | Allow | Create issue |

---

## Escalation Triggers

### Automatic Issue Creation

**Condition 1: CRITICAL vulnerability found**
- Severity: CRITICAL
- Issue template: `security-vulnerability.md`
- Assignee: @metabuilder-core
- Labels: security, critical

**Condition 2: Multiple version inconsistencies**
- TypeScript not 5.9.3 in >2 places
- React versions across workspace inconsistent
- Issue template: `version-inconsistency.md`
- Labels: dependencies

**Condition 3: Build failures after dependency update**
- npm run build fails
- npm run typecheck fails
- Issue template: `build-failure.md`
- Labels: phase2-escalation

### Slack Notifications

**Channel: #security** (when triggered)
```
CRITICAL: Security vulnerability in [package]@[version]
CVSS: [score]
URL: [issue link]
Action: [recommended action]
```

**Channel: #dependencies** (when triggered)
```
Version inconsistency detected across workspace
Issue: [link]
Recommendation: [action]
```

**Channel: #devops** (when triggered)
```
Build failure in dependency validation
Issue: [link]
Failing check: [which check]
```

---

## Local Testing of Validation

### Test npm install locally

```bash
npm install --dry-run
npm ls --depth=0 2>&1 | head -20
```

### Test security audit locally

```bash
npm audit
npm audit --json | jq '.metadata.vulnerabilities'
```

### Test version consistency locally

```bash
grep -r '"typescript":' --include="package.json" | sort | uniq -c
grep -r '"react":' --include="package.json" | sort | uniq -c
```

### Test pre-release detection locally

```bash
grep -r '"@.*":.*-alpha\|^.*-beta\|^.*-rc' --include="package.json"
```

### Test build locally

```bash
npm run build
npm run typecheck
```

---

## Bypassing Checks (Not Recommended)

### When absolutely necessary

If a legitimate use case requires bypassing a check:

1. **Add to PR description** why the bypass is needed
2. **Request review** from @metabuilder-core
3. **Add label** "security-exception" or "version-exception"
4. **Document in CLAUDE.md** why the exception exists

### Example: Pre-release package

```markdown
## Why pre-release?
- Needed for experimental feature in pastebin
- Plan to upgrade to stable: 2026-04-30
- Risk: Low (isolated to single project)
```

---

## Future Enhancements

- [ ] Dependency size budget (warn if increases >5%)
- [ ] Breaking change detection (warn before merge)
- [ ] Compatibility matrix checker (Node version compat)
- [ ] License compliance check
- [ ] Supply chain security (SBOM generation)

---

## References

- **Strategy**: docs/DEPENDENCY_MANAGEMENT_STRATEGY.md
- **Quick Reference**: txt/DEPENDENCY_QUICK_REFERENCE_2026-01-23.txt
- **Team Guide**: txt/DEPENDENCY_TEAM_GUIDE_2026-01-23.txt

---

**Status**: APPROVED  
**Effective Date**: 2026-01-23  
**Next Review**: 2026-04-23

