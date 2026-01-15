# MetaBuilder Software Design Specification

**Legal and Contractual Form**

⸻

## 1. DEFINITIONS

For purposes of this Design Specification (the "Specification"), the following terms shall have the meanings set forth below:

**1.1 "Software Package"** means MetaBuilder, the complete collection of executable code, source code, configuration files, documentation, interfaces, and related materials described herein.

**1.2 "System"** means the operational environment in which MetaBuilder is installed, executed, or accessed, including but not limited to development environments, test environments, and production deployment environments.

**1.3 "Deliverables"** means all items required to be produced, transferred, or made available pursuant to this Specification, including source code, compiled artifacts, documentation, and test artifacts.

**1.4 "Acceptance Criteria"** means the objective, measurable standards set forth herein by which conformity of MetaBuilder shall be evaluated.

**1.5 "Defect"** means any failure of MetaBuilder to conform materially to this Specification.

**1.6 "Specification Compliance"** means MetaBuilder demonstrates full conformity with all requirements enumerated in this Specification through verifiable, reproducible testing.

⸻

## 2. PURPOSE AND SCOPE

**2.1** The purpose of this Specification is to define, in precise and binding terms, the functional, non-functional, architectural, and operational requirements of MetaBuilder.

**2.2** This Specification shall govern the design, development, implementation, testing, delivery, and maintenance of MetaBuilder.

**2.3** Any functionality, behavior, or characteristic not expressly described herein shall be deemed out of scope, unless subsequently agreed in writing by all Parties.

**2.4** This Specification constitutes a binding contract and supersedes all prior understandings, documentation, or assumptions regarding MetaBuilder's design and behavior.

⸻

## 3. GENERAL DESIGN REQUIREMENTS

**3.1** MetaBuilder shall be designed in accordance with commercially reasonable software engineering standards prevailing at the time of development, specifically:
- Deterministic execution (no race conditions, no uncontrolled state)
- Modular architecture with clear component boundaries
- Explicit over implicit configuration
- Documented behavior

**3.2** MetaBuilder shall be modular, maintainable, and extensible without requiring material refactoring of existing components.

**3.3** MetaBuilder shall not include:
- Undocumented features
- Hidden logic or side effects
- Intentionally obfuscated code
- Dead code or unused implementations
- Broken or non-functional code paths

**3.4** All components shall operate deterministically under identical inputs and environmental conditions, except where nondeterminism is expressly specified in this Specification.

**3.5** All code shall be buildable, compilable, and testable without errors or warnings that prevent successful compilation.

**3.6** No component shall reference, depend upon, or require code that does not exist, cannot be compiled, or is marked as incomplete or experimental.

⸻

## 4. FUNCTIONAL REQUIREMENTS

**4.1 Core Data-Driven Architecture**

MetaBuilder shall implement the following architectural pattern:
```
Browser URL → Database Query → JSON Component → Generic Renderer → React → User
```

**4.1.1** Routes shall be stored in the `PageConfig` database table, not hardcoded in application code.

**4.1.2** Components shall be defined as JSON definitions in packages, not imported directly as React components.

**4.1.3** All database access shall flow through the DBAL (Database Abstraction Layer), not through direct Prisma calls or other adapters.

**4.2 DBAL (Database Abstraction Layer) Requirements**

MetaBuilder shall provide a single, unified DBAL client:

**4.2.1** DBAL Exports: The DBAL package (`@metabuilder/dbal`) shall export:
- `getDBALClient()` - factory for creating DBALClient instances
- `useDBAL()` - alias for getDBALClient for React contexts
- `seedDatabase(db: DBALClient)` - seed orchestration function
- `getPrismaClient()` - access to underlying Prisma (if needed)
- All entity operation types (users, pageConfigs, sessions, packages, etc.)

**4.2.2** DBAL Compilation: The TypeScript DBAL at `/dbal/development/` shall:
- Compile without errors or warnings
- Generate `types.generated.ts` successfully via codegen
- Output compiled code to `/dbal/development/dist/`
- Export all types and functions from `dist/index.js`

**4.2.3** DBAL Entity Operations: The DBALClient shall provide type-safe operations for all entities:
- `db.users.list()`, `findOne()`, `create()`, `update()`, `delete()`
- `db.pageConfigs.list()`, `findOne()`, `create()`, `update()`, `delete()`
- `db.sessions.list()`, `findOne()`, `create()`
- `db.packages.list()`, `findOne()`
- All operations shall validate input against YAML schemas
- All operations shall enforce ACL (Access Control List) rules

