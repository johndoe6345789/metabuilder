export type FunctionInfo = {
  name: string
  line: number
  type: 'export'
}

export type CoverageData = {
  functionsByFile: Map<string, FunctionInfo[]>
  testsByFile: Map<string, string[]>
  testFiles: string[]
}

export const DEFAULT_IGNORE_PATHS = ['node_modules', '.next', 'build', 'dist', '.git']

export const SOURCE_DIRECTORIES = ['src', 'packages', 'dbal/development']

export const TEST_FILE_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']

export const BEST_PRACTICES = [
  '**Parameterized Tests**: Use `it.each()` for testing multiple similar scenarios',
  '**Test Organization**: Group related tests in `describe()` blocks',
  '**Clear Descriptions**: Use descriptive test names that explain what is being tested',
  '**Edge Cases**: Include tests for null, undefined, empty values, and boundary conditions',
  '**Mocking**: Use `vi.fn()` and `vi.mock()` for external dependencies',
  '**Async Testing**: Use `async/await` and `act()` for async operations',
  '**Setup/Teardown**: Use `beforeEach` and `afterEach` for test setup and cleanup',
]
