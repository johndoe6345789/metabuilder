# Custom Rules Engine Documentation

## Overview

The Custom Rules Engine extends the built-in code quality analyzers with user-defined rules. This allows teams to enforce project-specific code quality standards beyond the default checks.

**Location**: `.quality/custom-rules.json`

## Features

- **Pattern Matching**: Regex-based rule detection
- **Complexity Rules**: Metric-based thresholds (lines, parameters, nesting depth)
- **Naming Conventions**: Enforce naming standards for functions, variables, classes
- **Structure Rules**: File organization and size constraints
- **Severity Levels**: critical, warning, info
- **Score Integration**: Custom violations automatically adjust the overall quality score
- **Enable/Disable**: Individual rule toggle control

## Getting Started

### 1. Create Custom Rules File

Run the initialization command:

```bash
npx quality-validator --init-rules
```

This creates `.quality/custom-rules.json` with sample rules you can customize.

### 2. View Current Rules

List all configured rules:

```bash
npx quality-validator --list-rules
```

### 3. Validate Rules

Check rule syntax before running analysis:

```bash
npx quality-validator --validate-rules
```

## Rule Configuration Format

### Basic Structure

```json
{
  "version": "1.0.0",
  "description": "Custom code quality rules",
  "rules": [
    {
      "id": "rule-id",
      "type": "pattern|complexity|naming|structure",
      "severity": "critical|warning|info",
      "message": "Human-readable violation message",
      "enabled": true
    }
  ]
}
```

### Rule Types

#### Pattern Rules (Regex)

Detect code patterns using regular expressions.

```json
{
  "id": "no-console-logs",
  "type": "pattern",
  "severity": "warning",
  "pattern": "console\\.(log|warn|error)\\s*\\(",
  "message": "Remove console.log statements",
  "enabled": true,
  "fileExtensions": [".ts", ".tsx", ".js", ".jsx"],
  "excludePatterns": ["// console.log", "test", "spec"]
}
```

**Properties**:
- `pattern` (required): Regex pattern to match (uses JavaScript RegExp)
- `fileExtensions` (optional): File types to scan (default: all)
- `excludePatterns` (optional): Patterns to exclude from matching

**Common Examples**:
```json
{
  "id": "no-eval",
  "pattern": "\\beval\\s*\\(",
  "message": "Never use eval()"
}
```

```json
{
  "id": "no-hardcoded-secrets",
  "pattern": "(password|api_key|secret)\\s*[=:]\\s*['\"].*['\"]",
  "message": "Hardcoded secrets detected"
}
```

#### Complexity Rules

Enforce limits on code complexity metrics.

```json
{
  "id": "max-function-lines",
  "type": "complexity",
  "severity": "warning",
  "complexityType": "lines",
  "threshold": 50,
  "message": "Function exceeds 50 lines - consider refactoring",
  "enabled": true
}
```

**Complexity Types**:

- `lines`: Number of lines in a function (default threshold: 50-60)
- `parameters`: Number of function parameters (default threshold: 5-7)
- `nesting`: Maximum nesting depth (default threshold: 3-4)
- `cyclomaticComplexity`: Number of decision points (default threshold: 10-15)

**Examples**:
```json
{
  "id": "max-parameters",
  "complexityType": "parameters",
  "threshold": 5,
  "message": "Functions should have 5 or fewer parameters"
}
```

```json
{
  "id": "max-nesting-depth",
  "complexityType": "nesting",
  "threshold": 3,
  "message": "Excessive nesting - extract to separate function"
}
```

#### Naming Rules

Enforce naming conventions for code identifiers.

```json
{
  "id": "function-naming-convention",
  "type": "naming",
  "severity": "info",
  "nameType": "function",
  "pattern": "^[a-z][a-zA-Z0-9]*$",
  "message": "Function names must be camelCase",
  "enabled": false,
  "excludePatterns": ["React.memo", "export default"]
}
```

