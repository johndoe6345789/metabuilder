# METABUILDER SOFTWARE DESIGN SPECIFICATION

**A Contractual and Binding Design Specification**

This document defines the non-negotiable design, quality, and operational requirements for the MetaBuilder codebase. All code contributions are subject to these requirements. Non-compliance is grounds for immediate rejection, reversal, and remediation.

---

## PREAMBLE

**Status:** ACTIVE AND BINDING
**Date:** January 15, 2026
**Scope:** All commits to the MetaBuilder repository

The MetaBuilder codebase MUST maintain operational integrity, type safety, testability, and architectural correctness. These requirements are not aspirational—they are contractual obligations.

**Key Principle:** Code must be proven compliant before acceptance. Presumption is against acceptance until demonstrated otherwise.

---

## ARTICLE I: CORE REQUIREMENTS

### REQUIREMENT 1: BUILD COMPLIANCE

**Specification:**
- `npm run build` MUST complete without errors or warnings that prevent compilation
- Build artifacts MUST be generated to their expected output directories
- Build process MUST be deterministic (identical inputs produce identical outputs across runs)

**Verification:**
```bash
npm run build && echo "PASS" || echo "FAIL"
```

**Remediation on Failure:**
- Immediate rejection of commit
- Automatic revert if merged without approval
- Responsible engineer must correct and resubmit

**Current Status:** ❌ **FAILED** — Frontend build fails. Correction mandatory.

---

### REQUIREMENT 2: TYPE SAFETY

**Specification:**
- `npm run typecheck` MUST complete with zero TypeScript errors
- Strict mode flags MUST remain enabled (`exactOptionalPropertyTypes: true`)
- Use of `@ts-ignore` and `@ts-expect-error` is prohibited except with explicit justification approved by code review
- All implicit `any` types MUST be resolved to concrete types

**Verification:**
```bash
npm run typecheck && [ $(npm run typecheck 2>&1 | grep -c "error") -eq 0 ] && echo "PASS" || echo "FAIL"
```

**Remediation on Failure:**
- Immediate rejection of commit
- Type violations MUST be fixed, not suppressed
- Code must be corrected to comply with type system, not weakened

**Current Status:** ❌ **FAILED** — 27 TypeScript errors. Correction mandatory.

---

### REQUIREMENT 3: IMPORT RESOLUTION

**Specification:**
- All import statements MUST reference modules that exist
- No broken module references are permitted
- Path aliases (`@/dbal`, etc.) MUST resolve to existing files or npm packages
- No circular dependencies are permitted

**Verification:**
```bash
npm run typecheck  # catches unresolved imports
```

**Remediation on Failure:**
- Immediate rejection of commit
- All missing modules MUST be created or import statements MUST be corrected
- Code cannot reference non-existent files

**Current Status:** ❌ **FAILED** — 27 broken imports in frontend. Correction mandatory.

---

### REQUIREMENT 4: DATABASE INITIALIZATION

**Specification:**
- Database schema MUST be initialized successfully
- `npm run db:push` MUST complete without errors
- Database file MUST exist and contain initialized schema
- Database operations MUST be idempotent (safe to run multiple times)

**Verification:**
```bash
npm run db:generate
npm run db:push
test -f /dbal/development/prisma/dev.db && echo "PASS" || echo "FAIL"
```

**Remediation on Failure:**
- Schema inconsistencies MUST be resolved
- Migration scripts MUST be corrected
- Tests cannot proceed until database initializes

**Current Status:** ❌ **FAILED** — Database not initialized. Correction mandatory.

---

### REQUIREMENT 5: DBAL COMPILATION

**Specification:**
- DBAL TypeScript source MUST compile without errors
- `npm --prefix dbal/development run build` MUST succeed
- Compiled output MUST exist in `/dbal/development/dist/`
- All required exports MUST be present in compiled output
- Generated type files MUST be created and included in dist

**Verification:**
```bash
npm --prefix dbal/development run build
test -f dbal/development/dist/index.js && echo "PASS" || echo "FAIL"
```

**Remediation on Failure:**
- All TypeScript errors in DBAL MUST be resolved
- Missing code generation scripts MUST be created
- Codegen tools MUST produce required artifacts

**Current Status:** ❌ **FAILED** — DBAL has 16+ errors. Correction mandatory.

---

### REQUIREMENT 6: DOCUMENTATION

**Specification:**
- Every commit message MUST explain:
  - **WHAT** changed (specific files/functions modified)
  - **WHY** it changed (business/technical rationale)
  - **HOW** to verify it works (test commands or validation steps)
- Code MUST be self-documenting (clear variable/function names)
- Complex logic MUST have explanatory comments describing the _why_, not the _what_
- All public APIs MUST have JSDoc/TSDoc comments

