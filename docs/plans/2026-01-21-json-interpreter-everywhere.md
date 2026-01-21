# JSON Interpreter Everywhere Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete MetaBuilder's declarative architecture by implementing JSON interpreters for all test types (unit, E2E, Storybook) and styling system, enabling 100% configuration-driven development.

**Architecture:**
- Extend `tests_schema.json` with AAA (Arrange-Act-Assert) pattern and runtime interpretation support
- Extend `styles_schema.json` to support JSON-based style compilation
- Create minimal JSON interpreters for each subsystem (following DBAL codegen pattern: codegen where needed, JSON interpretation elsewhere)
- Build package migration tooling to convert existing TypeScript tests to declarative JSON
- Implement unified test runner that coordinates all three test types

**Tech Stack:**
- JSON Schema (validation layer)
- Node.js + TypeScript (test runner, style compiler)
- Vitest (test execution engine, integrated via JSON interpreter)
- TailwindCSS (web styling interpretation)
- Qt CSS (desktop styling interpretation)

---

## Phase 1: Schema Enhancements & Runtime Support

### Task 1: Enhance tests_schema.json for Component Testing

**Files:**
- Modify: `/schemas/package-schemas/tests_schema.json`
- Reference: `/packages/ui_home/playwright/tests.json` (existing E2E examples)
- Test: Create `/packages/test_example_unit/unit-tests/tests.json` (new example)

**Step 1: Add component testing definitions to tests_schema.json**

In the `definitions` section, add support for React component testing (rendering, interactions, assertions). This extends the existing AAA pattern to include component-specific operations.

Add after line 471 (before final closing brace):

```json
    "componentTest": {
      "type": "object",
      "description": "Component rendering and interaction test",
      "properties": {
        "render": {
          "type": "string",
          "description": "Component ID to render or JSX string"
        },
        "props": {
          "type": "object",
          "description": "Component props",
          "additionalProperties": true
        }
      }
    },
    "assertion": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "description": "Assertion type",
          "enum": [
            "equals",
            "deepEquals",
            "strictEquals",
            "notEquals",
            "greaterThan",
            "lessThan",
            "greaterThanOrEqual",
            "lessThanOrEqual",
            "contains",
            "matches",
            "throws",
            "notThrows",
            "truthy",
            "falsy",
            "null",
            "notNull",
            "undefined",
            "notUndefined",
            "instanceOf",
            "hasProperty",
            "hasLength",
            "toBeVisible",
            "toBeInTheDocument",
            "toHaveTextContent",
            "toHaveAttribute",
            "toHaveClass",
            "custom"
          ]
        },
        "description": {
          "type": "string",
          "description": "Assertion description"
        },
        "actual": {
          "description": "Actual value or CSS selector for DOM queries"
        },
        "expected": {
          "description": "Expected value or DOM element text"
        },
        "selector": {
          "type": "string",
          "description": "CSS selector for DOM query (alternative to actual)"
        },
        "role": {
          "type": "string",
          "description": "ARIA role for query (e.g., 'button', 'link')"
        },
        "text": {
          "type": "string",
          "description": "Text content matcher"
        },
        "message": {
          "type": "string",
          "description": "Custom assertion failure message"
        },
        "negate": {
          "type": "boolean",
          "description": "Negate the assertion",
          "default": false
        }
      }
    }
```

Update the `act` phase to support rendering and interaction:

Replace the `act` object definition (lines 292-323) with:

```json
        "act": {
          "type": "object",
          "description": "Test act phase (execution)",
          "required": ["type"],
          "properties": {
            "when": {
              "type": "string",
              "description": "When action description (BDD style)"
            },
            "type": {
              "type": "string",
              "description": "Action type",
              "enum": [
                "function_call",
                "api_request",
                "event_trigger",
                "render",
                "click",
                "fill",
                "select",
                "hover",
                "focus",
                "blur",
                "waitFor",
                "custom"
              ]
            },
            "target": {
              "type": "string",
              "description": "Function/endpoint/event/selector to test"
            },
            "selector": {
              "type": "string",
              "description": "CSS selector for DOM interaction"
            },
            "role": {
              "type": "string",
              "description": "ARIA role for query (e.g., 'button', 'link')"
            },
            "text": {
              "type": "string",
              "description": "Text content for interaction"
            },
            "input": {
              "description": "Input data/parameters"
            },
            "config": {
              "type": "object",
              "description": "Action-specific configuration",
              "additionalProperties": true
            }
          }
        }
```

**Step 2: Commit schema enhancement**

```bash
git add schemas/package-schemas/tests_schema.json
git commit -m "schema: Enhance tests_schema.json for component and DOM testing"
```

**Step 3: Document schema changes**

Create `/docs/schemas/UNIT_TESTS_JSON_FORMAT.md` (1,000+ words) explaining:
- AAA pattern with examples
- All assertion types (29 total)
- Component rendering syntax
- DOM interaction patterns
- Fixture and mock definitions
- Migration guide from TypeScript

Run:
```bash
touch docs/schemas/UNIT_TESTS_JSON_FORMAT.md
```

**Step 4: Create example unit test package**

Create `/packages/test_example_unit/unit-tests/tests.json` with 5 example tests covering:
- Simple function assertion (equals)
- Component rendering (render + toBeVisible)
- User interaction (click + text assertion)
- Error handling (throws)
- Mocked dependency (returnValue)