**Name Types**:
- `function`: Function declarations and expressions
- `variable`: let/const/var declarations
- `class`: Class declarations
- `constant`: CONSTANT_CASE identifiers
- `interface`: Interface declarations

**Examples**:
```json
{
  "id": "class-naming",
  "nameType": "class",
  "pattern": "^[A-Z][a-zA-Z0-9]*$",
  "message": "Classes should use PascalCase"
}
```

```json
{
  "id": "constant-naming",
  "nameType": "constant",
  "pattern": "^[A-Z][A-Z0-9_]*$",
  "message": "Constants should use UPPER_SNAKE_CASE"
}
```

#### Structure Rules

Check file organization and size constraints.

```json
{
  "id": "max-file-size",
  "type": "structure",
  "severity": "warning",
  "check": "maxFileSize",
  "threshold": 300,
  "message": "File size exceeds 300KB - consider splitting",
  "enabled": true
}
```

**Check Types**:
- `maxFileSize`: File size in KB (requires `threshold`)
- `missingExports`: Detect files without exports
- `invalidDependency`: Check for disallowed imports
- `orphanedFile`: Find unused files

**Example**:
```json
{
  "id": "large-component",
  "check": "maxFileSize",
  "threshold": 200,
  "message": "Component file exceeds 200KB"
}
```

## Severity Levels

Rules use three severity levels that impact scoring:

| Level | Score Impact | Use Case |
|-------|--------------|----------|
| `critical` | -2 per violation | Major issues, security risks |
| `warning` | -1 per violation | Important code quality issues |
| `info` | -0.5 per violation | Minor improvements, suggestions |

**Scoring Formula**:
```
Total Adjustment = (critical × -2) + (warning × -1) + (info × -0.5)
Maximum Penalty = -10 points
```

## Best Practices

### 1. Start Conservative

Begin with fewer rules and add more gradually:

```json
{
  "rules": [
    {
      "id": "critical-only",
      "type": "pattern",
      "severity": "critical",
      "pattern": "debugger\\s*;",
      "message": "Remove debugger statements",
      "enabled": true
    }
  ]
}
```

### 2. Disable Before Customizing

Disable sample rules that don't apply to your project:

```json
{
  "id": "no-console-logs",
  "enabled": false,
  "message": "We use console.log intentionally"
}
```

### 3. Use Exclude Patterns

Allow exceptions to pattern rules:

```json
{
  "id": "no-console-logs",
  "pattern": "console\\.log",
  "excludePatterns": ["test", "spec", "__mocks__"]
}
```

### 4. Set Realistic Thresholds

Base thresholds on your codebase metrics:

```json
{
  "id": "max-function-lines",
  "complexityType": "lines",
  "threshold": 75,
  "message": "Current average is 70 lines"
}
```

### 5. Document Rule Purpose

Add descriptions for team clarity:

```json
{
  "id": "no-magic-numbers",
  "description": "Magic numbers reduce code clarity and maintainability",
  "message": "Extract magic number to named constant"
}
```

## Integration with Scoring

Custom rule violations are integrated into the overall quality score:

1. **Rule Execution**: All enabled rules run after built-in analyzers
2. **Violation Collection**: Violations are grouped by severity
3. **Score Adjustment**: Total adjustment calculated (max -10 points)
4. **Component Adjustment**: Deduction distributed across all components
5. **Grade Recalculation**: Final grade assigned based on adjusted score

### Example

Initial score: 90 (Grade A)

Rule violations found:
- 1 critical: -2 points
- 2 warnings: -2 points
- Total: -4 points

Adjusted score: 86 (Grade B)

## Advanced Examples

### Complete Configuration

