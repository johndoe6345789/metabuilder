import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import { COVERAGE_CONFIG } from './config'
import { extractFunctions, FunctionDef } from './function-extractor'
import { extractTestCases, TestCase } from './test-extractor'

export interface CoverageReport {
  totalFunctions: number
  testedFunctions: number
  untested: FunctionDef[]
  tested: Map<string, TestCase[]>
  coverage: number
}

export const analyzeCoverage = async (): Promise<CoverageReport> => {
  const cwd = process.cwd()
  const srcFiles = await glob(COVERAGE_CONFIG.srcPatterns, { cwd, ignore: COVERAGE_CONFIG.ignorePatterns })
  const testFiles = await glob(COVERAGE_CONFIG.testPatterns, { cwd, ignore: COVERAGE_CONFIG.ignorePatterns })

  const allFunctions: FunctionDef[] = []
  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), 'utf-8')
      const funcs = extractFunctions(content, file)
      allFunctions.push(...funcs)
    } catch (e) {
      console.warn(`Error reading ${file}:`, (e as Error).message)
    }
  }

  const testMapping = new Map<string, TestCase[]>()
  const testedFunctionNames = new Set<string>()

  for (const file of testFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), 'utf-8')
      const testCases = extractTestCases(content, file)

      testCases.forEach((functionNames, testName) => {
        functionNames.forEach(funcName => {
          testedFunctionNames.add(funcName)

          if (!testMapping.has(funcName)) {
            testMapping.set(funcName, [])
          }
          testMapping.get(funcName)!.push({ name: testName, file, functions: functionNames, line: 0 })
        })
      })
    } catch (e) {
      console.warn(`Error reading ${file}:`, (e as Error).message)
    }
  }

  const untested = allFunctions.filter(f => !testedFunctionNames.has(f.name))
  const coverage = (((allFunctions.length - untested.length) / allFunctions.length) * 100).toFixed(2)

  return {
    totalFunctions: allFunctions.length,
    testedFunctions: allFunctions.length - untested.length,
    untested,
    tested: testMapping,
    coverage: parseFloat(coverage)
  }
}
