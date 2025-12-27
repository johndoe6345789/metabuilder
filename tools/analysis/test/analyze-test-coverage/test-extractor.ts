export interface TestCase {
  name: string
  file: string
  functions: string[]
  line: number
}

export const extractTestCases = (content: string, file: string): Map<string, string[]> => {
  const testMap = new Map<string, string[]>()
  const lines = content.split('\n')
  let currentTestName = ''

  lines.forEach(line => {
    const testMatch = line.match(/(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)['"`]/)
    if (testMatch) {
      currentTestName = testMatch[1]
      testMap.set(currentTestName, [])
    }

    if (currentTestName) {
      const funcCalls = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
      if (funcCalls) {
        funcCalls.forEach(call => {
          const funcName = call.replace(/\s*\($/, '')
          if (funcName && !isCommonTestHelper(funcName)) {
            testMap.get(currentTestName)!.push(funcName)
          }
        })
      }
    }
  })

  return testMap
}

const isCommonTestHelper = (name: string): boolean => {
  const helpers = [
    'it',
    'test',
    'describe',
    'expect',
    'beforeEach',
    'afterEach',
    'beforeAll',
    'afterAll',
    'jest',
    'vi',
    'assert',
    'eq',
    'ok',
    'throws',
    'doesNotThrow',
    'async',
    'render',
    'screen',
    'fireEvent',
    'userEvent',
    'waitFor',
    'within'
  ]
  return helpers.includes(name)
}