**Remediation on Failure:**
- Commit rejected for inadequate documentation
- Author MUST provide complete explanation before acceptance

**Current Status:** ⚠️ **INCOMPLETE** — Existing code lacks documentation. Future commits must comply.

---

### REQUIREMENT 7: NO DEAD CODE

**Specification:**
- All committed code MUST be active and executed during normal operation
- Unused functions, variables, or modules MUST NOT be committed
- Stub files or incomplete implementations MUST be explicitly marked as work-in-progress with clear status
- All TODO comments MUST reference a tracking issue and expected completion date

**Remediation on Failure:**
- Code rejected if unused or incomplete
- Dead code MUST be deleted or completed

**Current Status:** ❌ **FAILED** — 39 DBAL stub files committed but non-functional. Correction mandatory.

---

### REQUIREMENT 8: ARCHITECTURAL COMPLIANCE

**Specification:**
- Architecture MUST match the specification defined in ARCHITECTURE.md
- DBAL MUST be self-contained and independently deployable
- Seed data and Prisma schema MUST reside in DBAL, not at root level
- Multiple conflicting implementations are prohibited
- Database logic MUST not be scattered across the codebase

**Remediation on Failure:**
- Code rejected if architecture violations exist
- Refactoring MUST be completed before acceptance
- Architecture must be corrected before code cleanup

**Current Status:** ❌ **FAILED** — Seed at root, schema at root, multiple DBAL implementations. Correction mandatory.

---

## ARTICLE II: VERIFICATION PROTOCOL

All commits are subject to the following verification sequence (in order):

### Verification Checklist

- [ ] **BUILD CHECK** — `npm run build` succeeds (REQUIREMENT 1)
- [ ] **TYPE CHECK** — `npm run typecheck` returns 0 errors (REQUIREMENT 2)
- [ ] **IMPORT CHECK** — All imports resolve correctly (REQUIREMENT 3)
- [ ] **DATABASE CHECK** — `npm run db:push` succeeds (REQUIREMENT 4)
- [ ] **DBAL CHECK** — DBAL compiles to dist/ (REQUIREMENT 5)
- [ ] **DOCUMENTATION CHECK** — Commit message and code comments complete (REQUIREMENT 6)
- [ ] **CODE CHECK** — No dead code or stubs (REQUIREMENT 7)
- [ ] **ARCHITECTURE CHECK** — Complies with ARCHITECTURE.md (REQUIREMENT 8)
- [ ] **TEST CHECK** — `npm run test:e2e` and `npm run test:unit` pass

**Standard:** ALL checks must pass. If ANY check fails, the commit is rejected.

---

## ARTICLE III: CURRENT COMPLIANCE STATUS

**Evaluation Date:** January 15, 2026

### Compliance Report

| Requirement | Status | Details |
|-------------|--------|---------|
| 1. Build Compliance | ❌ FAIL | `npm run build` fails |
| 2. Type Safety | ❌ FAIL | 27 TypeScript errors |
| 3. Import Resolution | ❌ FAIL | 27 broken imports in frontend |
| 4. Database Init | ❌ FAIL | No .db file created |
| 5. DBAL Compilation | ❌ FAIL | 16+ compilation errors, missing codegen |
| 6. Documentation | ⚠️ WARN | Insufficient for complex code |
| 7. No Dead Code | ❌ FAIL | 39 stub files, 20+ obsolete wrappers |
| 8. Architecture | ❌ FAIL | Seed/schema at root, multiple DBAL impls |

### Overall Status

**🚨 NON-COMPLIANT**

The codebase fails to meet 7 out of 8 core requirements. Feature development is suspended until core requirements are satisfied.

---

## ARTICLE IV: REMEDIATION PATHWAY

### Phase 0: Architecture Restructure (FIRST)

Execute `ARCHITECTURE_RESTRUCTURE.md`:
1. Move `/seed/` → `/dbal/shared/seeds/`
2. Move `/prisma/` → `/dbal/development/prisma/`
3. Update package.json scripts
4. Update DBAL exports
5. Delete old folders
6. Verify no broken references

**Timeline:** 30-60 minutes
**Mandatory before Phase 1**

### Phase 1: DBAL Compilation Recovery

Execute `CODEBASE_RECOVERY_PLAN.md`:
1. Fix/create codegen script (`gen_types.ts`)
2. Fix 8 TypeScript strict mode violations
3. Compile DBAL to dist/
4. Verify all exports available

**Timeline:** 2-3 hours
**Mandatory before Phase 2**

### Phase 2: Database Initialization

1. Generate Prisma client: `npm run db:generate`
2. Initialize database: `npm run db:push`
3. Verify: `/dbal/development/prisma/dev.db` exists

**Timeline:** 30 minutes

### Phase 3: Frontend Recovery

