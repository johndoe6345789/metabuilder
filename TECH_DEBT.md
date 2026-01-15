# Tech Debt Tracker

> **For AI Assistants**: This file explicitly defines what needs to be done for each tech debt item. Read the "Bot Instructions" section for each task to understand exactly what's required.

**Current Status**: Phase 2 - 90% Complete. 3 critical items blocking Phase 3.

---

## 📋 Phase 2 Tech Debt (Priority Order)

### TD-1: DBAL Refactoring - Move Database Logic from Frontend to DBAL

**Status**: 🔴 **CRITICAL** - Blocks Phase 3 start

**Problem**: Database logic is scattered:
- Prisma schema at `/prisma/schema.prisma` (should be in DBAL)
- Adapter factory at `/frontends/nextjs/src/lib/dbal-client/adapter/get-adapter.ts` (duplicate code)
- Prisma context at `/frontends/nextjs/src/lib/config/prisma.ts` (should be in DBAL)
- Seeding split between `/seed/`, `/frontends/nextjs/src/lib/seed/`, and code (should be in DBAL)
- Frontend uses raw adapter instead of entity operations

**Impact**: DBAL can't be versioned/deployed independently, code duplication, poor separation of concerns

**Reference Documents**:
- `/DBAL_REFACTOR_PLAN.md` - Architectural overview
- `/TD_1_REFACTORING_GUIDE.md` - ⭐ **Step-by-step execution guide with exact refactoring patterns**

**Bot Instructions**:

**Phase 1 (DBAL Foundation)** - Already Done ✅
1. ✅ Prisma schema moved to `/dbal/development/prisma/schema.prisma`
2. ✅ DBAL owns all Prisma initialization
3. ✅ DBAL exports `getDBALClient()`, `seedDatabase()`, `getPrismaClient()`

**Phase 2 (Frontend Cleanup)** - Ready for execution
1. Read `/TD_1_REFACTORING_GUIDE.md` - Exact refactoring patterns for 100+ files
2. Follow refactoring approach of choice (A: Automated, B: Manual, C: Git-based)
3. Refactor 14 Prisma imports → use `db` from `/lib/db-client.ts`
4. Refactor 110+ getAdapter() calls → use `db.entity.list()` pattern
5. Delete old modules: `/lib/dbal-client/`, `/lib/database-dbal/`, `/lib/config/prisma.ts`
6. Verify with checklist in `/TD_1_REFACTORING_GUIDE.md`

**Phase 3 (Build System)** - Simple configuration updates
1. Update DBAL package.json (if needed)
2. Update TypeScript paths (if needed)
3. Update root package.json (if needed)

**Expected Outcome**:
- ✅ Prisma schema moved to `/dbal/development/prisma/schema.prisma`
- ✅ DBAL owns all Prisma initialization
- ✅ DBAL exports `getDBALClient()`, `seedDatabase()`, `getPrismaClient()`
- ✅ Frontend has single `/frontends/nextjs/src/lib/db-client.ts` integration point
- ✅ All frontend code uses `db.users.list()` pattern, not `adapter.list('User')`
- ✅ Tests pass with new structure
- ✅ Old code deleted (`dbal-client/`, `database-dbal/`, `config/prisma.ts`)

---

### TD-2: Rate Limiting for API Endpoints

**Status**: 🟡 **HIGH** - Needed for production

**Problem**: No rate limiting on `/api/*` endpoints. Bots can enumerate users, brute force, or DoS.

**Impact**: Security vulnerability. Production deployment blocked until implemented.

**Bot Instructions**:
1. Research rate limiting options for Next.js (e.g., `next-rate-limit`, `redis-based`, `in-memory`)
2. Evaluate against requirements:
   - Per-IP limiting (not per-user, since public endpoints)
   - Configurable limits by endpoint
   - Works in development (SQLite) and production (Redis)
   - Graceful failure if Redis unavailable
3. Implement in `/api/middleware.ts` or route handler
4. Add tests in `e2e/rate-limiting.spec.ts`
5. Document in `/docs/API_RATE_LIMITING.md`
6. Update `/ROADMAP.md` to mark as complete

**Expected Outcome**:
- ✅ `GET /api/users` limited to 100 req/min per IP
- ✅ `POST /api/users/login` limited to 5 req/min per IP
- ✅ Exceeding limit returns 429 status
- ✅ Tests verify both pass and rate-limited scenarios

---

### TD-3: OpenAPI/Swagger API Documentation

**Status**: 🟡 **HIGH** - Needed for frontend/API clarity

**Problem**: No API specification. Frontend developers must read code to understand endpoints.

**Impact**: Slow development, inconsistency, hard to maintain.

**Bot Instructions**:
1. Choose OpenAPI generator:
   - Option A: `@ts-rest/open-api` (lightweight, TypeScript-first)
   - Option B: `swagger-jsdoc` (JSDoc-based, intrusive)
   - Option C: Manual YAML at `/openapi.yaml`
   Recommendation: Option A for tight TypeScript integration

2. Generate OpenAPI 3.0 spec from route handlers:
   - Document all GET, POST, PUT, DELETE endpoints in `/api/*`
   - Include request/response schemas
   - Document authentication requirements
   - Mark deprecated endpoints

3. Serve Swagger UI at `/api/docs`