Example structure:

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "test_example_unit",
  "description": "Example unit tests showing all JSON test patterns",
  "imports": [
    { "from": "@testing-library/react", "import": ["render", "screen"] },
    { "from": "@/components/Button", "import": ["Button"] }
  ],
  "testSuites": [
    {
      "id": "suite_button",
      "name": "Button Component",
      "tests": [
        {
          "id": "test_renders",
          "name": "should render button with label",
          "arrange": {
            "fixtures": { "label": "Click Me", "variant": "primary" }
          },
          "act": {
            "type": "render",
            "target": "Button",
            "input": "$arrange.fixtures"
          },
          "assert": {
            "expectations": [
              {
                "type": "toBeVisible",
                "text": "Click Me"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

### Task 2: Enhance styles_schema.json for JSON Style Interpretation

**Files:**
- Modify: `/schemas/package-schemas/styles_schema.json`
- Create: `/packages/[package]/seed/styles/tokens.json` (example)
- Create: `/packages/[package]/seed/styles/components.json` (example)

**Step 1: Extend styles_schema.json to support style composition**

Add support for:
- Design tokens (colors, spacing, typography, shadows, borders, transitions)
- Component styles (scoped CSS-in-JSON)
- Responsive variants
- State variants (hover, focus, active, disabled)
- Selector composition

Add after line 200 in styles_schema.json (inside properties):

```json
    "components": {
      "type": "object",
      "description": "Component-scoped style definitions",
      "additionalProperties": {
        "type": "object",
        "description": "Component style definition",
        "properties": {
          "base": {
            "$ref": "#/definitions/styleDefinition",
            "description": "Base component styles"
          },
          "variants": {
            "type": "object",
            "description": "Style variants (size, color, etc.)",
            "additionalProperties": {
              "type": "object",
              "additionalProperties": {
                "$ref": "#/definitions/styleDefinition"
              }
            }
          },
          "states": {
            "type": "object",
            "description": "State-based styles (hover, focus, disabled)",
            "properties": {
              "hover": { "$ref": "#/definitions/styleDefinition" },
              "focus": { "$ref": "#/definitions/styleDefinition" },
              "active": { "$ref": "#/definitions/styleDefinition" },
              "disabled": { "$ref": "#/definitions/styleDefinition" },
              "loading": { "$ref": "#/definitions/styleDefinition" }
            },
            "additionalProperties": {
              "$ref": "#/definitions/styleDefinition"
            }
          },
          "responsive": {
            "type": "object",
            "description": "Responsive breakpoints",
            "properties": {
              "sm": { "$ref": "#/definitions/styleDefinition" },
              "md": { "$ref": "#/definitions/styleDefinition" },
              "lg": { "$ref": "#/definitions/styleDefinition" },
              "xl": { "$ref": "#/definitions/styleDefinition" },
              "xxl": { "$ref": "#/definitions/styleDefinition" }
            },
            "additionalProperties": {
              "$ref": "#/definitions/styleDefinition"
            }
          }
        }
      }
    }
```

Add new definitions section at end (before final closing brace):

```json
  "definitions": {
    "color": { ... (existing) },
    "size": { ... (existing) },
    "styleDefinition": {
      "type": "object",
      "description": "CSS property definitions",
      "properties": {
        "display": { "type": "string", "enum": ["flex", "grid", "block", "inline", "inline-block", "none"] },
        "flexDirection": { "type": "string", "enum": ["row", "column", "row-reverse", "column-reverse"] },
        "justifyContent": { "type": "string" },
        "alignItems": { "type": "string" },
        "gap": { "$ref": "#/definitions/size" },
        "padding": { "$ref": "#/definitions/size" },
        "margin": { "$ref": "#/definitions/size" },
        "width": { "$ref": "#/definitions/size" },
        "height": { "$ref": "#/definitions/size" },
        "minWidth": { "$ref": "#/definitions/size" },
        "minHeight": { "$ref": "#/definitions/size" },
        "maxWidth": { "$ref": "#/definitions/size" },
        "maxHeight": { "$ref": "#/definitions/size" },
        "backgroundColor": { "type": "string", "description": "Color reference or hex" },
        "color": { "type": "string", "description": "Text color reference or hex" },
        "fontSize": { "$ref": "#/definitions/size" },
        "fontWeight": { "type": "string", "enum": ["normal", "bold", "400", "500", "600", "700"] },
        "lineHeight": { "type": "string" },
        "letterSpacing": { "$ref": "#/definitions/size" },
        "borderRadius": { "$ref": "#/definitions/size" },
        "borderWidth": { "$ref": "#/definitions/size" },
        "borderColor": { "type": "string" },
        "borderStyle": { "type": "string", "enum": ["solid", "dashed", "dotted", "double"] },
        "boxShadow": { "type": "string" },
        "opacity": { "type": "number", "minimum": 0, "maximum": 1 },
        "transform": { "type": "string" },
        "transition": { "type": "string" },
        "cursor": { "type": "string" }
      },
      "additionalProperties": true
    }
  }
```

**Step 2: Commit schema enhancement**

```bash
git add schemas/package-schemas/styles_schema.json
git commit -m "schema: Enhance styles_schema.json for component-scoped CSS-in-JSON"
```

**Step 3: Create style interpreter module**

Create `/frontends/nextjs/src/lib/style-compiler/index.ts`:

```typescript
import { StyleDefinition, StylesConfig } from '@/types/styles';

/**
 * Minimal JSON style interpreter
 * Converts JSON style definitions to CSS-in-JS (Tailwind or plain CSS)
 */
export class StyleCompiler {
  private tokens: StylesConfig['colors'] = {};
  private components: StylesConfig['components'] = {};

  constructor(config: StylesConfig) {
    this.tokens = config.colors || {};
    this.components = config.components || {};
  }

  /**
   * Compile component styles to className (Tailwind) or CSS object
   */
  compileComponent(componentName: string, variant?: string, state?: string): string {
    const comp = this.components[componentName];
    if (!comp) return '';

    let styles = comp.base || {};

    if (variant && comp.variants?.[variant]) {
      styles = { ...styles, ...comp.variants[variant] };
    }

    if (state && comp.states?.[state]) {
      styles = { ...styles, ...comp.states[state] };
    }

    return this.stylesToClassName(styles);
  }

  /**
   * Convert style object to Tailwind className
   */
  private stylesToClassName(styles: StyleDefinition): string {
    const classes: string[] = [];

    if (styles.display) classes.push(`flex`); // Simplified - use display value
    if (styles.padding) classes.push(`p-4`); // Map to Tailwind spacing
    if (styles.backgroundColor) classes.push(`bg-blue-500`); // Map to token
    // ... more mappings

    return classes.join(' ');
  }

  /**
   * Generate CSS-in-JS for styled components
   */
  generateCSS(componentName: string): string {
    const comp = this.components[componentName];
    if (!comp) return '';

    let css = `.${componentName} {\n`;
    css += this.styleObjectToCSS(comp.base || {});
    css += '}\n';

    return css;
  }

  private styleObjectToCSS(styles: StyleDefinition): string {
    let css = '';
    for (const [key, value] of Object.entries(styles)) {
      const cssKey = this.camelToCss(key);
      css += `  ${cssKey}: ${value};\n`;
    }
    return css;
  }

  private camelToCss(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
  }
}

export function compileStyles(config: StylesConfig): StyleCompiler {
  return new StyleCompiler(config);
}
```

**Step 4: Create example style definitions**

Create `/packages/ui_home/seed/styles/tokens.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-styles.schema.json",
  "schemaVersion": "2.0.0",
  "colors": {
    "primary": "#2563eb",
    "secondary": "#64748b",
    "success": "#16a34a",
    "error": "#dc2626"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "components": {
    "Button": {
      "base": {
        "display": "inline-flex",
        "padding": "8px 16px",
        "backgroundColor": "$primary",
        "color": "#ffffff",
        "borderRadius": "4px",
        "cursor": "pointer",
        "transition": "all 0.2s ease"
      },
      "variants": {
        "size": {
          "sm": { "padding": "4px 12px", "fontSize": "12px" },
          "lg": { "padding": "12px 24px", "fontSize": "18px" }
        },
        "color": {
          "primary": { "backgroundColor": "$primary" },
          "error": { "backgroundColor": "$error" }
        }
      },
      "states": {
        "hover": { "opacity": 0.8 },
        "active": { "opacity": 0.9 },
        "disabled": { "opacity": 0.5, "cursor": "not-allowed" }
      }
    }
  }
}
```

**Step 5: Commit style compiler and examples**

```bash
git add frontends/nextjs/src/lib/style-compiler/
git add packages/ui_home/seed/styles/
git commit -m "feat: Add JSON style interpreter and example style tokens"
```

---

## Phase 2: Test Runner Implementation

### Task 3: Build Unified Test Runner

**Files:**
- Create: `/e2e/test-runner/index.ts` (main orchestrator)
- Create: `/e2e/test-runner/unit-runner.ts` (Vitest integration)
- Create: `/e2e/test-runner/json-interpreter.ts` (JSON → test execution)
- Modify: `playwright.config.ts` (integrate unified runner)

**Step 1: Create JSON test interpreter**

Create `/e2e/test-runner/json-interpreter.ts`:

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TestSuite, Test, Assertion } from '@/schemas/types/tests';

/**
 * Minimal JSON test interpreter
 * Converts JSON test definitions to Vitest test suites
 */
export class JSONTestInterpreter {
  private imports: Map<string, any> = new Map();

  async loadImports(imports: Array<{ from: string; import: string[] }>) {
    for (const imp of imports) {
      try {
        const module = await import(imp.from);
        for (const name of imp.import) {
          this.imports.set(name, module[name]);
        }
      } catch (err) {
        console.warn(`Failed to import ${imp.import.join(', ')} from ${imp.from}`);
      }
    }
  }

  registerTestSuite(suite: TestSuite) {
    if (suite.skip) return;

    describe(suite.name, () => {
      for (const test of suite.tests) {
        if (test.skip) continue;
        this.registerTest(test);
      }
    });
  }

  private registerTest(test: Test) {
    const testFn = test.only ? it.only : it;

    testFn(test.name, async () => {
      // Arrange phase
      const fixtures = test.arrange?.fixtures || {};
      const mocks = await this.setupMocks(test.arrange?.mocks || []);

      // Act phase
      const result = await this.executeAction(test.act, { fixtures, mocks });

      // Assert phase
      for (const assertion of test.assert?.expectations || []) {
        this.executeAssertion(assertion, result);
      }

      // Cleanup
      this.cleanupMocks(mocks);
    }, { timeout: test.timeout || 5000, retry: test.retry });
  }

  private async executeAction(act: any, context: any) {
    switch (act.type) {
      case 'function_call':
        const fn = this.imports.get(act.target);
        return fn?.(act.input) || null;

      case 'render':
        const Component = this.imports.get(act.target);
        return render(<Component {...(act.input || {})} />);

      case 'click':
        const element = screen.getByRole(act.role, { name: act.text });
        element.click();
        return element;

      case 'fill':
        const input = screen.getByLabelText(act.text);
        input.value = act.input;
        return input;

      default:
        return null;
    }
  }

  private executeAssertion(assertion: Assertion, result: any) {
    const actual = this.getActual(assertion, result);

    switch (assertion.type) {
      case 'equals':
        expect(actual).toBe(assertion.expected);
        break;
      case 'deepEquals':
        expect(actual).toEqual(assertion.expected);
        break;
      case 'toBeVisible':
        expect(actual || screen.queryByText(assertion.text)).toBeVisible();
        break;
      case 'toBeInTheDocument':
        expect(screen.queryByText(assertion.text)).toBeInTheDocument();
        break;
      case 'toHaveTextContent':
        expect(result?.textContent).toContain(assertion.expected);
        break;
      case 'throws':
        expect(() => actual).toThrow();
        break;
      // ... more assertion types
    }
  }

  private getActual(assertion: Assertion, result: any) {
    if (assertion.selector) {
      return document.querySelector(assertion.selector);
    }
    if (assertion.text) {
      return screen.queryByText(assertion.text);
    }
    return result;
  }

  private async setupMocks(mocks: any[]) {
    const mockedModules = new Map();
    // Mock setup logic
    return mockedModules;
  }

  private cleanupMocks(mocks: Map<string, any>) {
    // Mock cleanup
  }
}
```

**Step 2: Create unified test runner**

Create `/e2e/test-runner/index.ts`:

```typescript
import { glob } from 'glob';
import { JSONTestInterpreter } from './json-interpreter';
import type { TestDefinition } from '@/schemas/types/tests';
import fs from 'fs';
import path from 'path';

/**
 * Unified test runner coordinates:
 * - Playwright E2E tests (packages/*/playwright/tests.json)
 * - Storybook stories (packages/*/storybook/stories.json)
 * - Unit tests (packages/*/unit-tests/tests.json)
 */
export class UnifiedTestRunner {
  private interpreter = new JSONTestInterpreter();

  async discoverTests() {
    const tests = {
      unit: await this.discoverUnitTests(),
      e2e: await this.discoverE2ETests(),
      storybook: await this.discoverStorybookTests(),
    };
    return tests;
  }

  private async discoverUnitTests() {
    const files = await glob('packages/*/unit-tests/tests.json');
    const tests = [];

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      tests.push({ file, content });
    }

    return tests;
  }

  private async discoverE2ETests() {
    const files = await glob('packages/*/playwright/tests.json');
    const tests = [];

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      tests.push({ file, content });
    }

    return tests;
  }

  private async discoverStorybookTests() {
    const files = await glob('packages/*/storybook/stories.json');
    const tests = [];

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      tests.push({ file, content });
    }

    return tests;
  }

  async runAll() {
    const tests = await this.discoverTests();

    console.log(`Found ${tests.unit.length} unit test files`);
    console.log(`Found ${tests.e2e.length} E2E test files`);
    console.log(`Found ${tests.storybook.length} Storybook files`);

    // Run unit tests through interpreter
    for (const test of tests.unit) {
      await this.interpreter.loadImports(test.content.imports || []);

      for (const suite of test.content.testSuites || []) {
        this.interpreter.registerTestSuite(suite);
      }
    }
  }
}

export async function runTests() {
  const runner = new UnifiedTestRunner();
  await runner.runAll();
}
```

**Step 3: Commit test runner**

```bash
git add e2e/test-runner/
git commit -m "feat: Add unified JSON test runner for unit, E2E, and Storybook tests"
```

---

## Phase 3: Migration Tooling

### Task 4: Create Migration Script from TypeScript to JSON Tests

**Files:**
- Create: `/scripts/migrate-tests.ts` (migration tool)
- Create: `/scripts/test-converter.ts` (AST → JSON converter)
- Reference: `/frontends/nextjs/src/**/*.test.ts` (migration targets)

**Step 1: Create test converter**

Create `/scripts/test-converter.ts`:

```typescript
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

/**
 * Convert TypeScript test files to JSON format
 * Parses AST and extracts:
 * - describe() → testSuite
 * - it() → test
 * - expect() → assertion
 */
export class TestConverter {
  convert(tsFilePath: string): any {
    const source = fs.readFileSync(tsFilePath, 'utf-8');
    const sourceFile = ts.createSourceFile(tsFilePath, source, ts.ScriptTarget.Latest);

    const imports: any[] = [];
    const testSuites: any[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        imports.push(this.parseImport(node));
      }
      if (this.isDescribeCall(node)) {
        testSuites.push(this.parseTestSuite(node));
      }
    });

    return {
      "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
      "schemaVersion": "2.0.0",
      "package": path.basename(path.dirname(tsFilePath)),
      "imports": imports,
      "testSuites": testSuites
    };
  }

  private parseImport(node: ts.ImportDeclaration): any {
    // Parse import statements
    return {
      from: (node.moduleSpecifier as any).text,
      import: [] // Extract specific imports
    };
  }

  private parseTestSuite(node: ts.CallExpression): any {
    // Parse describe() block
    return {
      id: 'suite_' + Date.now(),
      name: 'Test Suite',
      tests: []
    };
  }

  private isDescribeCall(node: ts.Node): node is ts.CallExpression {
    return ts.isCallExpression(node) &&
           ts.isIdentifier(node.expression) &&
           node.expression.text === 'describe';
  }
}

export function convertFile(tsPath: string, jsonPath: string) {
  const converter = new TestConverter();
  const json = converter.convert(tsPath);
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  console.log(`✓ Converted ${tsPath} → ${jsonPath}`);
}
```

**Step 2: Create migration script**

Create `/scripts/migrate-tests.ts`:

```typescript
import { convertFile } from './test-converter';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

/**
 * Batch migration of TypeScript tests to JSON
 * 1. Discovers all .test.ts/.spec.ts files
 * 2. Converts each to JSON
 * 3. Places in packages/[package]/unit-tests/tests.json
 * 4. Validates against schema
 */
export async function migrateAllTests() {
  const testFiles = await glob(['frontends/**/*.test.ts', 'frontends/**/*.spec.ts']);

  console.log(`Found ${testFiles.length} test files to migrate\n`);

  for (const testFile of testFiles) {
    // Determine target package
    const packageName = testFile.includes('nextjs') ? 'nextjs_frontend' : 'unknown';
    const jsonPath = path.join('packages', packageName, 'unit-tests', 'tests.json');

    // Create directory if needed
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });

    try {
      convertFile(testFile, jsonPath);
    } catch (err) {
      console.error(`✗ Failed to convert ${testFile}:`, err);
    }
  }

  console.log('\n✓ Migration complete');
}