**4.2.4** DBAL shall be the sole authoritative database interface. No other database access patterns are permitted (no direct Prisma, no raw adapters, no custom queries).

**4.3 Frontend Integration**

**4.3.1** The Next.js frontend shall import DBAL from `@/dbal`:
```typescript
import { getDBALClient } from '@/dbal'
const db = getDBALClient()
```

**4.3.2** All database operations in the frontend shall use DBALClient entity methods, not:
- Direct Prisma calls
- Old `getAdapter()` function
- Custom adapter wrappers
- Database-dbal helper functions

**4.3.3** The frontend shall have a single unified integration point at `/frontends/nextjs/src/lib/db-client.ts` that exports:
```typescript
export const db: DBALClient  // Singleton instance
export function getDB(): DBALClient  // Factory function
export type { DBALClient }
```

**4.3.4** All code in `/frontends/nextjs/src/lib/` that performs database operations shall import from `@/lib/db-client`, not from any other database integration.

**4.4 Each Functional Capability shall**:
- Accept inputs strictly within defined parameters
- Produce outputs consistent with documented formats
- Fail gracefully upon invalid input or environmental fault
- Log failures with sufficient context for debugging

**4.5 API Contract**

**4.5.1** All programmatic interfaces shall be:
- Versioned (major.minor.patch)
- Documented with clear input/output specifications
- Backward-compatible within a major version
- Type-safe (TypeScript types provided)

**4.6 User-Facing Functionality**

**4.6.1** Behavior shall be consistent across all supported platforms and environments (development, test, production).

**4.6.2** All user-facing operations shall complete within defined time limits.

⸻

## 5. NON-FUNCTIONAL REQUIREMENTS

**5.1 Buildability**

MetaBuilder shall meet the following build requirements:

**5.1.1** The command `npm run build` shall complete successfully without errors or warnings.

**5.1.2** The command `npm run typecheck` shall complete with zero type errors.

**5.1.3** The command `npm run lint` shall report zero critical violations.

**5.1.4** Intermediate build steps shall be reproducible:
- `npm --prefix dbal/development run build` shall succeed
- `npm run db:generate` shall succeed
- `npm run db:push` shall succeed

**5.2 Runtime Operations**

**5.2.1** The command `npm run dev` shall start the development server without errors.

**5.2.2** The command `npm run test:e2e` shall execute without database connection errors or import failures.

**5.2.3** All operational commands shall be documented in the root `package.json` scripts section.

**5.3 Database**

**5.3.1** The database schema shall be defined in a single authoritative location: `/prisma/schema.prisma`.

**5.3.2** When `npm run db:push` is executed, a valid SQLite database file shall be created at `/prisma/dev.db`.

**5.3.3** The database schema shall be generated from YAML source files in `/dbal/shared/api/schema/entities/` using automated code generation.

**5.3.4** All database operations shall enforce multi-tenant isolation by filtering on `tenantId`.

**5.4 Performance**

MetaBuilder shall meet the following performance characteristics:

**5.4.1** Response times shall be within defined thresholds under nominal load (to be specified in operational documentation).

**5.4.2** Degradation under stress shall be predictable (no uncontrolled resource exhaustion).

**5.4.3** No operation shall cause infinite loops, memory leaks, or hung processes under normal usage.

**5.5 Reliability**

MetaBuilder shall:

**5.5.1** Recover automatically from non-fatal errors where feasible.

**5.5.2** Log failures in a reproducible and auditable manner.

**5.5.3** Not have single points of failure, or explicitly document where they exist.

**5.5.4** Handle edge cases gracefully (empty results, missing records, permission denial).

**5.6 Security**

MetaBuilder shall:

**5.6.1** Enforce authentication and authorization controls where applicable.

**5.6.2** Protect data in transit and at rest using industry-standard mechanisms.

**5.6.3** Not intentionally expose vulnerabilities, backdoors, or insecure defaults.

**5.6.4** Validate all user inputs before processing.

**5.6.5** Enforce ACL rules at the DBAL layer for all entity operations.

⸻

## 6. ARCHITECTURE AND DESIGN CONSTRAINTS