4. Verify spec in `/openapi.yaml` (at root, version-controlled)

5. Add tests to verify:
   - All routes documented
   - Schemas match actual request/response types
   - No breaking changes without major version bump

6. Update AGENTS.md "API Documentation" section with usage

**Expected Outcome**:
- ✅ `/api/docs` shows interactive Swagger UI
- ✅ `/openapi.yaml` exists with complete spec
- ✅ All endpoints documented with examples
- ✅ Request/response types auto-generated from TypeScript
- ✅ Frontend can generate client SDK from spec

---

### TD-4: Error Handling Documentation

**Status**: 🟡 **MEDIUM** - Improves developer experience

**Problem**: No centralized docs on error handling patterns. Developers guess.

**Impact**: Inconsistent error responses, hard to debug, poor API contracts.

**Bot Instructions**:
1. Create `/docs/ERROR_HANDLING.md`:
   - Document error response format (should be consistent)
   - List all possible HTTP status codes used
   - Explain retry logic for each error type
   - Show examples of client-side handling

2. Audit all `/api/*` endpoints:
   - Ensure consistent error response format
   - Use correct HTTP status codes (400, 401, 403, 404, 409, 500, etc.)
   - All errors should have `code`, `message`, `details` fields (if applicable)

3. Add error handling test suite (`e2e/error-handling.spec.ts`):
   - Test 404 on missing resource
   - Test 401 on unauthorized access
   - Test 400 on invalid input
   - Test 500 on server error

4. Document in AGENTS.md under "Error Handling" section

**Expected Outcome**:
- ✅ `/docs/ERROR_HANDLING.md` exists with patterns
- ✅ All errors follow consistent JSON format
- ✅ Tests verify error scenarios
- ✅ Developers know how to handle errors in frontend

---

## 📊 Phase 3+ Tech Debt (Future)

These are planned but blocked until Phase 2 completes:

### TD-5: Rich Form Editors with Nested Object/Array Support
- Implement dynamic form builder
- Support nested objects, arrays, conditional fields
- Use JSON Schema for validation
- Add e2e tests

### TD-6: Bulk Operations (Multi-Select, Bulk Delete, Export)
- Add bulk delete endpoint `/api/[entity]/bulk-delete`
- Add bulk export endpoint `/api/[entity]/export`
- Implement multi-select UI in generic table renderer
- Add tests for bulk operations

### TD-7: Advanced Filtering UI with Visual Builder
- Create visual filter builder component
- Support multiple conditions (AND/OR)
- Persist filters in URL/localStorage
- Add tests

### TD-8: Relationship/Foreign Key Dropdown Selectors
- Auto-generate dropdowns for foreign keys
- Support search/autocomplete for large datasets
- Lazy-load options on demand
- Add tests

### TD-9: God Panel (System Admin Dashboard)
- Create `/admin` page (requires God role)
- Dashboard showing system stats
- User management UI
- Tenant management UI
- Job monitoring
- Error tracking

### TD-10: Workflow Automation UI
- Visual workflow builder
- Trigger selection (API, schedule, manual)
- Action selection (email, webhook, database)
- Condition logic
- Tests

### TD-11: Advanced Authentication (SSO, SAML, OAuth)
- Implement OAuth2 flow
- Add SAML support
- Add SSO configuration
- Tests

### TD-12: C++ DBAL Daemon (Production Security Mode)
- See `/dbal/production/docs/PHASE3_DAEMON.md`
- Requires Phase 2 complete

### TD-13: Multi-Source Package System (NPM, Git, HTTP)
- Load packages from NPM registry
- Load packages from Git repositories
- Load packages from HTTP endpoints
- Verify package signatures
- Tests

---

## ✅ Completed Tech Debt (Phase 0 & 1)

- ✅ Core architecture (Next.js, Prisma, DBAL, Multi-tenant)
- ✅ Authentication & authorization
- ✅ CRUD operations
- ✅ Package system (52 packages)
- ✅ Generic component renderer
- ✅ Infrastructure (Docker, PostgreSQL, Redis, Nginx)
- ✅ Test suite (464 tests)
- ✅ AGENTS.md expanded to cover whole project
- ✅ CLAUDE.md synced with AGENTS.md
- ✅ ROADMAP.md restructured for clarity

---

## 🎯 How Bots Should Use This File

**Start here when assigned tech debt work:**
1. Find the task ID (TD-1, TD-2, etc.)
2. Read the "Bot Instructions" section
3. Follow each step exactly as written
4. Check off each step as completed
5. Verify against any listed "Expected Outcome"
6. Commit with message: `chore: Complete TD-X [task name]`

**For sequential work:**
- Phase 2 tasks (TD-1, TD-2, TD-3, TD-4) must complete in order
- Phase 3+ tasks (TD-5+) are independent but require Phase 2 complete

**Questions?**
- If instructions are ambiguous, ask user before starting
- If you get stuck, check `/CLAUDE.md` for architectural context
- If you need implementation details, check the reference documents

---

## 📝 Adding New Tech Debt

When adding new tech debt items:
1. Use next available ID (TD-14, TD-15, etc.)
2. Include: Status, Problem, Impact, Bot Instructions
3. Link to reference documents where applicable
4. Add to "Phase X Tech Debt" section with correct priority
5. Update this file in git with clear commit message
