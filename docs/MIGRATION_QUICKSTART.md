# JSON Test Migration Quick Start Guide

Fast-track guide to migrating TypeScript tests to JSON format.

**Time estimate**: 10 minutes to understand, 30 minutes to execute migration

## TL;DR (Too Long; Didn't Read)

```bash
# 1. Preview what will change
npx ts-node scripts/migrate-tests/migrator.ts --dry-run --verbose

# 2. Run migration
npx ts-node scripts/migrate-tests/migrator.ts --verbose

# 3. Validate all tests
npx ts-node scripts/migrate-tests/validator.ts packages

# 4. Run tests to verify
npm run test:unified

# 5. Commit changes
git add packages/*/unit-tests/
git commit -m "feat: migrate TypeScript tests to JSON format"
```

Done! ✅

## The What & Why

### Before (TypeScript)
```typescript
describe('Email Validation', () => {
  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
});
```

### After (JSON)
```json
{
  "testSuites": [{
    "name": "Email Validation",
    "tests": [{
      "name": "should accept valid email",
      "act": { "type": "function_call", "target": "validateEmail", "input": "user@example.com" },
      "assert": { "expectations": [{ "type": "truthy" }] }
    }]
  }]
}
```

### Why?
- ✅ No boilerplate
- ✅ Standardized format
- ✅ Admin-modifiable (no rebuilding)
- ✅ Aligns with MetaBuilder's "95% config" philosophy

## Step-by-Step Migration

### Step 1: Backup Current State

```bash
git add .
git commit -m "backup: before test migration to JSON"
git push
```

### Step 2: Preview Migration (Dry Run)

```bash
npx ts-node scripts/migrate-tests/migrator.ts --dry-run --verbose
```

**What you'll see**:
```
╔════════════════════════════════════════════════════════╗
║     TypeScript → JSON Test Migration Tool              ║
╚════════════════════════════════════════════════════════╝

⚠️  DRY RUN MODE - No files will be modified

Found 24 test files

Processing: frontends/nextjs/src/lib/utils/validateEmail.test.ts
Target: packages/nextjs_frontend/unit-tests/tests.json

[DRY RUN] Would convert: frontends/nextjs/src/lib/utils/validateEmail.test.ts
[DRY RUN] → packages/nextjs_frontend/unit-tests/tests.json

...

╔════════════════════════════════════════════════════════╗
║                  Migration Summary                     ║
╠════════════════════════════════════════════════════════╣
║  ✓ Converted: 24                                    ║
║  ✗ Failed:    0                                     ║
║  ⊘ Skipped:   0                                     ║
╚════════════════════════════════════════════════════════╝

This was a DRY RUN. Files were not actually modified.
Run without --dry-run to perform actual migration.
```

**Review the output**:
- Check converted count matches your expectations
- Note any failures (these need manual fixing)
- Verify target directories are correct

### Step 3: Execute Migration

```bash
npx ts-node scripts/migrate-tests/migrator.ts --verbose
```

This actually writes the converted JSON files to:
```
packages/nextjs_frontend/unit-tests/tests.json
packages/cli_frontend/unit-tests/tests.json
packages/qt6_frontend/unit-tests/tests.json
packages/[other]/unit-tests/tests.json
```

### Step 4: Validate All Converted Tests

```bash
npx ts-node scripts/migrate-tests/validator.ts packages
```

**Expected output**:
```
╔════════════════════════════════════════════════════════╗
║           Test JSON Validator                          ║
╚════════════════════════════════════════════════════════╝

Validating all JSON tests in: packages

✓ packages/nextjs_frontend/unit-tests/tests.json
✓ packages/cli_frontend/unit-tests/tests.json
✓ packages/qt6_frontend/unit-tests/tests.json
...

╔════════════════════════════════════════════════════════╗
║                  Validation Summary                    ║
╠════════════════════════════════════════════════════════╣
║  ✓ Valid:   24                                       ║
║  ✗ Invalid: 0                                        ║
╚════════════════════════════════════════════════════════╝
```

**If invalid** (⚠️ unlikely):
1. Check the error message
2. Review the problematic JSON
3. Fix manually (usually missing import or malformed structure)
4. Re-validate

### Step 5: Verify Tests Still Run

```bash
npm run test:unified
```

Or run specific package tests:
```bash
npm run test:unit -- packages/nextjs_frontend
```

### Step 6: Commit Migration Results

```bash
git add packages/*/unit-tests/
git commit -m "feat: migrate TypeScript tests to JSON format

Convert all .test.ts files to declarative JSON format for standardized testing.
- 24 test files converted automatically
- All converted tests validated against schema
- Tests organized in packages/*/unit-tests/tests.json
- Unified test runner discovers and executes all tests

This completes the migration to 100% declarative test architecture."
```

### Step 7: Push to Remote

```bash
git push origin main
```

## What If Something Goes Wrong?

### Issue: "No test files found matching pattern"

**Solution**: Check glob pattern
```bash
# Default pattern: frontends/**/*.test.ts
# Your tests might be in a different location

# Try custom pattern:
npx ts-node scripts/migrate-tests/migrator.ts --pattern 'src/**/*.spec.ts'
```

### Issue: Validation errors after migration

**Possible causes**:
1. Complex test structure (mocking, custom hooks)
2. Missing imports in source file
3. Non-standard matcher names

**Fix**:
```bash
# Check which test has errors
npx ts-node scripts/migrate-tests/validator.ts packages/problematic_package

# Review the JSON file manually
cat packages/problematic_package/unit-tests/tests.json | jq .

# Fix the JSON if needed
# Re-validate
```

