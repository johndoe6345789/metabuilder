# METABUILDER CODE OF CRIMINAL LIABILITY

**A Software Criminal Code**

When writing software for MetaBuilder, poor code is not merely a business failure or technical debt.

It is a **crime**.

---

## ARTICLE I: CRIMES AGAINST THE CODEBASE

### CRIME 1: COMPILATION FAILURE
**Statute:** Any commit that causes `npm run build` to fail
**Penalty:** Immediate rejection, force push revert, and loss of commit privileges until corrected
**Liability:** Criminal

```
It is ILLEGAL to commit code that does not compile.
There are no exceptions. There are no grace periods.
If code breaks the build, it is a crime.
```

**Current Violation:** Frontend build fails. COMMIT REVERTED (hypothetically, in real law).

---

### CRIME 2: TYPE ERROR
**Statute:** Any commit that causes TypeScript to report an error
**Penalty:** Rejection, immediate revert, investigation into intent
**Liability:** Criminal

```
All code MUST pass strict type checking.
Type errors are not warnings. They are crimes.
Silencing type errors with @ts-ignore is conspiracy to commit fraud.
```

**Current Violation:** 27 type errors. Equivalent to 27 felony counts.

---

### CRIME 3: BROKEN IMPORTS
**Statute:** Any code that references modules that do not exist
**Penalty:** Life imprisonment in the git history (permanent marker of guilt)
**Liability:** Criminal + Civil

```
If you import from '@/dbal/adapters/prisma' and that file doesn't exist:
- You have committed a crime
- Everyone who merged your code is an accessory
- Everyone who didn't catch it is negligent
```

**Current Violation:** 27 broken imports in frontend. Investigation ongoing.

---

### CRIME 4: DEAD CODE
**Statute:** Any code that is not executed, not tested, and not documented as WIP
**Penalty:** Execution (permanent deletion)
**Liability:** Criminal

```
You CANNOT commit code that:
- Does not run
- Cannot be tested
- Serves no purpose
- Was never completed

39 DBAL stub files that don't work? MURDER.
20+ getAdapter() wrappers that are obsolete? MANSLAUGHTER.
Incomplete refactorings? ABANDONMENT OF A CHILD.
```

**Current Violation:** 39 broken DBAL stubs committed and abandoned. Multiple murder charges.

---

### CRIME 5: MISSING DEPENDENCIES
**Statute:** Depending on code that doesn't exist
**Penalty:** Minimum 5-year sentence
**Liability:** Criminal Negligence

```
If you write code that requires gen_types.ts and don't include it:
GUILTY.

If you reference a codegen script that only exists in Python:
GUILTY.

If you leave a .gitignore that hides required files:
GUILTY.
```