**6.1** MetaBuilder shall be structured into discrete components with clearly defined responsibilities:
- DBAL layer (`/dbal/development/`)
- Frontend layer (`/frontends/nextjs/`)
- Package system (`/packages/`)
- Seed data (`/seed/`)

**6.2** Inter-component communication shall occur only through documented interfaces.

**6.3** MetaBuilder shall not depend upon proprietary or third-party components except those expressly identified and approved in `package.json`.

**6.4** All dependencies shall be:
- Declared in `package.json`
- Version-pinned (not floating versions)
- Reproducible across environments
- Documented in technical documentation

**6.5** There shall be one and only one DBAL client implementation. No duplicate, alternative, or experimental implementations are permitted in the codebase.

**6.6** Code Consolidation: The following shall be eliminated or consolidated:
- `/frontends/nextjs/src/lib/dbal-client/` - old adapter wrapper (DELETE)
- `/frontends/nextjs/src/lib/database-dbal/` - alternative wrapper (DELETE)
- `/frontends/nextjs/src/lib/dbal/` - stub implementations (DELETE or complete)
- `/frontends/nextjs/src/lib/db/core/dbal-client/` - integration stubs (DELETE)
- All imports of `getAdapter()` from old locations (REPLACE with `@/dbal` imports)
- All imports of `prisma` from `@/lib/config/prisma` (REPLACE with `@/dbal`)

**6.7** Path Resolution: TypeScript path aliases shall resolve correctly:
- `@/dbal` → `../../node_modules/@metabuilder/dbal` (npm package)
- `@/*` → `./src/*` (local files)
- No circular references or ambiguous paths

⸻

## 7. DATA MANAGEMENT

**7.1** MetaBuilder shall process data solely for its intended operational purpose.

**7.2** Data storage formats shall be:
- Documented and stable across minor revisions
- Compliant with the Prisma schema
- Validated against YAML entity schemas

**7.3** MetaBuilder shall not:
- Delete, alter, or transmit data except as explicitly required for correct operation
- Store data outside the primary database
- Expose database credentials in logs or error messages

**7.4** Database Schema Authority: The single source of truth for database schema is `/dbal/shared/api/schema/entities/` (YAML files). The Prisma schema at `/prisma/schema.prisma` shall be auto-generated from YAML.

**7.5** Seed Data: The single source of truth for seed data is `/seed/` (YAML and JSON files). Seed data shall never be hardcoded in application code.

⸻

## 8. TESTING AND VERIFICATION

**8.1** MetaBuilder shall be subject to automated and manual testing sufficient to demonstrate compliance with this Specification.

**8.2** Test Coverage Requirements:

**8.2.1** Unit Testing:
- Core logic shall have unit test coverage
- Framework: Vitest
- Command: `npm run test:unit`
- Result: All tests shall pass

**8.2.2** Integration Testing:
- Component boundaries shall be tested
- Database operations shall be tested
- Package system shall be tested
- Included in E2E test suite

**8.2.3** End-to-End Testing:
- Real browser automation using Playwright
- All major workflows shall have E2E coverage
- Command: `npm run test:e2e`
- Result: All tests shall pass without errors

**8.2.4** Type Checking:
- TypeScript compiler shall report zero errors
- Command: `npm run typecheck`
- Result: Zero type errors

**8.3** Acceptance Testing: The following acceptance criteria must pass:

**8.3.1 Build Acceptance**:
```bash
npm run build              # Must succeed
npm run typecheck          # Must have zero errors
npm run lint               # Must have zero critical errors
```

**8.3.2 Runtime Acceptance**:
```bash
npm run dev                # Must start without errors
npm run test:e2e           # Must complete without errors
npm run test:unit          # Must pass all tests
```

**8.3.3 Database Acceptance**:
```bash
npm run db:generate        # Must succeed
npm run db:push            # Must create database
ls /prisma/dev.db          # Must exist
```

**8.3.4 DBAL Acceptance**:
```bash
npm --prefix dbal/development run build  # Must succeed
ls /dbal/development/dist/index.js       # Must exist
npm --prefix dbal/development run test   # Must pass
```

**8.4** Test artifacts shall be retained and made available upon reasonable request.

⸻

## 9. DELIVERY AND DOCUMENTATION

**9.1** Deliverables shall include:

**9.1.1** Source Code:
- All source code in `/dbal/`, `/frontends/`, `/packages/`, `/seed/`
- Build configuration files
- Test files and test data

**9.1.2** Build Artifacts:
- Compiled DBAL at `/dbal/development/dist/`
- Node modules and dependencies
- Database schema

**9.1.3** Documentation:
- This CONTRACT.md (design specification)
- README.md (project overview)
- CLAUDE.md (development instructions)
- AGENTS.md (AI assistant guidelines)
- ARCHITECTURE.md (system design)
- CODEBASE_RECOVERY_PLAN.md (recovery steps)
- API documentation (OpenAPI/Swagger - in progress)

**9.2** Documentation Requirements:

**9.2.1** Documentation shall be:
- Accurate and current
- Consistent with the delivered code
- Sufficient for competent operation and maintenance
- Updated whenever code behavior changes

**9.2.2** Documentation shall include:
- Architecture diagrams
- API specifications
- Configuration options
- Operational procedures
- Troubleshooting guides

**9.3** Codebase State: The codebase shall be in a documented, known state:
- No broken imports
- No dead code
- No experimental branches mixed with stable code
- All code either functional or explicitly marked as "WIP" with recovery plan

⸻

## 10. ACCEPTANCE CRITERIA

**10.1** MetaBuilder shall be deemed Accepted only upon demonstrable compliance with all Acceptance Criteria enumerated in Section 8.3.

**10.2** Failure to meet any material requirement of this Specification shall constitute grounds for rejection.

**10.3** The codebase must achieve the following state before any feature work or refactoring can proceed:

```
REQUIRED STATE:
✅ npm run build succeeds
✅ npm run typecheck returns zero errors
✅ npm run dev starts without errors
✅ npm run test:e2e runs without import/DB errors
✅ npm run test:unit passes all tests
✅ DBAL compiles to dist/ successfully
✅ Database can be initialized and seeded
✅ All DBAL exports accessible from @/dbal
✅ Zero references to old getAdapter() pattern
✅ Zero dead/broken code in codebase
```

**10.4** Current Status Assessment:

As of January 15, 2026:
- ❌ npm run build - FAILS
- ❌ npm run typecheck - FAILS (27 errors)
- ❌ npm run dev - FAILS
- ❌ npm run test:e2e - FAILS
- ❌ DBAL build - FAILS (16+ errors)
- ❌ Database - NOT INITIALIZED
- ❌ ACCEPTANCE CRITERIA - NOT MET

**10.5** Recovery Plan: See `CODEBASE_RECOVERY_PLAN.md` for detailed steps to achieve Acceptance.

⸻

## 11. CHANGE CONTROL

**11.1** No modification to this Specification shall be valid unless made in writing and executed by authorized representatives of all Parties.

**11.2** Any approved change shall be incorporated into a revised version of this CONTRACT.md with updated date and version number.

**11.3** Changes shall be tracked in git commit history with clear reference to the change request.

⸻

## 12. GOVERNING INTERPRETATION

**12.1** In the event of ambiguity or conflict, this Specification shall be interpreted to favor:
- **Determinism over flexibility** - predictable behavior
- **Explicit requirements over implied behavior** - no assumptions
- **Written terms over inferred intent** - what is stated, not what is assumed
- **Functional code over theoretical architecture** - code that runs matters more than perfect design
- **Measurable criteria over subjective assessment** - pass/fail tests, not "probably works"

**12.2** All decisions regarding MetaBuilder's direction shall be made in accordance with this Specification.

**12.3** If existing code violates this Specification, the Specification takes precedence, and the code must be corrected.

⸻

## 13. EFFECTIVE DATE AND SIGNATURES

**Effective Date:** January 15, 2026

**Status:** MetaBuilder does NOT currently comply with this Specification.

**Next Actions:**
1. Execute CODEBASE_RECOVERY_PLAN.md to achieve compliance
2. Verify all Acceptance Criteria in Section 8.3 and 10.3
3. Upon compliance, this Specification becomes the binding standard for all future development

⸻

**ACKNOWLEDGMENT**: By proceeding with development and deployment of MetaBuilder, all parties agree to comply with this Design Specification as if it were a binding legal contract.

No code shall be committed, deployed, or considered "complete" unless it meets all requirements enumerated herein.