1. Remove DBAL source from frontend tsconfig
2. Fix Next.js route handler signatures (4 routes)
3. Verify typecheck: 27 errors → 0 errors
4. Verify build: succeeds

**Timeline:** 1-2 hours

### Phase 4: Verification

Run full test suite:
- `npm run build` → ✅ PASS
- `npm run typecheck` → ✅ 0 ERRORS
- `npm run test:unit` → ✅ ALL PASS
- `npm run test:e2e` → ✅ ALL RUN
- `npm run dev` → ✅ STARTS

**Timeline:** 30 minutes

**Total Estimated Effort:** 4-5 hours to full compliance

---

## ARTICLE V: ENFORCEMENT

### Enforcement Mechanism

A pre-commit hook MUST enforce these requirements before code is committed:

```bash
#!/bin/bash

echo "ENFORCEMENT: Verifying code compliance..."

# Requirement 1: Build Compliance
npm run build || { echo "FAIL: Build does not compile"; exit 1; }

# Requirement 2: Type Safety
npm run typecheck || { echo "FAIL: TypeScript errors exist"; exit 1; }

# Requirement 3: Import Resolution (caught by typecheck)
# Already checked above

# Requirement 7: No dead code (lint)
npm run lint || { echo "FAIL: Lint errors detected"; exit 1; }

# All checks passed
echo "PASS: Code is compliant. Commit allowed."
exit 0
```

**This hook is NOT negotiable.**

---

## ARTICLE VI: STANDARDS GOING FORWARD

### Post-Recovery Standards

Once the codebase achieves compliance, all future commits MUST:

1. **Pass all verification checks** (ARTICLE II)
2. **Include complete documentation** (commit message + code comments)
3. **Have zero type errors** (strict mode enabled)
4. **Have zero broken imports** (all modules exist)
5. **Maintain database consistency** (schema + seed aligned)
6. **Comply with architecture** (no duplicate implementations)
7. **Be testable** (include or update tests)
8. **Be reviewable** (understandable in 5 minutes by another engineer)

### Probation Period

After achieving initial compliance, the codebase enters a probation period:

- **Duration:** 30 consecutive commits with zero violations
- **Requirement:** All commits must pass all verification checks
- **Violation:** Any failed check results in immediate revert
- **Post-Probation:** Full feature development can resume

---

## ARTICLE VII: BINDING AUTHORITY

**This specification IS binding.**

This is not guidance. This is not aspirational. This is contractual requirement.

- All developers agree to these terms by committing code
- All code reviewers agree to enforce these terms
- All merged code is warrantied to meet these requirements

**Failure to comply is grounds for:**
- Immediate rejection of commit
- Automatic reversion if merged
- Loss of merge privileges until pattern changes
- Code review assignment until compliant pattern demonstrated

---

## ARTICLE VIII: CHANGE CONTROL

Any modification to this specification requires:
1. Written proposal with justification
2. Approval by all active maintainers
3. Update to this file with dated change record
4. Communication to all contributors

**No unilateral changes permitted.**

---

## SIGNATURES & ACKNOWLEDGMENT

By committing code to MetaBuilder, you acknowledge and agree to:

- ✅ I have read this specification completely
- ✅ I understand these are contractual requirements, not suggestions
- ✅ I agree to comply with all verification checks before committing
- ✅ I agree to maintain these standards in all future contributions
- ✅ I understand non-compliance results in automatic rejection/revert
- ✅ I understand this is binding for all code I contribute

---

## APPENDIX A: QUICK REFERENCE

### Check Before Every Commit

```bash
# 1. Build
npm run build

# 2. Types
npm run typecheck

# 3. Tests
npm run test:unit
npm run test:e2e

# 4. Lint
npm run lint

# If all pass, commit is allowed
```

### Execution Commands

```bash
# Architecture Restructure
# Execute: ARCHITECTURE_RESTRUCTURE.md (30-60 min)

# DBAL Recovery
# Execute: CODEBASE_RECOVERY_PLAN.md (4-5 hours)

# Database Setup
npm run db:generate
npm run db:push

# Verification
npm run dev  # Should start without errors
```

---

## APPENDIX B: DEFINITIONS

- **Build:** The process of compiling TypeScript to JavaScript and generating artifacts
- **Compliance:** Meeting all requirements defined in Articles I-VIII
- **Non-Compliance:** Failing to meet any core requirement
- **Code Review:** Process of verifying compliance before merge
- **Acceptance Criteria:** Objective, measurable standards for each requirement
- **Remediation:** Actions required to bring non-compliant code into compliance
- **Probation:** Period of heightened monitoring following initial compliance achievement

---

**Document Status:** ACTIVE
**Last Updated:** January 15, 2026
**Version:** 1.0
**Authority:** Project Specification
**Binding:** YES

This specification supersedes all prior informal quality guidelines and represents the authoritative standard for MetaBuilder code quality.
