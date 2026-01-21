/**
 * Type definitions for JSON test runner
 */

export interface TestDefinition {
  $schema: string;
  schemaVersion: string;
  package: string;
  description?: string;
  imports?: ImportDefinition[];
  setup?: SetupConfig;
  testSuites: TestSuite[];
}

export interface ImportDefinition {
  from: string;
  import: string[];
}

export interface SetupConfig {
  beforeAll?: SetupStep[];
  beforeEach?: SetupStep[];
  afterEach?: SetupStep[];
  afterAll?: SetupStep[];
}

export interface SetupStep {
  type: 'initialize' | 'mock' | 'fixture' | 'database' | 'cleanup' | 'custom';
  name?: string;
  config?: Record<string, any>;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  skip?: boolean;
  only?: boolean;
  tags?: string[];
  timeout?: number;
  setup?: SetupConfig;
  tests: Test[];
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  skip?: boolean;
  only?: boolean;
  tags?: string[];
  timeout?: number;
  retry?: number;
  parameterized?: boolean;
  parameters?: string | ParameterCase[];
  arrange?: ArrangePhase;
  act?: ActPhase;
  assert?: AssertPhase;
}

export interface ParameterCase {
  case: string;
  input: any;
  expected?: any;
  shouldThrow?: boolean;
  expectedError?: string;
  skip?: boolean;
  only?: boolean;
}

export interface ArrangePhase {
  given?: string;
  setup?: SetupStep[];
  mocks?: MockDefinition[];
  fixtures?: Record<string, any>;
}

export interface ActPhase {
  when?: string;
  type: 'function_call' | 'api_request' | 'event_trigger' | 'render' | 'click' | 'fill' | 'select' | 'hover' | 'focus' | 'blur' | 'waitFor' | 'custom';
  target?: string;
  selector?: string;
  role?: string;
  text?: string;
  input?: any;
  config?: Record<string, any>;
}

export interface AssertPhase {
  then?: string;
  expectations: AssertionDefinition[];
}

export interface AssertionDefinition {
  type: string;
  description?: string;
  actual?: any;
  expected?: any;
  selector?: string;
  role?: string;
  text?: string;
  message?: string;
  negate?: boolean;
}

export interface MockDefinition {
  target: string;
  type?: 'function' | 'module' | 'class' | 'object';
  behavior: MockBehavior;
}

export interface MockBehavior {
  returnValue?: any;
  throwError?: string;
  implementation?: string;
  calls?: any[];
}

export interface TestRunnerConfig {
  pattern?: string;
  packages?: string[];
  tags?: string[];
  verbose?: boolean;
}

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  suite: string;
}
