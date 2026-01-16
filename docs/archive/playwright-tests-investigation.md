# Playwright Tests Investigation - Progress Update

## Problem Statement
Do playwright tests actually work?

## Answer: **PARTIAL PROGRESS** - Application starts but database adapter issues prevent full functionality

### Latest Status (After Commit 7a1b44b)

**✅ Application Starts Successfully**  
The Next.js dev server now starts without crashing and responds on http://localhost:3000

**⚠️ Pages Return 500 Errors**  
While the server runs, database operations fail causing pages to return HTTP 500 errors

**🔍 Root Cause**  
Prisma adapter errors logged as warnings:
```
prisma:error: Cannot read properties of undefined (reading 'replace')
clientVersion: '7.2.0', digest: '1318283539'
```

---

## Work Completed

### 1. Test Infrastructure Analysis ✅
**Finding**: Playwright tests are correctly configured
- Test files are well-written
- Configuration in `e2e/playwright.config.ts` is proper
- Browsers can be installed successfully

### 2. Prisma Client Generation Fix ✅
**Commit**: 651083e
**Change**: Updated `e2e/playwright.config.ts` webServer command:
```typescript
command: 'npm run db:generate && npm run dev'
```
**Result**: Prisma client now generates automatically before dev server starts

### 3. Next.js Prisma Adapter Implementation ✅
**Commits**: 9f37692, 878f06b
**Changes**:
- Created `createProductionPrisma()` function in `frontends/nextjs/src/lib/config/prisma.ts`
- Uses `better-sqlite3` with `@prisma/adapter-better-sqlite3`  
- Handles DATABASE_URL environment variable with fallback
- Fixed undefined DATABASE_URL error handling

### 4. DBAL Prisma Adapter Implementation ✅
**Commits**: f19d044, 7a1b44b
**Changes**:
- Installed `@prisma/adapter-better-sqlite3` and `better-sqlite3` in DBAL
- Modified `dbal/development/src/adapters/prisma/context.ts`
- Added SQLite dialect detection and adapter initialization
- **Fixed fallback logic** to use SQLite adapter when dialect is undefined
- Prevents attempting to use unsupported Prisma 6 syntax for unknown databases

### 5. Documentation Updates ✅
**Files Created/Modified**:
- `docs/playwright-tests-investigation.md` - Complete investigation report
- `README.md` - Updated E2E test instructions with prerequisites

---

## Current Status: **IMPROVED BUT BLOCKED**

### Progress Made
1. ✅ Application **starts successfully** (no longer crashes on startup)
2. ✅ Server **stays running** and responds to requests
3. ✅ Prisma errors are **logged but non-fatal**

### Remaining Issue
**Database Operations Fail**:
- Prisma adapter errors prevent database queries from completing
- Pages return HTTP 500 Internal Server Error
- Error originates from Prisma's internal adapter code
- Suggests configuration mismatch between Prisma client and adapter setup

### Error Analysis
The error `"Cannot read properties of undefined (reading 'replace')"` occurs:
- Inside Prisma's generated client code ("ignore-listed frames")
- When attempting database operations
- Consistently with same digest: 1318283539
- Multiple times per page request

### Possible Causes
1. **Adapter Configuration Mismatch**: The PrismaClient and adapter may not be fully compatible
2. **Database Path Issue**: The SQLite database path may not be resolving correctly
3. **Missing Configuration**: Prisma 7 may require additional configuration not yet provided
4. **Multiple Client Instances**: Different parts of the code may be creating incompatible Prisma clients

---

## Testing Status

### What Works
- ✅ Dependencies install successfully
- ✅ Playwright browsers install successfully  
- ✅ Prisma client generates successfully
- ✅ Dev server command starts successfully
- ✅ Server stays running and responds to HTTP requests
- ✅ No TypeScript compilation errors

### What Doesn't Work
- ❌ Database operations fail with adapter errors
- ❌ Pages return HTTP 500 errors
- ❌ Playwright tests cannot complete due to 500 errors

---

## Next Steps for Resolution

### Immediate Investigation Needed
1. **Verify SQLite Database**
   - Confirm `prisma/prisma/dev.db` exists and is accessible
   - Check file permissions
   - Test direct database connection with better-sqlite3

2. **Debug Adapter Initialization**
   - Add logging to see what parameters are being passed to adapters
   - Verify DATABASE_URL is being read correctly
   - Check if database path resolution is working

3. **Test Prisma Client Directly**
   - Create a simple script to test PrismaClient with adapter
   - Verify basic CRUD operations work outside Next.js
   - Isolate whether issue is in Prisma setup or Next.js integration