### Issue: Tests don't execute after migration

**Solution**:
```bash
# 1. Ensure imports are available at runtime
# Edit the JSON file: add missing imports

# 2. Ensure test file is in correct location
ls packages/*/unit-tests/tests.json

# 3. Run with unified test runner
npm run test:unified -- --verbose

# 4. Check for runtime errors
npm run test:unit 2>&1 | head -50
```

### Issue: "Cannot find module" errors during execution

**Solution**: Imports in JSON are not being resolved

1. Check the import statement in the JSON:
   ```json
   "imports": [
     { "from": "@/lib/utils", "import": ["validateEmail"] }
   ]
   ```

2. Verify the module exists:
   ```bash
   ls frontends/nextjs/src/lib/utils.ts  # or .js
   ```

3. Verify the function is exported:
   ```bash
   grep "export.*validateEmail" frontends/nextjs/src/lib/utils.ts
   ```

4. If not exported, add export or update import in JSON

### Issue: "80% conversion" - some tests need manual fixing

Expected! The migration tool handles ~80% of tests perfectly.

**For the remaining 20%**:
1. Identify problematic tests from migration output
2. Review the generated JSON (it's still usually 90% correct)
3. Manually fix the parts that need adjustment
4. Common issues:
   - Complex mocking setups (manually configure mock behavior)
   - Custom React hooks (add manual fixture setup)
   - Snapshot tests (convert snapshots to assertions)

## Understanding the Generated JSON

### Auto-Generated Test Structure

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "my_package",
  "description": "Converted from validateEmail.test.ts",
  "imports": [
    {
      "from": "@/lib/utils",
      "import": ["validateEmail"]
    }
  ],
  "testSuites": [
    {
      "id": "suite_0",
      "name": "Email Validation",
      "tests": [
        {
          "id": "test_0",
          "name": "should validate email",
          "arrange": {
            "fixtures": {}
          },
          "act": {
            "type": "function_call",
            "target": "validateEmail",
            "input": "user@example.com"
          },
          "assert": {
            "expectations": [
              {
                "type": "truthy",
                "actual": "result",
                "description": "expect().toBe(true)"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Key Sections

**imports**: Functions/modules the tests need
- Auto-extracted from TypeScript imports
- Used by JSON interpreter to load dependencies

**arrange**: Test setup/fixtures
- Auto-populated from local variables in test
- Can be manually enhanced with mocks

**act**: What the test does
- Extracted from function calls
- Can be render, click, fill, or function_call

**assert**: What we expect
- Extracted from expect() statements
- One assertion = one expectation entry

## After Migration

### Team Guidelines

1. **New tests**: Write in JSON format
   - Use `packages/test_example_comprehensive/unit-tests/tests.json` as reference
   - No more .test.ts files!

2. **Test maintenance**: Edit JSON files
   - Much easier to read/modify than TS
   - No need to rebuild or restart

3. **Test validation**: Before commit
   ```bash
   npx ts-node scripts/migrate-tests/validator.ts packages
   ```

4. **Test execution**: Use unified runner
   ```bash
   npm run test:unified
   ```

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit`:
```bash
# Validate all new JSON tests
npx ts-node scripts/migrate-tests/validator.ts packages || exit 1
```

### CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Validate JSON Tests
  run: npx ts-node scripts/migrate-tests/validator.ts packages

- name: Run Unified Tests
  run: npm run test:unified
```

## Common Questions

### Q: Do I need to modify my TypeScript source code?
**A**: No! Migration only affects test files. Source code stays the same.

### Q: What about existing .test.ts files?
**A**: They're converted to JSON and stored in `packages/*/unit-tests/tests.json`. Keep the .test.ts files as reference until you're confident in the migration.

### Q: Can I run TypeScript and JSON tests together?
**A**: No. After migration, run all tests as JSON through the unified runner.

### Q: How do I add a new test after migration?
**A**: Edit the JSON file directly! Add a new test object to the `tests` array.

**Example**:
```json
{
  "id": "test_2",
  "name": "new test I'm adding",
  "arrange": { "fixtures": {} },
  "act": { "type": "function_call", "target": "validateEmail", "input": "new@example.com" },
  "assert": { "expectations": [{ "type": "truthy" }] }
}
```

### Q: What if I make a mistake in the JSON?
**A**: Validator will catch it
```bash
npx ts-node scripts/migrate-tests/validator.ts packages/my_package
```

### Q: Can I convert back to TypeScript?
**A**: Not easily. Keep .test.ts files as reference if you need to revert.

## Rollback (If Needed)

```bash
# If migration didn't go well:
git reset --hard HEAD~1
git push --force origin main
```

But this shouldn't be necessary - the migration is well-tested!

## Success Checklist

After migration, verify:

- ✅ All test files converted
- ✅ All JSON validates
- ✅ All tests execute
- ✅ All tests pass
- ✅ Changes committed
- ✅ Changes pushed
- ✅ CI/CD passes

## Next Steps

1. **Run the migration** (steps above)
2. **Update your team** with new JSON test guidelines
3. **Use `test_example_comprehensive` package** as reference for new tests
4. **Stop creating .test.ts files** - use JSON instead
5. **Enjoy simpler, more maintainable tests!**

---

**Need help?** See:
- `docs/JSON_INTERPRETER_EVERYWHERE.md` - Complete implementation guide
- `scripts/migrate-tests/README.md` - Migration tooling details
- `packages/test_example_comprehensive/README.md` - JSON test reference
- `e2e/test-runner/README.md` - Test runner documentation
