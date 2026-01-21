# Custom Rules Engine

A comprehensive rules engine for the Quality Validator that allows users to define custom code quality rules beyond built-in analyzers.

## Architecture

```
Rules Engine System
├── RulesEngine.ts              # Main rules orchestrator
├── RulesLoader.ts              # Rules file loading & validation
├── RulesScoringIntegration.ts  # Score adjustment logic
└── index.ts                    # Public exports
```

### Component Overview

#### RulesEngine

The core engine responsible for:
- Loading rule definitions from configuration files
- Validating rule structure and syntax
- Executing rules against source files
- Collecting and reporting violations
- Calculating score adjustments

**Key Methods**:
```typescript
// Load rules from file
async loadRules(): Promise<boolean>

// Execute all rules against source code
async executeRules(sourceFiles: string[]): Promise<RulesExecutionResult>

// Get loaded rules
getRules(): CustomRule[]

// Get rules by type
getRulesByType(type: RuleType): CustomRule[]

// Validate rule configuration
validateRulesConfig(): { valid: boolean; errors: string[] }
```

#### RulesLoader

Handles rule file management:
- Loading rules from JSON files
- Saving rules to JSON files
- Validating rule configuration
- Creating sample rule files
- Listing rules in human-readable format

**Key Methods**:
```typescript
// Load rules from .quality/custom-rules.json
async loadRulesFromFile(): Promise<CustomRule[]>

// Save rules to file
async saveRulesToFile(rules: CustomRule[]): Promise<boolean>

// Validate rules configuration
validateRulesConfig(rules: CustomRule[]): ValidationResult

// Create sample rules file
async createSampleRulesFile(): Promise<boolean>

// List rules in console
async listRules(): Promise<void>
```

#### RulesScoringIntegration

Integrates rule violations into the scoring system:
- Applies violations to overall score
- Distributes penalty across components
- Recalculates grade based on adjusted score
- Converts violations to findings

**Key Methods**:
```typescript
// Apply rules violations to scoring result
applyRulesToScore(
  scoringResult: ScoringResult,
  rulesResult: RulesExecutionResult
): { result: ScoringResult; integration: RulesScoringResult }

// Update configuration
updateConfig(config: Partial<RulesScoringConfig>): void

// Get current configuration
getConfig(): RulesScoringConfig
```

## Rule Types

### 1. Pattern Rules

Regex-based pattern matching for code patterns.

```typescript
interface PatternRule extends BaseRule {
  type: 'pattern';
  pattern: string;              // Regex pattern
  excludePatterns?: string[];   // Patterns to exclude
  fileExtensions?: string[];    // Files to scan
}
```

**Example**:
```json
{
  "id": "no-console-logs",
  "type": "pattern",
  "pattern": "console\\.(log|warn|error)\\s*\\(",
  "message": "Remove console logs",
  "enabled": true,
  "fileExtensions": [".ts", ".tsx", ".js", ".jsx"],
  "excludePatterns": ["test", "spec"]
}
```

### 2. Complexity Rules

Metric-based thresholds for code complexity.

```typescript
interface ComplexityRule extends BaseRule {
  type: 'complexity';
  complexityType: 'lines' | 'parameters' | 'nesting' | 'cyclomaticComplexity';
  threshold: number;
}
```

**Complexity Types**:
- `lines`: Total lines in function
- `parameters`: Number of function parameters
- `nesting`: Maximum nesting depth
- `cyclomaticComplexity`: Decision point count

### 3. Naming Rules

Enforce naming conventions for identifiers.

```typescript
interface NamingRule extends BaseRule {
  type: 'naming';
  nameType: 'function' | 'variable' | 'class' | 'constant' | 'interface';
  pattern: string;              // Regex for valid names
  excludePatterns?: string[];
}
```

**Example**:
```json
{
  "id": "function-naming",
  "type": "naming",
  "nameType": "function",
  "pattern": "^[a-z][a-zA-Z0-9]*$",
  "message": "Functions must use camelCase"
}
```

### 4. Structure Rules

File organization and size constraints.

```typescript
interface StructureRule extends BaseRule {
  type: 'structure';
  check: 'maxFileSize' | 'missingExports' | 'invalidDependency' | 'orphanedFile';
  threshold?: number;
  config?: Record<string, unknown>;
}
```

## Data Flow

```
1. Load Rules
   ├─ Read .quality/custom-rules.json
   ├─ Parse JSON
   └─ Validate rule structure

2. Execute Rules
   ├─ For each enabled rule:
   │  ├─ Iterate source files
   │  ├─ Apply rule logic
   │  └─ Collect violations
   └─ Aggregate results

3. Calculate Score Impact
   ├─ Count violations by severity
   ├─ Apply penalty weights
   │  ├─ critical: -2 points
   │  ├─ warning: -1 point
   │  └─ info: -0.5 points
   ├─ Cap adjustment at -10 points
   └─ Return total adjustment

4. Update Scoring Result
   ├─ Adjust component scores
   ├─ Recalculate overall score
   ├─ Assign new grade
   ├─ Convert violations to findings
   └─ Return updated result
```

## Configuration File Structure

```json
{
  "version": "1.0.0",
  "description": "Custom code quality rules",
  "rules": [
    {
      "id": "rule-id",
      "type": "pattern|complexity|naming|structure",
      "severity": "critical|warning|info",
      "message": "Human-readable message",
      "enabled": true,
      "description": "Optional explanation"
    }
  ]
}
```

## Scoring Algorithm

### Violation Collection

Rules execute against all source files and collect violations:

