/**
 * TypeScript Test to JSON Test Converter
 * Converts .test.ts files to declarative JSON format
 *
 * Strategy:
 * - Parse describe() blocks → testSuites
 * - Parse it() blocks → tests
 * - Parse expect() statements → assertions
 * - Extract fixture/mock setup → arrange phase
 * - Convert test body to JSON representation
 */

import * as ts from 'typescript';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, basename } from 'path';

export interface ConversionResult {
  success: boolean;
  jsonContent?: any;
  warnings: string[];
  errors: string[];
}

export class TestConverter {
  private sourceFile!: ts.SourceFile;
  private imports: Map<string, { from: string; items: string[] }> = new Map();
  private warnings: string[] = [];
  private errors: string[] = [];

  /**
   * Convert a .test.ts file to JSON format
   */
  convert(tsFilePath: string): ConversionResult {
    this.imports.clear();
    this.warnings = [];
    this.errors = [];

    try {
      const source = readFileSync(tsFilePath, 'utf-8');
      this.sourceFile = ts.createSourceFile(tsFilePath, source, ts.ScriptTarget.Latest, true);

      // Extract imports
      this.extractImports();

      // Extract test suites
      const testSuites = this.extractTestSuites();

      if (testSuites.length === 0) {
        this.warnings.push('No test suites found in file');
      }

      // Determine package name from file path
      const packageName = this.extractPackageName(tsFilePath);

      const jsonContent = {
        $schema: 'https://metabuilder.dev/schemas/tests.schema.json',
        schemaVersion: '2.0.0',
        package: packageName,
        description: `Converted from ${basename(tsFilePath)}`,
        imports: Array.from(this.imports.values()),
        testSuites: testSuites,
      };

      return {
        success: true,
        jsonContent,
        warnings: this.warnings,
        errors: this.errors,
      };
    } catch (err) {
      this.errors.push(err instanceof Error ? err.message : String(err));
      return {
        success: false,
        warnings: this.warnings,
        errors: this.errors,
      };
    }
  }

