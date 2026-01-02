# JSON Script Testing Guide

Two testing approaches are supported for JSON scripts:

## 1. Simple Tests (`*.cases.json`)

Test functions from `script.json` with expected outputs.

**Structure**:
- `script.json` - Contains the functions to test
- `*.cases.json` - Contains test cases with inputs and expected outputs

**Example**:
```bash
node test_cli.cjs script.json expressions.cases.json
```

## 2. Parameterized Tests (`.test.logic.json` + `.test.parameters.json`)

Define test logic once, run with many parameter sets.

**Structure**:
- `*.test.logic.json` - Test assertion functions (the test code)
- `*.test.parameters.json` - Input datasets to test with

### Files

#### `math.test.logic.json` - Test Logic

Contains test functions that perform assertions:

```json
{
  "functions": [{
    "name": "test_add",
    "params": [{"name": "testCase", "type": "object"}],
    "body": [
      {
        "type": "const_declaration",
        "name": "actual",
        "value": {
          "type": "binary_expression",
          "left": {"type": "member_access", "object": "$ref:params.testCase", "property": "a"},
          "operator": "+",
          "right": {"type": "member_access", "object": "$ref:params.testCase", "property": "b"}
        }
      },
      {
        "type": "return",
        "value": {
          "type": "object_literal",
          "properties": {
            "passed": {
              "type": "binary_expression",
              "left": "$ref:local.actual",
              "operator": "==",
              "right": {"type": "member_access", "object": "$ref:params.testCase", "property": "expected"}
            },
            "actual": "$ref:local.actual"
          }
        }
      }
    ]
  }]
}
```

#### `math.test.parameters.json` - Test Data

Contains test cases organized by function and category:

```json
{
  "test_add": {
    "positive_numbers": [
      {
        "desc": "Adding two positive numbers",
        "input": {"a": 5, "b": 3, "expected": 8}
      },
      {
        "desc": "Adding zero",
        "input": {"a": 10, "b": 0, "expected": 10}
      }
    ],
    "edge_cases": [
      {
        "desc": "Both zero",
        "input": {"a": 0, "b": 0, "expected": 0}
      }
    ]
  }
}
```

### Running Parameterized Tests

```bash
node test_parameterized_cli.cjs \
  math.test.logic.json \
  math.test.parameters.json
```

### Output

```
============================================================
Parameterized Test Results
============================================================

📦 Function: test_add
   8/8 tests passed

  ✅ positive_numbers (3/3)
      ✓ Adding two positive numbers (1ms)
      ✓ Adding zero (0ms)
      ✓ Large numbers (0ms)

  ✅ edge_cases (2/2)
      ✓ Both zero (0ms)
      ✓ Very large numbers (0ms)

============================================================
Overall: 13/13 tests passed (0 failed)
🎉 All parameterized tests passed!
```

## Test Function Return Format

Test logic functions should return:

```json
{
  "passed": true,      // boolean - did the test pass?
  "actual": 8,         // any - actual result
  "expected": 8        // any - expected result (optional)
}
```

## Examples in This Directory

### Simple Tests
- `expressions.cases.json` - Tests for all expression types
- `statements.cases.json` - Tests for all statement types

### Parameterized Tests
- `math.test.logic.json` + `math.test.parameters.json` - Math operation tests

## Benefits of Parameterized Tests

### ✅ DRY (Don't Repeat Yourself)
Write test logic once, reuse with many inputs

### ✅ Easy to Add Cases
Just add entries to `test.parameters.json`, no code changes needed

### ✅ Organized by Category
Group related test cases (positive_numbers, edge_cases, etc.)

### ✅ Clear Separation
- Logic (assertions) in one file
- Data (test cases) in another

### ✅ Maintainable
Update test logic in one place, affects all test cases

## When to Use Each Approach

### Use Simple Tests When:
- Testing existing functions from `script.json`
- Quick smoke tests
- One-off test cases
- Testing the JSON executor itself

### Use Parameterized Tests When:
- Many similar test cases with different inputs
- Complex validation logic
- Form validation (valid/invalid cases)
- Edge case testing
- Regression test suites

## Creating New Parameterized Tests

1. Create `yourtest.test.logic.json` with test functions:
   ```json
   {
     "functions": [{
       "name": "test_myfunction",
       "params": [{"name": "testCase"}],
       "body": [
         {"type": "return", "value": {"passed": true}}
       ]
     }]
   }
   ```

2. Create `yourtest.test.parameters.json` with test data:
   ```json
   {
     "test_myfunction": {
       "category1": [
         {"desc": "Test case 1", "input": {...}}
       ]
     }
   }
   ```

3. Run the tests:
   ```bash
   node test_parameterized_cli.cjs \
     yourtest.test.logic.json \
     yourtest.test.parameters.json
   ```

## See Also

- [JSON Script Runtime README](../../../shared/seed/scripts/runtime/README.md)
- [JSON Script Specification](../../../shared/seed/SCRIPT_JSON_SPEC_ISSUES.md)
- [json_script_example Package](../README.md)