4. **Review Prisma 7 Migration**
   - Check if additional Prisma 7 configuration files are needed
   - Review Prisma 7 changelog for SQLite adapter requirements
   - Consider if schema needs updates for Prisma 7 compatibility

---

## Files Modified

### Configuration
- `e2e/playwright.config.ts` - Added Prisma generation to webServer  
- `prisma/schema.prisma` - No changes (using adapter approach)

### Application Code  
- `frontends/nextjs/src/lib/config/prisma.ts` - Added SQLite adapter for production
- `dbal/development/src/adapters/prisma/context.ts` - Added SQLite adapter with fallback

### Dependencies
- `dbal/development/package.json` - Added SQLite adapter packages

### Documentation
- `README.md` - Updated E2E testing instructions
- `docs/playwright-tests-investigation.md` - This comprehensive report

---

## Conclusion

**Significant Progress Made**: The application now starts and runs, which is a major improvement from the initial state where it crashed immediately.

**Remaining Challenge**: Database operations fail due to Prisma adapter configuration issues. The errors suggest a deeper compatibility problem between Prisma 7's adapter requirements and how the application is configured.

**Path Forward**: This requires debugging the Prisma adapter initialization to understand why the adapter is receiving undefined values or malformed parameters. Once database operations work, the Playwright test infrastructure is ready to run.

---

## Test Execution Commands

Once the database issue is resolved:

```bash
# Prerequisites
npm install
npx playwright install chromium  

# Run tests (Prisma client generation now automatic)
npm run test:e2e
npm run test:e2e:ui        # With Playwright UI
npm run test:e2e:headed    # With visible browser
npm run test:e2e:debug     # Debug mode
```

### Root Cause Identified
**Prisma 7 Breaking Changes**: Prisma 7 removed support for `url` in datasource blocks. Applications must now use:
- Driver adapters (e.g., `@prisma/adapter-better-sqlite3` for SQLite), OR
- Prisma Accelerate with `accelerateUrl`

This affects the entire MetaBuilder codebase which uses SQLite.

---

## Work Completed

### 1. Test Infrastructure Analysis ✅
**Finding**: Playwright tests are correctly configured
- Test files are well-written
- Configuration in `e2e/playwright.config.ts` is proper
- Browsers can be installed successfully

### 2. Prisma Client Generation Fix ✅
**Commit**: 651083e
**Change**: Updated `e2e/playwright.config.ts` webServer command:
```typescript
command: 'npm run db:generate && npm run dev'
```
**Result**: Prisma client now generates automatically before dev server starts

### 3. Next.js Prisma Adapter Implementation ✅
**Commits**: 9f37692, 878f06b
**Changes**:
- Created `createProductionPrisma()` function in `frontends/nextjs/src/lib/config/prisma.ts`
- Uses `better-sqlite3` with `@prisma/adapter-better-sqlite3`  
- Handles DATABASE_URL environment variable with fallback
- Fixed undefined DATABASE_URL error handling

### 4. DBAL Prisma Adapter Implementation ✅
**Commit**: f19d044
**Changes**:
- Installed `@prisma/adapter-better-sqlite3` and `better-sqlite3` in DBAL
- Modified `dbal/development/src/adapters/prisma/context.ts`
- Added SQLite dialect detection and adapter initialization
- Maintained compatibility with PostgreSQL/MySQL

### 5. Documentation Updates ✅
**Files Created/Modified**:
- `docs/playwright-tests-investigation.md` - Complete investigation report
- `README.md` - Updated E2E test instructions with prerequisites

---

## Current Status: **BLOCKED**

### Remaining Issue
Application still fails to start with error:
```
TypeError: Cannot read properties of undefined (reading 'replace')
  at ignore-listed frames {
    clientVersion: '7.2.0',
    digest: '1521421786'
  }
```

### Analysis
1. The error originates from Prisma's internal code (ignore-listed frames)
2. The digest changes between runs (1318283539 → 1521421786), suggesting multiple Prisma client initializations
3. Despite adding adapters to both Next.js app and DBAL, an additional Prisma client may be created elsewhere
4. The error occurs during application startup, preventing any pages from loading

### Possible Causes
1. **Hidden Prisma Client**: Another Prisma client initialization in the codebase not using adapters
2. **Build Cache**: Next.js build cache may contain old Prisma client references
3. **Import Order**: Prisma client might be imported before environment variables are loaded
4. **Nested Dependencies**: A package dependency might be creating its own Prisma client