```
violations: [
  { ruleId: "no-console", severity: "warning", file: "app.ts", line: 10 },
  { ruleId: "max-lines", severity: "critical", file: "component.tsx", line: 1 },
  ...
]
```

### Score Adjustment Calculation

```typescript
let adjustment = 0;
adjustment += critical_count * -2;      // -2 per critical
adjustment += warning_count * -1;       // -1 per warning
adjustment += info_count * -0.5;        // -0.5 per info

adjustment = Math.max(adjustment, -10); // Cap at -10
```

### Component Score Distribution

Adjustment is distributed proportionally across components:

```typescript
const totalWeight = sum of all component weights;
for each component:
  component.adjustment = adjustment * (component.weight / totalWeight)
  component.adjustedScore = component.score + component.adjustment
```

### Overall Score Recalculation

```typescript
overall = sum of all adjusted weighted scores
```

## Usage Examples

### Basic Setup

```typescript
import { RulesEngine, RulesLoader } from '../rules/index.js';

// Initialize engine
const rulesEngine = new RulesEngine({
  enabled: true,
  rulesFilePath: '.quality/custom-rules.json'
});

// Load rules
await rulesEngine.loadRules();

// Execute rules
const result = await rulesEngine.executeRules(sourceFiles);

console.log(`Found ${result.totalViolations} violations`);
console.log(`Score adjustment: ${result.scoreAdjustment}`);
```

### Integration with Scoring

```typescript
import { RulesScoringIntegration } from '../rules/index.js';

const integration = new RulesScoringIntegration();

// Apply rules violations to score
const { result: adjustedResult, integration: integrationInfo } =
  integration.applyRulesToScore(scoringResult, rulesResult);

console.log(`Original score: ${integrationInfo.originalScore}`);
console.log(`Adjusted score: ${integrationInfo.adjustedScore}`);
console.log(`Adjustment: ${integrationInfo.adjustment}`);
```

### Creating Rules

```typescript
import { RulesLoader } from '../rules/index.js';

const loader = new RulesLoader({
  rulesDirectory: '.quality',
  rulesFileName: 'custom-rules.json'
});

// Create sample rules file
await loader.createSampleRulesFile();

// Load and modify
const rules = await loader.loadRulesFromFile();
rules.push({
  id: 'my-rule',
  type: 'pattern',
  severity: 'warning',
  pattern: 'TODO',
  message: 'Fix TODO',
  enabled: true
});

// Save modified rules
await loader.saveRulesToFile(rules);
```

### Validating Rules

```typescript
const validation = loader.validateRulesConfig(rules);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
} else {
  console.log('Rules are valid!');
}
```

## Performance Considerations

### Rule Execution

- **Parallel Processing**: Rules execute sequentially but file I/O is optimized
- **Pattern Optimization**: Compiled regex patterns are cached
- **Early Exit**: Stop on critical violations if configured
- **Max Violations**: Limit collection to prevent memory issues

### Complexity Calculation

- **Line Counting**: O(n) where n = file lines
- **Nesting Depth**: O(n) single pass through characters
- **Cyclomatic Complexity**: O(n) counting decision keywords
- **Parameter Counting**: O(n) regex matching

### Optimization Tips

1. **Use Specific Patterns**: Narrow regex = faster execution
2. **Limit File Extensions**: Don't scan unnecessary files
3. **Exclude Large Directories**: Skip node_modules, .git, etc.
4. **Disable Unused Rules**: Reduce rule count
5. **Realistic Thresholds**: Avoid too-strict limits

## Testing

Comprehensive test suite covers:

```typescript
// Pattern Rules (6 tests)
- Detect patterns correctly
- Handle exclude patterns
- Respect file extensions

// Complexity Rules (3 tests)
- Detect function length violations
- Calculate cyclomatic complexity
- Measure nesting depth

// Naming Rules (1 test)
- Validate naming conventions

// Structure Rules (1 test)
- Detect oversized files

// Scoring (2 tests)
- Apply violations to score
- Cap adjustments correctly

// Rules Loading (3 tests)
- Load rules from file
- Save rules to file
- Create sample file

// Validation (4 tests)
- Validate correct rules
- Detect duplicate IDs
- Validate regex patterns
- Validate complexity rules

// Integration (3 tests)
- Apply violations to scoring
- Cap adjustment penalties
- Update grades based on score
```

Run tests:
```bash
npm test -- rules-engine.test.ts
```

## Troubleshooting

### Issue: Rules not loading

**Solution**: Check file path and permissions
```bash
ls -l .quality/custom-rules.json
cat .quality/custom-rules.json
```

### Issue: Regex pattern not matching

**Solution**: Test pattern at regex101.com
```javascript
const regex = new RegExp('your-pattern');
console.log(regex.test('test string'));
```

### Issue: Score not changing

**Solution**: Verify rules are enabled
```json
{ "enabled": true }  // Must be true
```

## CLI Commands

```bash
# Initialize sample rules
npx quality-validator --init-rules

# List active rules
npx quality-validator --list-rules

# Validate rule syntax
npx quality-validator --validate-rules

# Run with verbose logging
npx quality-validator --verbose
```

## Related Files

- `.quality/custom-rules.json` - Rule definitions
- `src/lib/quality-validator/scoring/scoringEngine.ts` - Scoring system
- `tests/unit/quality-validator/rules-engine.test.ts` - Test suite
- `docs/CUSTOM_RULES_ENGINE.md` - User documentation

## Future Enhancements

- Rule inheritance and composition
- Conditional rules based on project structure
- Dynamic rule loading from remote sources
- Rule performance profiling
- Visual rule editor UI
- Integration with ESLint/TSLint rules