```json
{
  "version": "1.0.0",
  "description": "Production rules for TypeScript project",
  "rules": [
    {
      "id": "no-debugger",
      "type": "pattern",
      "severity": "critical",
      "pattern": "\\bdebugger\\s*;",
      "message": "Remove debugger statements",
      "enabled": true
    },
    {
      "id": "no-console-logs",
      "type": "pattern",
      "severity": "warning",
      "pattern": "console\\.(log|warn|error)\\s*\\(",
      "message": "Remove console output",
      "enabled": true,
      "excludePatterns": ["test", "spec"]
    },
    {
      "id": "max-complexity",
      "type": "complexity",
      "severity": "warning",
      "complexityType": "cyclomaticComplexity",
      "threshold": 10,
      "message": "Function too complex - refactor",
      "enabled": true
    },
    {
      "id": "max-file-size",
      "type": "structure",
      "severity": "warning",
      "check": "maxFileSize",
      "threshold": 400,
      "message": "Large file - consider splitting",
      "enabled": true
    },
    {
      "id": "function-naming",
      "type": "naming",
      "severity": "info",
      "nameType": "function",
      "pattern": "^(get|set|is|has|on)[A-Z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*$",
      "message": "Use camelCase for functions",
      "enabled": true
    }
  ]
}
```

### Security-Focused Rules

```json
{
  "rules": [
    {
      "id": "no-secrets",
      "type": "pattern",
      "severity": "critical",
      "pattern": "(api_key|password|secret|token)\\s*[=:]\\s*['\"]",
      "message": "Secrets should not be hardcoded",
      "enabled": true
    },
    {
      "id": "no-eval",
      "type": "pattern",
      "severity": "critical",
      "pattern": "\\beval\\s*\\(",
      "message": "Never use eval() - security risk",
      "enabled": true
    },
    {
      "id": "input-validation",
      "type": "pattern",
      "severity": "warning",
      "pattern": "innerHTML\\s*=",
      "message": "Use textContent instead of innerHTML",
      "enabled": true,
      "excludePatterns": ["test", "sanitize"]
    }
  ]
}
```

### Style & Convention Rules

```json
{
  "rules": [
    {
      "id": "const-not-let",
      "type": "pattern",
      "severity": "info",
      "pattern": "\\blet\\s+\\w+\\s*=",
      "message": "Prefer const over let when not reassigning",
      "enabled": false
    },
    {
      "id": "no-var",
      "type": "pattern",
      "severity": "warning",
      "pattern": "\\bvar\\s+\\w+\\s*=",
      "message": "Use const or let instead of var",
      "enabled": true
    },
    {
      "id": "trailing-commas",
      "type": "pattern",
      "severity": "info",
      "pattern": ",\\s*[}\\]\\)]",
      "message": "Add trailing commas for consistency",
      "enabled": false
    }
  ]
}
```

## Troubleshooting

### Rule Not Triggering

1. **Check pattern**: Test regex at regex101.com
2. **Verify file extensions**: Ensure correct file types included
3. **Check exclude patterns**: Exclude patterns might be too broad
4. **Enable rule**: Verify `enabled: true`

### Too Many Violations

1. **Lower threshold**: Complexity/structure rules
2. **Add excludes**: Exclude test files, mocks
3. **Reduce severity**: Change to `info` level
4. **Disable rule**: Come back when ready

### Performance Issues

1. **Limit patterns**: Complex regex can be slow
2. **Use specific extensions**: Don't scan all files
3. **Reduce rule count**: Disable non-essential rules
4. **Test patterns**: Verify regex efficiency

## Command Reference

```bash
# Initialize sample rules
npx quality-validator --init-rules

# List all rules
npx quality-validator --list-rules

# Validate rules syntax
npx quality-validator --validate-rules

# Run analysis with custom rules
npx quality-validator

# Run with verbose logging
npx quality-validator --verbose
```

## See Also

- [Quality Validator Guide](./QUALITY_VALIDATOR.md)
- [Scoring Algorithm](./SCORING.md)
- [Configuration Reference](./CONFIG_REFERENCE.md)
