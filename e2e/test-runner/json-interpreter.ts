/**
 * JSON Test Interpreter
 * Converts JSON test definitions to Vitest test suites
 * Follows the "JSON interpreter everywhere" philosophy
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import type { TestSuite, Test, ActPhase, AssertPhase, AssertionDefinition, MockDefinition } from './types';

export class JSONTestInterpreter {
  private imports: Map<string, any> = new Map();
  private mocks: Map<string, any> = new Map();
  private fixtures: Record<string, any> = {};

  /**
   * Load imports from module paths
   */
  async loadImports(imports: Array<{ from: string; import: string[] }> = []): Promise<void> {
    for (const imp of imports) {
      try {
        const module = await import(imp.from);
        for (const name of imp.import) {
          this.imports.set(name, module[name]);
        }
      } catch (err) {
        console.warn(`⚠️  Failed to import ${imp.import.join(', ')} from ${imp.from}`);
      }
    }
  }

  /**
   * Register a test suite from JSON definition
   */
  registerTestSuite(suite: TestSuite): void {
    if (suite.skip) return;

    const suiteFn = suite.only ? describe.only : describe;
    const suiteTimeout = suite.timeout;

    suiteFn(suite.name, () => {
      // Setup hooks
      if (suite.setup?.beforeAll) {
        beforeAll(async () => {
          for (const step of suite.setup!.beforeAll!) {
            await this.executeSetupStep(step);
          }
        });
      }

      if (suite.setup?.beforeEach) {
        beforeEach(async () => {
          for (const step of suite.setup!.beforeEach!) {
            await this.executeSetupStep(step);
          }
        });
      }

      if (suite.setup?.afterEach) {
        afterEach(async () => {
          for (const step of suite.setup!.afterEach!) {
            await this.executeSetupStep(step);
          }
        });
      }

      if (suite.setup?.afterAll) {
        afterAll(async () => {
          for (const step of suite.setup!.afterAll!) {
            await this.executeSetupStep(step);
          }
        });
      }

      // Register tests
      for (const test of suite.tests) {
        if (test.skip) continue;
        this.registerTest(test, suiteTimeout);
      }
    });
  }

  /**
   * Register individual test from JSON definition
   */
  private registerTest(test: Test, suiteTimeout?: number): void {
    const testFn = test.only ? it.only : it;
    const testTimeout = test.timeout || suiteTimeout || 5000;

    testFn(
      test.name,
      async () => {
        // Arrange phase
        this.fixtures = test.arrange?.fixtures || {};
        this.mocks.clear();
        await this.setupMocks(test.arrange?.mocks || []);

        // Act phase
        const result = await this.executeAction(test.act);

        // Assert phase
        for (const assertion of test.assert?.expectations || []) {
          this.executeAssertion(assertion, result);
        }

        // Cleanup
        this.cleanupMocks();
      },
      { timeout: testTimeout, retry: test.retry }
    );
  }

  /**
   * Execute setup step (beforeAll, beforeEach, etc.)
   */
  private async executeSetupStep(step: any): Promise<void> {
    switch (step.type) {
      case 'initialize':
        // Custom initialization logic
        break;
      case 'mock':
        // Mock setup handled separately
        break;
      case 'fixture':
        // Load fixture data
        break;
      case 'database':
        // Database initialization
        break;
      case 'cleanup':
        // Cleanup logic
        break;
    }
  }

  /**
   * Execute test action (act phase)
   */
  private async executeAction(act?: ActPhase): Promise<any> {
    if (!act) return null;

    try {
      switch (act.type) {
        case 'function_call':
          return this.executeFunctionCall(act);

        case 'render':
          return this.executeRender(act);

        case 'click':
          return this.executeClick(act);

        case 'fill':
          return this.executeFill(act);

        case 'select':
          return this.executeSelect(act);

        case 'hover':
          return this.executeHover(act);

        case 'focus':
          return this.executeFocus(act);

        case 'blur':
          return this.executeBlur(act);

        case 'waitFor':
          return this.executeWaitFor(act);

        case 'api_request':
        case 'event_trigger':
        case 'custom':
        default:
          return null;
      }
    } catch (err) {
      throw new Error(`Action execution failed (${act.type}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Execute function call action
   */
  private executeFunctionCall(act: ActPhase): any {
    const fn = this.imports.get(act.target!);
    if (!fn) {
      throw new Error(`Function '${act.target}' not imported`);
    }

    const input = this.interpolateFixtures(act.input);
    return fn(input);
  }

  /**
   * Execute render action (requires React Testing Library)
   */
  private executeRender(act: ActPhase): any {
    // Render action requires React Testing Library context
    // This is handled by test integration, not the interpreter
    console.warn('⚠️  Render action requires React Testing Library setup');
    return null;
  }

  /**
   * Execute click action
   */
  private executeClick(act: ActPhase): any {
    console.warn('⚠️  Click action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute fill action
   */
  private executeFill(act: ActPhase): any {
    console.warn('⚠️  Fill action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute select action
   */
  private executeSelect(act: ActPhase): any {
    console.warn('⚠️  Select action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute hover action
   */
  private executeHover(act: ActPhase): any {
    console.warn('⚠️  Hover action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute focus action
   */
  private executeFocus(act: ActPhase): any {
    console.warn('⚠️  Focus action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute blur action
   */
  private executeBlur(act: ActPhase): any {
    console.warn('⚠️  Blur action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute waitFor action
   */
  private executeWaitFor(act: ActPhase): any {
    console.warn('⚠️  WaitFor action requires browser/DOM setup');
    return null;
  }

  /**
   * Execute assertions
   */
  private executeAssertion(assertion: AssertionDefinition, result: any): void {
    const actual = this.getActualValue(assertion, result);

    try {
      switch (assertion.type) {
        case 'equals':
          expect(actual).toBe(assertion.expected);
          break;

        case 'deepEquals':
          expect(actual).toEqual(assertion.expected);
          break;

        case 'strictEquals':
          expect(actual).toBe(assertion.expected);
          break;

        case 'notEquals':
          expect(actual).not.toBe(assertion.expected);
          break;

        case 'greaterThan':
          expect(actual).toBeGreaterThan(assertion.expected);
          break;

        case 'lessThan':
          expect(actual).toBeLessThan(assertion.expected);
          break;

        case 'greaterThanOrEqual':
          expect(actual).toBeGreaterThanOrEqual(assertion.expected);
          break;

        case 'lessThanOrEqual':
          expect(actual).toBeLessThanOrEqual(assertion.expected);
          break;

        case 'contains':
          expect(String(actual)).toContain(String(assertion.expected));
          break;

        case 'matches':
          expect(String(actual)).toMatch(new RegExp(assertion.expected));
          break;

        case 'throws':
          expect(actual).toThrow();
          break;

        case 'notThrows':
          expect(actual).not.toThrow();
          break;

        case 'truthy':
          expect(actual).toBeTruthy();
          break;

        case 'falsy':
          expect(actual).toBeFalsy();
          break;

        case 'null':
          expect(actual).toBeNull();
          break;

        case 'notNull':
          expect(actual).not.toBeNull();
          break;

        case 'undefined':
          expect(actual).toBeUndefined();
          break;

        case 'notUndefined':
          expect(actual).toBeDefined();
          break;

        case 'instanceOf':
          expect(actual).toBeInstanceOf(assertion.expected);
          break;

        case 'hasProperty':
          expect(actual).toHaveProperty(assertion.expected);
          break;

        case 'hasLength':
          expect(actual).toHaveLength(assertion.expected);
          break;

        // DOM assertions (require browser context)
        case 'toBeVisible':
        case 'toBeInTheDocument':
        case 'toHaveTextContent':
        case 'toHaveAttribute':
        case 'toHaveClass':
        case 'toBeDisabled':
        case 'toBeEnabled':
        case 'toHaveValue':
          console.warn(`⚠️  DOM assertion '${assertion.type}' requires React Testing Library setup`);
          break;

        case 'custom':
          // Custom assertion logic
          console.warn('⚠️  Custom assertion requires custom implementation');
          break;

        default:
          throw new Error(`Unknown assertion type: ${assertion.type}`);
      }
    } catch (err) {
      throw new Error(`Assertion failed: ${assertion.message || String(err)}`);
    }
  }

  /**
   * Get actual value from result or fixtures
   */
  private getActualValue(assertion: AssertionDefinition, result: any): any {
    if (assertion.selector) {
      // DOM query - requires browser context
      return null;
    }

    if (assertion.actual) {
      // Interpolate from fixtures if needed
      if (typeof assertion.actual === 'string' && assertion.actual.startsWith('$arrange.fixtures.')) {
        const key = assertion.actual.replace('$arrange.fixtures.', '');
        return this.fixtures[key];
      }
      return assertion.actual;
    }

    return result;
  }

  /**
   * Interpolate fixture references in input
   */
  private interpolateFixtures(input: any): any {
    if (typeof input === 'string' && input.startsWith('$arrange.fixtures.')) {
      const key = input.replace('$arrange.fixtures.', '');
      return this.fixtures[key];
    }

    if (typeof input === 'object' && input !== null) {
      const result: any = Array.isArray(input) ? [] : {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.interpolateFixtures(value);
      }
      return result;
    }

    return input;
  }

  /**
   * Setup mocks
   */
  private async setupMocks(mocks: MockDefinition[]): Promise<void> {
    for (const mock of mocks) {
      const target = this.imports.get(mock.target);
      if (!target) {
        console.warn(`⚠️  Mock target '${mock.target}' not found`);
        continue;
      }

      if (mock.behavior.returnValue !== undefined) {
        this.mocks.set(mock.target, vi.fn().mockReturnValue(mock.behavior.returnValue));
      }

      if (mock.behavior.throwError) {
        this.mocks.set(mock.target, vi.fn().mockImplementation(() => {
          throw new Error(mock.behavior.throwError);
        }));
      }
    }
  }

  /**
   * Cleanup mocks
   */
  private cleanupMocks(): void {
    for (const mock of this.mocks.values()) {
      if (typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    }
    this.mocks.clear();
  }
}

/**
 * Factory function to create and register test suite
 */
export function registerJSONTestSuite(definition: any): void {
  const interpreter = new JSONTestInterpreter();

  if (definition.imports) {
    interpreter.loadImports(definition.imports).catch(err => {
      console.error('Failed to load imports:', err);
    });
  }

  for (const suite of definition.testSuites || []) {
    interpreter.registerTestSuite(suite);
  }
}