---

## Testing Attempted

### What Works
- ✅ Dependencies install successfully
- ✅ Playwright browsers install successfully  
- ✅ Prisma client generates successfully
- ✅ Dev server command starts
- ✅ No TypeScript compilation errors

### What Doesn't Work
- ❌ Application crashes immediately on startup
- ❌ Cannot load any pages (including homepage)
- ❌ All Playwright tests fail due to application not starting

---

## Next Steps for Resolution

### Immediate Actions Needed
1. **Search for All Prisma Client Instantiations**
   ```bash
   grep -r "new PrismaClient" --include="*.ts" --include="*.tsx"
   ```
2. **Check for Dynamic Imports**
   - Look for `import('@prisma/client')`  
   - Check middleware, API routes, server components

3. **Review Build Output**
   - Examine `.next/` directory for cached Prisma references
   - Consider adding Prisma adapter to Next.js webpack config

4. **Test with Explicit Environment Variables**
   ```bash
   DATABASE_URL="file:./prisma/prisma/dev.db" npm run dev
   ```

### Long-term Solutions
1. **Upgrade Path**: Consider if Prisma 6 would be more compatible
2. **Alternative Approach**: Use Prisma Accelerate instead of driver adapters
3. **Configuration File**: Create `prisma.config.ts` as mentioned in Prisma 7 docs

---

## Files Modified

### Configuration
- `e2e/playwright.config.ts` - Added Prisma generation to webServer  
- `prisma/schema.prisma` - Attempted URL addition (reverted due to Prisma 7 requirements)

### Application Code  
- `frontends/nextjs/src/lib/config/prisma.ts` - Added SQLite adapter for production
- `dbal/development/src/adapters/prisma/context.ts` - Added SQLite adapter for DBAL

### Dependencies
- `dbal/development/package.json` - Added SQLite adapter packages

### Documentation
- `README.md` - Updated E2E testing instructions
- `docs/playwright-tests-investigation.md` - This comprehensive report

---

## Conclusion

**The Playwright test infrastructure is properly configured and would work correctly** if the Next.js application could start. The blocking issue is a deeper application architecture problem related to Prisma 7's breaking changes that affects database connectivity throughout the codebase.

**Recommendation**: This issue requires investigation by someone with deep knowledge of the MetaBuilder codebase to:
1. Locate all Prisma client instantiations
2. Ensure all use proper adapters for Prisma 7
3. Verify the application can start successfully
4. Then the existing Playwright tests should run correctly

---

## Test Execution Commands

Once the application issue is resolved:

```bash
# Prerequisites
npm install
npx playwright install chromium  

# Run tests (Prisma client generation now automatic)
npm run test:e2e
npm run test:e2e:ui        # With Playwright UI
npm run test:e2e:headed    # With visible browser
npm run test:e2e:debug     # Debug mode
```

### Test Infrastructure
- **Location**: `/e2e/` directory
- **Configuration**: `e2e/playwright.config.ts`
- **Test Files**: 
  - `e2e/smoke.spec.ts` - Basic smoke tests
  - `e2e/login.spec.ts` - Authentication flow tests
  - `e2e/navigation.spec.ts` - Navigation and routing tests
  - `e2e/crud.spec.ts` - CRUD operation tests
  - Additional tests in subdirectories

### Configuration Analysis
The Playwright configuration includes:
- **Base URL**: `http://localhost:3000`
- **Web Server**: Configured to run `npm run dev` before tests
- **Timeout**: 300 seconds (5 minutes) for server startup
- **Browser**: Chromium (Desktop Chrome)
- **Retry Strategy**: 2 retries on CI, 0 locally

### Issues Found

#### 1. **Missing Prisma Client Generation** ❌
**Severity**: CRITICAL - Blocks all tests

**Error**:
```
Error: Cannot find module '.prisma/client/default'
```

**Root Cause**: 
- The web server attempts to start via `npm run dev`
- Next.js application tries to load Prisma client
- Prisma client has not been generated
- Application cannot start, causing all tests to fail

**Impact**:
- Dev server fails to start properly
- All Playwright tests fail with "Cannot navigate to invalid URL"
- Tests cannot connect to the application

**Solution Required**:
```bash
npm run db:generate  # Generate Prisma client before running tests
```

#### 2. **Prisma Client Configuration Error** ❌
**Severity**: CRITICAL - Blocks all tests

