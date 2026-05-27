import { UnitTest } from '@/types/project'

export function generateUnitTests(tests: UnitTest[]): Record<string, string> {
  const files: Record<string, string> = {}

  tests.forEach(testSuite => {
    const fileName = testSuite.targetFile
      ? testSuite.targetFile.replace(/\.(tsx|ts|jsx|js)$/, '.test.$1')
      : `src/__tests__/${testSuite.name.replace(/\s+/g, '')}.test.tsx`

    let code = ''

    if (testSuite.testType === 'component') {
      code += `import { render, screen } from '@testing-library/react'\n`
        + `import { describe, it, expect } from 'vitest'\n`
      if (testSuite.targetFile) {
        const componentName = testSuite.targetFile.split('/').pop()
          ?.replace(/\.(tsx|ts|jsx|js)$/, '')
        const importPath = testSuite.targetFile
          .replace('.tsx', '').replace('.ts', '')
        code += `import { ${componentName} } from '${importPath}'\n\n`
      }
    } else if (testSuite.testType === 'hook') {
      code += `import { renderHook } from '@testing-library/react'\n`
        + `import { describe, it, expect } from 'vitest'\n`
      if (testSuite.targetFile) {
        const hookName = testSuite.targetFile.split('/').pop()
          ?.replace(/\.(tsx|ts|jsx|js)$/, '')
        const importPath = testSuite.targetFile
          .replace('.tsx', '').replace('.ts', '')
        code += `import { ${hookName} } from '${importPath}'\n\n`
      }
    } else {
      code += `import { describe, it, expect } from 'vitest'\n`
      if (testSuite.targetFile) {
        const importPath = testSuite.targetFile
          .replace('.tsx', '').replace('.ts', '')
        code += `import * as module from '${importPath}'\n\n`
      }
    }

    code += `describe('${testSuite.name}', () => {\n`
    if (testSuite.description) {
      code += `  // ${testSuite.description}\n\n`
    }

    testSuite.testCases.forEach(testCase => {
      code += `  it('${testCase.description}', () => {\n`

      if (testCase.setup) {
        code += `    ${testCase.setup}\n\n`
      }

      testCase.assertions.forEach(assertion => {
        code += `    ${assertion}\n`
      })

      if (testCase.teardown) {
        code += `\n    ${testCase.teardown}\n`
      }

      code += `  })\n\n`
    })

    code += `})\n`

    files[fileName] = code
  })

  return files
}