  /**
   * Extract imports from source file
   */
  private extractImports(): void {
    ts.forEachChild(this.sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const from = (node.moduleSpecifier as any).text;
        const imports: string[] = [];

        if (node.importClause?.namedBindings) {
          const bindings = node.importClause.namedBindings;
          if (ts.isNamedImports(bindings)) {
            for (const element of bindings.elements) {
              imports.push(element.name.text);
            }
          }
        }

        if (imports.length > 0) {
          this.imports.set(from, { from, items: imports });
        }
      }
    });
  }

  /**
   * Extract test suites (describe blocks) from source
   */
  private extractTestSuites(): any[] {
    const suites: any[] = [];
    let suiteIndex = 0;

    ts.forEachChild(this.sourceFile, (node) => {
      if (this.isDescribeCall(node)) {
        const suite = this.parseTestSuite(node, suiteIndex++);
        if (suite) {
          suites.push(suite);
        }
      }
    });

    return suites;
  }

  /**
   * Check if node is a describe() call
   */
  private isDescribeCall(node: ts.Node): node is ts.CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'describe'
    );
  }

  /**
   * Check if node is an it() call
   */
  private isItCall(node: ts.Node): node is ts.CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'it'
    );
  }

  /**
   * Parse describe block into test suite
   */
  private parseTestSuite(node: ts.CallExpression, index: number): any | null {
    if (node.arguments.length < 2) return null;

    const suiteName = this.extractStringLiteral(node.arguments[0]);
    if (!suiteName) return null;

    const tests: any[] = [];
    let testIndex = 0;

    if (node.arguments[1] && ts.isArrowFunction(node.arguments[1])) {
      const body = node.arguments[1].body;
      if (ts.isBlock(body)) {
        ts.forEachChild(body, (child) => {
          if (this.isItCall(child)) {
            const test = this.parseTest(child, testIndex++);
            if (test) {
              tests.push(test);
            }
          }
        });
      }
    }

    return {
      id: `suite_${index}`,
      name: suiteName,
      tests: tests,
    };
  }

  /**
   * Parse it block into test
   */
  private parseTest(node: ts.CallExpression, index: number): any | null {
    if (node.arguments.length < 2) return null;

    const testName = this.extractStringLiteral(node.arguments[0]);
    if (!testName) return null;

    const test: any = {
      id: `test_${index}`,
      name: testName,
    };

    // Try to extract arrange, act, assert from test body
    if (node.arguments[1] && ts.isArrowFunction(node.arguments[1])) {
      const body = node.arguments[1].body;
      if (ts.isBlock(body)) {
        this.extractTestPhases(body, test);
      }
    }

    return test;
  }

  /**
   * Extract arrange, act, assert phases from test body
   */
  private extractTestPhases(body: ts.Block, test: any): void {
    // Simple heuristic: look for expect() calls
    const expectations: any[] = [];

    ts.forEachChild(body, (node) => {
      if (this.isExpectCall(node)) {
        const assertion = this.parseAssertion(node);
        if (assertion) {
          expectations.push(assertion);
        }
      }
    });

    if (expectations.length > 0) {
      test.assert = {
        expectations: expectations,
      };
    }

    // If no arrangements found, add minimal structure
    if (!test.arrange) {
      test.arrange = {
        fixtures: {},
      };
    }

    // If no act found, add minimal structure
    if (!test.act) {
      test.act = {
        type: 'custom',
      };
    }
  }

  /**
   * Check if node is an expect() call
   */
  private isExpectCall(node: ts.Node): node is ts.CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'expect'
    );
  }

  /**
   * Parse expect() call into assertion
   */
  private parseAssertion(node: ts.CallExpression): any | null {
    // expect(...).toBe(...) pattern
    if (node.expression && ts.isPropertyAccessExpression(node.expression)) {
      const matcher = node.expression.name.text;
      const expected = node.arguments[0];

      return {
        type: this.mapMatcherToType(matcher),
        expected: this.extractValue(expected),
        description: `expect().${matcher}`,
      };
    }

    return null;
  }

  /**
   * Map Vitest/Jest matchers to JSON assertion types
   */
  private mapMatcherToType(matcher: string): string {
    const mapping: Record<string, string> = {
      toBe: 'equals',
      toEqual: 'deepEquals',
      toStrictEqual: 'strictEquals',
      toNotEqual: 'notEquals',
      toBeGreaterThan: 'greaterThan',
      toBeLessThan: 'lessThan',
      toBeGreaterThanOrEqual: 'greaterThanOrEqual',
      toBeLessThanOrEqual: 'lessThanOrEqual',
      toContain: 'contains',
      toMatch: 'matches',
      toThrow: 'throws',
      toNotThrow: 'notThrows',
      toBeTruthy: 'truthy',
      toBeFalsy: 'falsy',
      toBeNull: 'null',
      toBeUndefined: 'undefined',
      toBeDefined: 'notUndefined',
      toBeInstanceOf: 'instanceOf',
      toHaveProperty: 'hasProperty',
      toHaveLength: 'hasLength',
      toBeVisible: 'toBeVisible',
      toBeInTheDocument: 'toBeInTheDocument',
      toHaveTextContent: 'toHaveTextContent',
      toHaveAttribute: 'toHaveAttribute',
      toHaveClass: 'toHaveClass',
      toBeDisabled: 'toBeDisabled',
      toBeEnabled: 'toBeEnabled',
      toHaveValue: 'toHaveValue',
    };

    return mapping[matcher] || 'custom';
  }

  /**
   * Extract string literal from node
   */
  private extractStringLiteral(node: ts.Expression | undefined): string | null {
    if (!node) return null;

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    }

    return null;
  }

  /**
   * Extract value from node
   */
  private extractValue(node: ts.Expression | undefined): any {
    if (!node) return undefined;

    if (ts.isStringLiteral(node)) {
      return node.text;
    }

    if (ts.isNumericLiteral(node)) {
      return Number(node.text);
    }

    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }

    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }

    if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }

    return undefined;
  }

  /**
   * Extract package name from file path
   */
  private extractPackageName(filePath: string): string {
    const match = filePath.match(/packages\/([^/]+)\//);
    return match ? match[1] : 'unknown_package';
  }
}

/**
 * Convert a single file
 */
export function convertFile(tsPath: string, jsonPath: string): boolean {
  const converter = new TestConverter();
  const result = converter.convert(tsPath);

  if (!result.success || !result.jsonContent) {
    console.error(`✗ Failed to convert ${tsPath}`);
    result.errors.forEach(err => console.error(`  Error: ${err}`));
    return false;
  }

  try {
    writeFileSync(jsonPath, JSON.stringify(result.jsonContent, null, 2));
    console.log(`✓ Converted ${tsPath} → ${jsonPath}`);

    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => console.warn(`  ⚠️  ${warn}`));
    }

    return true;
  } catch (err) {
    console.error(`✗ Failed to write ${jsonPath}:`, err);
    return false;
  }
}
