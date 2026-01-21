/**
 * Test Validator
 * Validates converted JSON test files against tests_schema.json
 * Can be used pre- or post-migration to ensure quality
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

export interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class TestValidator {
  private ajv: InstanceType<typeof Ajv>;
  private schema: any;

  constructor(schemaPath: string) {
    this.ajv = new Ajv({ allErrors: true });
    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      this.schema = JSON.parse(schemaContent);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load schema from ${schemaPath}: ${message}`);
    }
  }

  /**
   * Validate a single JSON test file
   */
  validate(jsonPath: string): ValidationResult {
    const result: ValidationResult = {
      file: jsonPath,
      valid: false,
      errors: [],
      warnings: [],
    };

    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      const jsonContent = JSON.parse(content);

      // Validate against schema
      const validate = this.ajv.compile(this.schema);
      const isValid = validate(jsonContent);

      if (!isValid && validate.errors) {
        result.errors = validate.errors.map((err: any) => {
          const errorPath = err.instancePath || 'root';
          return `${errorPath}: ${err.message}`;
        });
      }

      // Additional validations
      this.performAdditionalChecks(jsonContent, result);

      result.valid = result.errors.length === 0;
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : String(err));
    }

    return result;
  }

  /**
   * Validate all JSON test files in a directory
   */
  validateDirectory(dirPath: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    const files = this.findJsonFiles(dirPath);

    for (const file of files) {
      results.push(this.validate(file));
    }

    return results;
  }

  /**
   * Find all JSON files in directory
   */
  private findJsonFiles(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          files.push(...this.findJsonFiles(fullPath));
        } else if (entry.name.endsWith('.json') && entry.name !== 'metadata.json') {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Failed to read directory ${dirPath}:`, err);
    }

    return files;
  }

  /**
   * Perform additional semantic checks beyond schema validation
   */
  private performAdditionalChecks(content: any, result: ValidationResult): void {
    // Check that test IDs are unique
    const testIds = new Set<string>();
    const suiteIds = new Set<string>();

    if (content.testSuites) {
      for (const suite of content.testSuites) {
        if (suiteIds.has(suite.id)) {
          result.warnings.push(`Duplicate suite ID: ${suite.id}`);
        }
        suiteIds.add(suite.id);

        if (suite.tests) {
          for (const test of suite.tests) {
            if (testIds.has(test.id)) {
              result.warnings.push(`Duplicate test ID: ${test.id}`);
            }
            testIds.add(test.id);

            // Check assertions exist
            if (!test.assert?.expectations || test.assert.expectations.length === 0) {
              result.warnings.push(`Test "${test.name}" has no assertions`);
            }
          }
        }
      }
    }

    // Check imports are referenced
    const imports = new Set<string>();
    if (content.imports) {
      for (const imp of content.imports) {
        if (imp.items) {
          for (const item of imp.items) {
            imports.add(item);
          }
        }
      }
    }

    // Warn about unused imports (basic check)
    const contentStr = JSON.stringify(content);
    for (const imp of imports) {
      if (!contentStr.includes(`"${imp}"`) && !contentStr.includes(`${imp}:`)) {
        result.warnings.push(`Import "${imp}" appears unused`);
      }
    }
  }
}

/**
 * Main entry point
 */
export async function validateTests(
  testPath: string,
  schemaPath: string = 'schemas/package-schemas/tests_schema.json'
): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           Test JSON Validator                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const validator = new TestValidator(schemaPath);

    let results: ValidationResult[];

    const stats = fs.statSync(testPath);
    if (stats.isDirectory()) {
      console.log(`Validating all JSON tests in: ${testPath}\n`);
      results = validator.validateDirectory(testPath);
    } else {
      console.log(`Validating: ${testPath}\n`);
      results = [validator.validate(testPath)];
    }

    // Print results
    let validCount = 0;
    let invalidCount = 0;

    for (const result of results) {
      const status = result.valid ? '✓' : '✗';
      console.log(`${status} ${result.file}`);

      if (result.errors.length > 0) {
        result.errors.forEach(err => console.error(`    Error: ${err}`));
        invalidCount++;
      } else {
        validCount++;
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(warn => console.warn(`    ⚠️  ${warn}`));
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  Validation Summary                    ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  ✓ Valid:   ${String(validCount).padEnd(40)}║`);
    console.log(`║  ✗ Invalid: ${String(invalidCount).padEnd(40)}║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (invalidCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Validation failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// CLI support
if (process.argv[1]?.endsWith('validator.ts')) {
  const testPath = process.argv[2] || 'packages';
  const schemaPath = process.argv[3] || 'schemas/package-schemas/tests_schema.json';

  validateTests(testPath, schemaPath).catch(err => {
    console.error('Validation error:', err);
    process.exit(1);
  });
}