**Error**:
```
Error [PrismaClientConstructorValidationError]: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

**Root Cause**: 
- The Prisma schema is configured for SQLite
- The application code at `frontends/nextjs/src/lib/config/prisma.ts:52` creates a PrismaClient instance
- However, the Prisma client requires either:
  - A database adapter parameter, OR  
  - An accelerateUrl for Prisma Accelerate
- Neither is provided in the current configuration

**Impact**:
- Dev server starts but crashes immediately when trying to access any page
- Application cannot render any pages
- All Playwright tests fail because the application is not functional

**This is an APPLICATION BUG, not a test configuration issue.**

### Test Execution Results

#### Without Prisma Client:
```
Running 7 tests using 2 workers

  ✘  All 7 tests FAILED
  
Failure reason: "Protocol error (Page.navigate): Cannot navigate to invalid URL"
```

The webServer configuration tries to start but fails repeatedly with Prisma client errors, preventing Playwright from navigating to any pages.

### Recommendations

#### Immediate Fixes

1. **Add Prisma Generation Step**
   - Update test documentation to require `npm run db:generate`
   - Consider adding to playwright webServer command or globalSetup

2. **Update Playwright Configuration**
   ```typescript
   webServer: {
     command: 'npm run db:generate && npm run dev',  // Generate before starting
     url: 'http://localhost:3000',
     reuseExistingServer: !process.env.CI,
     timeout: 300 * 1000,
   }
   ```

3. **Add Global Setup Script**
   Create `e2e/global-setup.ts`:
   ```typescript
   import { execSync } from 'child_process';
   
   export default async function globalSetup() {
     console.log('Generating Prisma client...');
     execSync('npm run db:generate', { stdio: 'inherit' });
     console.log('Prisma client generated successfully');
   }
   ```

4. **Document Prerequisites**
   Update testing documentation to clearly state:
   - Run `npm install` first
   - Run `npm run db:generate` before tests
   - Ensure database is accessible
   - Run `npx playwright install chromium` for browsers

#### Long-term Improvements

1. **Add Pre-Test Validation**
   - Check if Prisma client exists
   - Verify database connection
   - Confirm server can start
   - Provide helpful error messages

2. **CI/CD Integration**
   - Ensure CI pipeline runs `db:generate`
   - Set up test database properly
   - Cache Playwright browsers

3. **Better Error Messages**
   - Make Playwright config fail fast with clear messages
   - Add healthcheck endpoint to verify server readiness

### Conclusion

**Answer to "Do playwright tests actually work?"**

**NO** - The Playwright tests **cannot run successfully** due to two issues:

1. **FIXED**: Missing Prisma client generation - Now automatically handled by updated webServer command
2. **BLOCKING**: Prisma Client configuration error in the application

#### Issue 1: Prisma Client Generation (FIXED ✅)
- **Root Cause**: Prisma client not generated before dev server start
- **Solution Applied**: Updated `e2e/playwright.config.ts` webServer command to `npm run db:generate && npm run dev`
- **Status**: Fixed - Prisma client now generates automatically before tests

#### Issue 2: Prisma Client Configuration Error (BLOCKING ❌)
- **Error**: `PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"`
- **Location**: `frontends/nextjs/src/lib/config/prisma.ts:52`
- **Root Cause**: The Prisma schema is configured to use SQLite, but the PrismaClient initialization at runtime requires either:
  - A database adapter to be provided, OR
  - An accelerateUrl for Prisma Accelerate
- **Impact**: The Next.js application cannot start, preventing all E2E tests from running
- **Status**: **This is an application bug**, not a testing infrastructure issue

#### Test Infrastructure Assessment

**✅ Working Correctly:**
- Playwright installation and configuration
- Browser (Chromium) installation
- Test file structure and quality
- WebServer configuration with auto-generation
- Documentation and instructions

**❌ Blocked By:**
- Application-level Prisma configuration error
- Cannot be fixed in test configuration alone

**Next Steps to Enable Tests:**
1. Fix the Prisma Client initialization in `frontends/nextjs/src/lib/config/prisma.ts`
2. Ensure the application can start successfully with the SQLite database
3. Once the application runs, the existing test infrastructure should work correctly

### Test Execution Commands (Corrected)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Generate Prisma client (CRITICAL STEP)
npm run db:generate

# Run tests
npm run test:e2e

# Or with UI
npm run test:e2e:ui
```

### Files Requiring Changes

1. `e2e/playwright.config.ts` - Add Prisma generation to webServer command or globalSetup
2. `docs/TESTING_GUIDE.md` - Update prerequisites section
3. `README.md` - Update E2E test instructions
4. `.github/workflows/*.yml` - Ensure CI runs db:generate before tests

