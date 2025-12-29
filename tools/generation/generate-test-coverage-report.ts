#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

import {
  DEFAULT_IGNORE_PATHS,
  SOURCE_DIRECTORIES,
  type CoverageData,
  type FunctionInfo,
} from './report/data'
import { buildReport } from './report/templates'

const SRC_PATTERN = /\.(ts|tsx)$/
const TEST_PATTERN = /(test|spec)\.(ts|tsx)$/

const findFiles = (dir: string, pattern: RegExp, ignore: string[] = []) => {
  let results: string[] = []

  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filepath = path.join(dir, file)
      const stat = fs.statSync(filepath)
      const relPath = path.relative(process.cwd(), filepath)

      if (ignore.some(ignored => relPath.includes(ignored))) continue

      if (stat.isDirectory()) {
        results = results.concat(findFiles(filepath, pattern, ignore))
      } else if (pattern.test(file)) {
        results.push(filepath)
      }
    }
  } catch (error) {
    console.warn(`Skipping unreadable path ${dir}:`, error)
  }

  return results
}

const extractFunctions = (content: string): FunctionInfo[] => {
  const functions: FunctionInfo[] = []

  content.split('\n').forEach((line, index) => {
    const lineNum = index + 1
    const namedMatch = line.match(/export\s+(?:function|const|async\s+function|async\s+const)\s+(\w+)/)

    if (namedMatch) {
      functions.push({
        name: namedMatch[1],
        line: lineNum,
        type: 'export',
      })
    }
  })

  return functions
}

const extractTestCases = (content: string) => {
  const testNames: string[] = []

  content.split('\n').forEach(line => {
    const testMatch = line.match(/(?:describe|it|test)\s*\(\s*['"`]([^'"`]+)['"`]/)
    if (testMatch) {
      testNames.push(testMatch[1])
    }
  })

  return testNames
}

const collectCoverageData = (): CoverageData => {
  const sourceFiles = SOURCE_DIRECTORIES.flatMap(dir => findFiles(dir, SRC_PATTERN, DEFAULT_IGNORE_PATHS)).filter(
    file => !file.includes('.test.') && !file.includes('.spec.')
  )
  const testFiles = findFiles('.', TEST_PATTERN, DEFAULT_IGNORE_PATHS)

  const functionsByFile = new Map<string, FunctionInfo[]>()
  const testsByFile = new Map<string, string[]>()

  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const functions = extractFunctions(content)
      if (functions.length) {
        functionsByFile.set(file, functions)
      }
    } catch (error) {
      console.warn(`Unable to read source file ${file}:`, error)
    }
  })

  testFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const tests = extractTestCases(content)
      if (tests.length) {
        testsByFile.set(file, tests)
      }
    } catch (error) {
      console.warn(`Unable to read test file ${file}:`, error)
    }
  })

  return { functionsByFile, testsByFile, testFiles }
}

const main = () => {
  const report = buildReport(collectCoverageData())
  fs.writeFileSync('FUNCTION_TEST_COVERAGE.md', report)

  console.log('✅ Coverage report generated: FUNCTION_TEST_COVERAGE.md')
  console.log('\nTo run all tests:')
  console.log('  npm test -- --run\n')
  console.log('To run tests in watch mode:')
  console.log('  npm test\n')
}

main()
