# MetaBuilder Schema Tests

Automated test suite for validating MetaBuilder schemas and ensuring quality.

## Test Scripts

### 1. validate-all.sh
Comprehensive validation of all schemas and examples.

**What it tests:**
- ✅ All schema definition files are valid
- ✅ Example packages validate correctly
- ✅ JSON syntax is correct
- ✅ Required metadata fields are present ($schema, $id, title, description)

**Usage:**
```bash
./validate-all.sh
```

**Output:**
- Green = PASS
- Red = FAIL
- Yellow = SKIPPED/WARNING

### 2. run-tests.sh
Unit test runner for specific test cases defined in test-cases.json.

**What it tests:**
- ✅ Valid data is accepted
- ✅ Invalid data is rejected
- ✅ Edge cases work correctly
- ✅ Deprecated features fail
- ✅ Security defaults are enforced

**Usage:**
```bash
./run-tests.sh           # Run all tests
VERBOSE=1 ./run-tests.sh # Show error details
```

### 3. test-cases.json
Test case definitions covering:
- Entities schema (primary keys, relationships, ACL)
- Validation schema (sanitization, patterns)
- API schema (routes, auth, rate limiting)
- Script schema (functions, visual metadata)
- Types schema (objects, enums, utilities)
- Metadata schema (package info, dependencies)

## Dependencies

**Required:**
- `jq` - JSON processing
- `bash` 4.0+

**For schema validation (choose one):**
- `jsonschema-cli` (recommended): `cargo install jsonschema-cli`
- `ajv-cli`: `npm install -g ajv-cli`

## Running Tests

### Quick Test
```bash
# Run all validation tests
./validate-all.sh
```

### Full Test Suite
```bash
# Run unit tests
./run-tests.sh

# Run both
./validate-all.sh && ./run-tests.sh
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Install dependencies
  run: |
    cargo install jsonschema-cli

- name: Run schema tests
  run: |
    cd schemas/package-schemas/tests
    ./validate-all.sh
    ./run-tests.sh
```

## Test Coverage

### Schemas Tested
- ✅ metadata_schema.json
- ✅ entities_schema.json
- ✅ types_schema.json
- ✅ script_schema.json
- ✅ components_schema.json
- ✅ validation_schema.json
- ✅ styles_schema.json
- ✅ api_schema.json
- ✅ events_schema.json
- ✅ config_schema.json
- ✅ jobs_schema.json
- ✅ permissions_schema.json
- ✅ forms_schema.json
- ✅ migrations_schema.json
- ✅ index_schema.json
- ✅ stdlib_schema.json

### Features Tested
- ✅ Required vs optional fields
- ✅ Type validation
- ✅ Pattern matching (regex)
- ✅ Enum values
- ✅ Version compatibility
- ✅ Deprecated field detection
- ✅ Security defaults (sanitization)
- ✅ Cross-schema references
- ✅ Composite primary keys
- ✅ Relationship definitions
- ✅ Authentication config
- ✅ Visual programming metadata

## Test Results

Expected results when all tests pass:
```
=================================================
Test Summary
=================================================
Total tests:  50+
Passed:       50+
Failed:       0
Skipped:      1

✓ All tests passed!
```

## Adding New Tests

### 1. Add test case to test-cases.json

```json
{
  "testSuites": [
    {
      "name": "My New Tests",
      "schema": "../my_schema.json",
      "tests": [
        {
          "name": "Test description",
          "valid": true,
          "data": {
            "schemaVersion": "2.0.0",
            ...
          }
        },
        {
          "name": "Should reject invalid data",
          "valid": false,
          "data": {
            "badField": "value"
          },
          "expectedError": "required property"
        }
      ]
    }
  ]
}
```

### 2. Run tests
```bash
./run-tests.sh
```

## Troubleshooting

### Tests fail with "validator not found"
```bash
# Install jsonschema-cli
cargo install jsonschema-cli

# Or install ajv-cli
npm install -g ajv-cli
```

### Tests fail with "jq not found"
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Fedora
sudo dnf install jq
```

### Example validation fails
Check:
1. Example files have correct schemaVersion (2.0.0)
2. Referenced types/handlers exist in other schemas
3. No deprecated fields are used (e.g., field.primary)

### Permission denied
```bash
chmod +x validate-all.sh run-tests.sh
```

## Continuous Integration

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

cd schemas/package-schemas/tests
./validate-all.sh

if [ $? -ne 0 ]; then
    echo "Schema validation failed. Commit aborted."
    exit 1
fi
```

### GitHub Actions
```yaml
name: Schema Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: actions-rs/toolchain@v1
      - name: Install jsonschema-cli
        run: cargo install jsonschema-cli
      - name: Run tests
        run: |
          cd schemas/package-schemas/tests
          ./validate-all.sh
          ./run-tests.sh
```

## Test Metrics

Track test coverage over time:
- Total test cases
- Schemas covered
- Pass rate
- Execution time

## Future Improvements

Planned additions:
- [ ] Cross-schema validation tests
- [ ] Performance benchmarks
- [ ] Mutation testing
- [ ] Property-based testing
- [ ] Visual regression tests for schema docs
- [ ] Integration tests with real packages

## Contributing

When adding new schemas or features:
1. Add positive test cases (valid data)
2. Add negative test cases (invalid data)
3. Update test-cases.json
4. Run full test suite
5. Update this README

## Resources

- [JSON Schema Spec](https://json-schema.org/)
- [jsonschema-cli Docs](https://crates.io/crates/jsonschema-cli)
- [AJV Documentation](https://ajv.js.org/)

---

**Last Updated:** 2026-01-01
**Maintained by:** MetaBuilder Team

Generated with Claude Code