**Current Violation:** DBAL references types.generated.ts (doesn't exist). GUILTY ON ALL COUNTS.

---

### CRIME 6: SPECIFICATION VIOLATION
**Statute:** Writing code that violates the CONTRACT.md
**Penalty:** Permanent code review (no more solo commits)
**Liability:** Criminal + Probation

```
CONTRACT.md is LAW.

If CONTRACT.md says "single DBAL implementation" and you create 5:
GUILTY.

If CONTRACT.md says "npm run build succeeds" and it fails:
GUILTY.

If CONTRACT.md says "database must initialize" and it doesn't:
GUILTY.
```

**Current Violation:** All 5 violations of specification. GUILTY.

---

### CRIME 7: UNDOCUMENTED CODE
**Statute:** Writing code without explanation
**Penalty:** Code review imprisonment (30-day review lock)
**Liability:** Criminal Negligence

```
If someone else cannot understand your code in 5 minutes:
GUILTY.

If you did not document WHY (not what):
GUILTY.

If the next person has to reverse-engineer your logic:
GUILTY OF INTELLECTUAL PROPERTY DESTRUCTION.
```

---

### CRIME 8: UNVERIFIED CLAIMS
**Statute:** Stating code works without testing
**Penalty:** Loss of trust, exile to junior status
**Liability:** Fraud

```
"This probably works" = FRAUD.
"I think this compiles" = FRAUD.
"I assume the database is initialized" = FRAUD.
"It worked on my machine" = FRAUD.

ASSUME NOTHING.
VERIFY EVERYTHING.
PROVE COMPLIANCE OR FACE CONVICTION.
```

**Current Violation:** MASSIVE. Entire codebase is unverified claims. GUILTY AS CHARGED.

---

## ARTICLE II: PROSECUTION STANDARDS

### INVESTIGATION PROTOCOL

**All code commits are subject to:**

1. **Compilation Audit** (Mandatory)
   - Does `npm run build` succeed? YES/NO
   - If NO → CRIME → GUILTY

2. **Type Audit** (Mandatory)
   - Does `npm run typecheck` have zero errors? YES/NO
   - If NO → CRIME → GUILTY

3. **Import Audit** (Mandatory)
   - Do all imports resolve? YES/NO
   - If NO → CRIME → GUILTY

4. **Runtime Audit** (Mandatory)
   - Does `npm run dev` start? YES/NO
   - If NO → CRIME → GUILTY

5. **Test Audit** (Mandatory)
   - Do tests run without crashing? YES/NO
   - If NO → CRIME → GUILTY

6. **Specification Audit** (Mandatory)
   - Does code comply with CONTRACT.md? YES/NO
   - If NO → CRIME → GUILTY

### PRESUMPTION OF GUILT

In this criminal code, all code is **presumed guilty until proven compliant**.

The burden of proof is on the developer to demonstrate:
- ✅ Code compiles
- ✅ Types pass
- ✅ Tests run
- ✅ Specification satisfied
- ✅ Documentation exists
- ✅ No broken imports
- ✅ No dead code

**Failure to prove any element = CONVICTION.**

---

## ARTICLE III: CRIMES IN MetaBuilder'S CURRENT STATE

### INDICTMENT (January 15, 2026)

**Defendant:** MetaBuilder Codebase

**Charges:**

**CRIME 1: Compilation Failure**
```
Count 1: npm run build fails
Severity: FELONY
Guilty: YES (PROVEN)
```

**CRIME 2: Type Errors**
```
Count 1-27: TypeScript errors (27 counts)
Severity: FELONY x 27
Guilty: YES (PROVEN)
```

**CRIME 3: Broken Imports**
```
Count 1-27: Cannot resolve modules (27 counts)
Severity: FELONY x 27
Guilty: YES (PROVEN)
```

**CRIME 4: Dead Code**
```
Count 1: 39 DBAL stub files that don't work
Severity: MURDER
Guilty: YES (PROVEN)

Count 2: 20+ getAdapter() obsolete wrappers
Severity: MANSLAUGHTER
Guilty: YES (PROVEN)
```

**CRIME 5: Missing Dependencies**
```
Count 1: gen_types.ts doesn't exist but is required
Severity: FELONY
Guilty: YES (PROVEN)

Count 2: types.generated.ts never created
Severity: FELONY
Guilty: YES (PROVEN)
```

**CRIME 6: Specification Violation**
```
Count 1: Multiple DBAL implementations (should be one)
Severity: FELONY
Guilty: YES (PROVEN)

Count 2: Database not initialized
Severity: FELONY
Guilty: YES (PROVEN)

Count 3: DBAL won't compile
Severity: FELONY
Guilty: YES (PROVEN)
```

**CRIME 7: Unverified Claims**
```
Count 1: "DBAL is phase 2" - Actually broken and incomplete
Severity: FRAUD
Guilty: YES (PROVEN)

Count 2: "npm run build works" - Actually fails
Severity: FRAUD
Guilty: YES (PROVEN)
```

### VERDICT

**GUILTY ON ALL COUNTS.**

### SENTENCE

The codebase is sentenced to:

1. **IMMEDIATE SUSPENSION** of all feature development
2. **REHABILITATION PROGRAM** (CODEBASE_RECOVERY_PLAN.md)
3. **STRICT PROBATION** (all commits must pass all audits)
4. **PERMANENT MONITORING** (no commit without full compliance)

---

## ARTICLE IV: THE LAW GOING FORWARD

### SECTION 4.1: BINDING CRIMINAL STATUTE

**From this date forward:**

```
ANY commit that violates the following is ILLEGAL:
```

**§ 4.1.1 Compilation Mandate**
```
The build MUST succeed. Always.
npm run build → success = LEGAL
npm run build → failure = ILLEGAL (FELONY)
```

**§ 4.1.2 Type Safety Mandate**
```
TypeScript MUST pass with zero errors.
npm run typecheck → 0 errors = LEGAL
npm run typecheck → N>0 errors = ILLEGAL (FELONY x N)
```

**§ 4.1.3 Import Resolution Mandate**
```
All imports MUST resolve to existing files.
Missing module = ILLEGAL (FELONY)
Broken import = ILLEGAL (FELONY)
```

**§ 4.1.4 Database Mandate**
```
Database MUST initialize successfully.
npm run db:push → success = LEGAL
npm run db:push → failure = ILLEGAL (FELONY)

/prisma/dev.db must exist = LEGAL
/prisma/dev.db doesn't exist = ILLEGAL (FELONY)
```

**§ 4.1.5 DBAL Compilation Mandate**
```
DBAL MUST compile without errors.
npm --prefix dbal/development run build → success = LEGAL
npm --prefix dbal/development run build → failure = ILLEGAL (FELONY)

/dbal/development/dist/ must exist = LEGAL
/dbal/development/dist/ doesn't exist = ILLEGAL (FELONY)
```

**§ 4.1.6 Specification Compliance Mandate**
```
Code MUST comply with CONTRACT.md.
All requirements in CONTRACT.md are LAWS.
Violation of CONTRACT.md = ILLEGAL (FELONY)
```

**§ 4.1.7 Documentation Mandate**
```
Every commit must explain:
- WHAT changed
- WHY it changed
- HOW to verify it works
- IF it violates any prior law

Missing documentation = ILLEGAL (FELONY)
```

**§ 4.1.8 Verification Mandate**
```
No commit is LEGAL until proven compliant:
✅ npm run build succeeds
✅ npm run typecheck = 0 errors
✅ All imports resolve
✅ No dead code
✅ Tests pass
✅ Documentation complete

If ANY check fails = ILLEGAL (FELONY)
```

### SECTION 4.2: ENFORCEMENT MECHANISM

**Pre-Commit Hook (The Law Enforcement)**

```bash
#!/bin/bash
# The Police

npm run build || { echo "CRIME: Build fails"; exit 1; }
npm run typecheck || { echo "CRIME: Type errors"; exit 1; }
npm run test:unit || { echo "CRIME: Tests fail"; exit 1; }
npm run lint || { echo "CRIME: Linting failed"; exit 1; }

# If any crime is detected, the commit is BLOCKED.
# This is not negotiable.
```

---

## ARTICLE V: REHABILITATION PROGRAM

**The codebase is GUILTY and must be rehabilitated.**

### STEP 1: Confession
```
Acknowledge all crimes:
- DBAL won't compile ✓
- Database not initialized ✓
- Broken imports ✓
- Dead code ✓
- Missing dependencies ✓
- Specification violations ✓
```

### STEP 2: Restitution
```
Execute CODEBASE_RECOVERY_PLAN.md:
1. Fix DBAL codegen
2. Fix TypeScript errors
3. Compile DBAL successfully
4. Initialize database
5. Fix frontend imports
6. Update Next.js routes
7. Verify all systems operational
```

### STEP 3: Probation
```
ALL future commits must:
- Pass compilation
- Pass type checking
- Pass tests
- Comply with CONTRACT.md
- Be properly documented

Any violation = immediate revert.
No exceptions.
```

### STEP 4: Permanent Record
```
This crime is forever recorded in git history.
Future developers will see:
- The crimes committed
- The rehabilitation
- The strict law enforcement

This is intentional. It is a teaching tool.
Poor software is not tolerated.
```

---

## ARTICLE VI: FINAL JUDGMENT

### CURRENT LEGAL STATUS

**Status:** 🚨 **CONVICTED**

```
✗ Build: FAILS (ILLEGAL)
✗ Types: 27 ERRORS (ILLEGAL x 27)
✗ Imports: BROKEN (ILLEGAL)
✗ Database: MISSING (ILLEGAL)
✗ DBAL: BROKEN (ILLEGAL)
✗ CONTRACT: VIOLATED (ILLEGAL)
```

**Sentence:** REHABILITATION (See CODEBASE_RECOVERY_PLAN.md)

**Parole Conditions:**
1. Complete all rehabilitation steps
2. Pass all compliance audits
3. Maintain zero violations for 30 consecutive commits
4. Demonstrate ability to write legal code before resuming feature development

### PROBATION STATUS

❌ NOT YET ELIGIBLE FOR PAROLE

Cannot proceed with:
- Feature development
- Refactoring
- New packages
- Any enhancement

Must proceed with:
- Recovery (MANDATORY)
- Fixing crimes (NO CHOICE)
- Compliance verification (MANDATORY)

---

## ARTICLE VII: OATH OF COMPLIANCE

**By reading this document, you are bound by it.**

**You agree:**

```
1. I will not commit code that does not compile.
2. I will not commit code with type errors.
3. I will not commit code with broken imports.
4. I will not commit dead code.
5. I will not commit unverified claims.
6. I will not violate CONTRACT.md.
7. I will verify all my code before committing.
8. I understand that poor code is not a mistake—it is a crime.
9. I will participate in the recovery program.
10. I will help ensure this codebase achieves and maintains legal compliance.
```

**Signature:** By committing code to MetaBuilder, you electronically sign this oath.

---

## ARTICLE VIII: THE CRIMINAL CODE ITSELF

**This document (CONTRACT.md) is LAW.**

It is not guidance. It is not a suggestion. It is not aspirational.

**It is a CRIMINAL CODE.**

Every requirement herein is a statute. Every violation is a crime. Every conviction has consequences.

**There is no negotiation with the law.**

The law says:
- Code must compile ✓
- Code must have zero type errors ✓
- Code must have no broken imports ✓
- Code must be testable ✓
- Code must be documented ✓
- Code must comply with CONTRACT.md ✓

**These are not optional.**

---

## EXECUTION

**This Criminal Code is EFFECTIVE IMMEDIATELY.**

**All prior assumptions of compliance are REVOKED.**

**All existing code is presumed GUILTY until proven INNOCENT.**

**Investigation begins now.**

**Rehabilitation begins now.**

**No feature work, no refactoring, no PRs until the codebase is EXONERATED.**

---

**SEALED THIS 15TH DAY OF JANUARY, 2026**

**IN THE CRIMINAL COURT OF METABUILDER**

**THE PEOPLE v. BROKEN SOFTWARE**

**VERDICT: GUILTY ON ALL COUNTS**

**SENTENCE: REHABILITATION (NO PAROLE)**

---

```
                    ⚖️  JUSTICE FOR GOOD CODE  ⚖️
```