// Run migration
migrateAllTests().catch(console.error);
```

**Step 3: Validate converted tests**

Create `/scripts/validate-tests.ts`:

```typescript
import AJV from 'ajv';
import fs from 'fs';
import { glob } from 'glob';

const ajv = new AJV();
const testSchema = JSON.parse(fs.readFileSync('schemas/package-schemas/tests_schema.json', 'utf-8'));
const validate = ajv.compile(testSchema);

export async function validateAllTests() {
  const jsonFiles = await glob('packages/*/unit-tests/tests.json');
  let valid = 0, invalid = 0;

  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (validate(data)) {
      console.log(`✓ ${file}`);
      valid++;
    } else {
      console.error(`✗ ${file}:`, validate.errors);
      invalid++;
    }
  }

  console.log(`\n${valid} valid, ${invalid} invalid`);
  return invalid === 0;
}

validateAllTests().then(ok => process.exit(ok ? 0 : 1));
```

**Step 4: Commit migration tooling**

```bash
git add scripts/migrate-tests.ts scripts/test-converter.ts scripts/validate-tests.ts
git commit -m "feat: Add migration tooling for TypeScript → JSON test conversion"
```

---

## Phase 4: Batch Package Migration

### Task 5: Create Example Package with Full JSON Tests

**Files:**
- Create: `/packages/test_example_complete/` (complete example)
- Create: `/packages/test_example_complete/unit-tests/tests.json` (10+ example tests)
- Create: `/packages/test_example_complete/unit-tests/fixtures.json` (shared test data)
- Create: `/packages/test_example_complete/seed/styles/components.json` (JSON styles)

**Step 1: Create complete example package structure**

```bash
mkdir -p packages/test_example_complete/unit-tests
mkdir -p packages/test_example_complete/seed/styles
touch packages/test_example_complete/package.json
touch packages/test_example_complete/unit-tests/tests.json
touch packages/test_example_complete/unit-tests/fixtures.json
touch packages/test_example_complete/seed/styles/components.json
```

**Step 2: Create comprehensive test examples**

Create `/packages/test_example_complete/unit-tests/tests.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "test_example_complete",
  "description": "Complete example of JSON-based unit tests showing all patterns",
  "imports": [
    { "from": "@testing-library/react", "import": ["render", "screen", "fireEvent"] },
    { "from": "@/components/Button", "import": ["Button"] },
    { "from": "@/lib/utils", "import": ["formatDate", "validateEmail"] }
  ],
  "testSuites": [
    {
      "id": "suite_utils",
      "name": "Utility Functions",
      "description": "Tests for helper functions",
      "tests": [
        {
          "id": "test_validate_email_valid",
          "name": "should accept valid email",
          "arrange": {
            "fixtures": { "email": "user@example.com" }
          },
          "act": {
            "type": "function_call",
            "target": "validateEmail",
            "input": "$arrange.fixtures.email"
          },
          "assert": {
            "expectations": [
              {
                "type": "truthy",
                "actual": "result",
                "message": "Valid email should return true"
              }
            ]
          }
        },
        {
          "id": "test_validate_email_invalid",
          "name": "should reject invalid email",
          "arrange": {
            "fixtures": { "email": "not-an-email" }
          },
          "act": {
            "type": "function_call",
            "target": "validateEmail",
            "input": "$arrange.fixtures.email"
          },
          "assert": {
            "expectations": [
              {
                "type": "falsy",
                "actual": "result"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "suite_button",
      "name": "Button Component",
      "tests": [
        {
          "id": "test_button_renders",
          "name": "should render button with label",
          "arrange": {
            "fixtures": { "label": "Click Me", "variant": "primary" }
          },
          "act": {
            "type": "render",
            "target": "Button",
            "input": "$arrange.fixtures"
          },
          "assert": {
            "expectations": [
              {
                "type": "toBeVisible",
                "text": "Click Me"
              }
            ]
          }
        },
        {
          "id": "test_button_click",
          "name": "should fire onClick handler",
          "arrange": {
            "fixtures": { "label": "Click", "onClick": "mockFn" },
            "mocks": [
              {
                "target": "onClick",
                "type": "function",
                "behavior": { "returnValue": null }
              }
            ]
          },
          "act": {
            "type": "render",
            "target": "Button",
            "input": "$arrange.fixtures"
          },
          "assert": {
            "expectations": [
              {
                "type": "toBeInTheDocument",
                "text": "Click"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Step 3: Create example styles**

Create `/packages/test_example_complete/seed/styles/components.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-styles.schema.json",
  "schemaVersion": "2.0.0",
  "components": {
    "Card": {
      "base": {
        "display": "flex",
        "flexDirection": "column",
        "padding": "16px",
        "backgroundColor": "#ffffff",
        "borderRadius": "8px",
        "boxShadow": "0 1px 3px rgba(0,0,0,0.1)"
      },
      "states": {
        "hover": {
          "boxShadow": "0 4px 6px rgba(0,0,0,0.15)"
        }
      }
    },
    "Badge": {
      "base": {
        "display": "inline-flex",
        "padding": "4px 8px",
        "backgroundColor": "#e5e7eb",
        "borderRadius": "9999px",
        "fontSize": "12px",
        "fontWeight": "500"
      },
      "variants": {
        "color": {
          "primary": { "backgroundColor": "#2563eb", "color": "#ffffff" },
          "error": { "backgroundColor": "#dc2626", "color": "#ffffff" },
          "success": { "backgroundColor": "#16a34a", "color": "#ffffff" }
        }
      }
    }
  }
}
```

**Step 4: Commit example package**

```bash
git add packages/test_example_complete/
git commit -m "docs: Add complete example package with JSON tests and styles"
```

---

## Phase 5: Documentation & Batch Migration

### Task 6: Create Comprehensive Migration Guide

**Files:**
- Create: `/docs/DECLARATIVE_TESTING_COMPLETE.md` (5,000+ words)
- Create: `/docs/MIGRATION_GUIDE_TESTS.md` (step-by-step guide)

**Content for `/docs/DECLARATIVE_TESTING_COMPLETE.md`:**

- Architecture overview (JSON interpreters everywhere)
- Complete schema reference (all assertion types, setup types, action types)
- AAA pattern explained with examples
- Component testing patterns
- Mocking and fixtures
- State and error handling testing
- Migration strategy
- Performance considerations
- Best practices

**Content for `/docs/MIGRATION_GUIDE_TESTS.md`:**

- Why migrate
- Before/after examples (TypeScript → JSON)
- Automated migration process
- Manual migration for complex tests
- Validation and testing
- Common patterns

**Step 1: Run batch migration** (when ready)

```bash
npm run migrate:tests          # Convert all .test.ts → tests.json
npm run validate:tests         # Validate JSON against schema
npm run test:json              # Run JSON tests with new runner
git add packages/*/unit-tests/
git commit -m "migrate: Convert all unit tests to declarative JSON"
```

---

## Execution Summary

**Total Implementation: 5-7 days**

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| 1 | Schema enhancements (tests + styles) | 1 day | None |
| 2 | Test runner implementation | 2 days | Phase 1 |
| 3 | Migration tooling | 1 day | Phase 2 |
| 4 | Example package | 1 day | Phase 2-3 |
| 5 | Documentation + batch migration | 2 days | Phase 1-4 |

**Key Checkpoints:**

1. After Task 1: Schema validates all existing E2E and Storybook tests
2. After Task 2: Test runner successfully executes example JSON tests
3. After Task 3: Migration script converts ≥50 existing tests
4. After Task 4: Example package serves as reference implementation
5. After Task 5: All documentation complete, batch migration proven

---

**Plan complete and saved. Ready for execution with superpowers:executing-plans or superpowers:subagent-driven-development.**

Two execution options:

**1. Subagent-Driven (this session)** - Fresh subagent per task, code review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
