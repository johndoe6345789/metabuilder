import path from 'path'

import { BEST_PRACTICES, TEST_FILE_SUFFIXES, type CoverageData } from './data'

const findMatchingTestFile = (
  sourceFile: string,
  testFiles: string[],
  testsByFile: Map<string, string[]>
) => {
  const base = sourceFile.replace(/\.(ts|tsx)$/, '')

  return TEST_FILE_SUFFIXES
    .map(suffix => `${base}${suffix}`)
    .find(candidate => testFiles.includes(candidate) || testsByFile.has(candidate))
}

const buildSummary = ({ functionsByFile, testsByFile, testFiles }: CoverageData) => {
  const totalFunctions = Array.from(functionsByFile.values()).reduce(
    (sum, funcs) => sum + funcs.length,
    0
  )
  const totalTests = Array.from(testsByFile.values()).reduce((sum, tests) => sum + tests.length, 0)

  return [
    '## Summary\n',
    `- **Total Functions**: ${totalFunctions}`,
    `- **Total Test Cases**: ${totalTests}`,
    `- **Source Files with Functions**: ${functionsByFile.size}`,
    `- **Test Files**: ${testFiles.length}\n`,
  ].join('\n')
}

const buildFileCoverageSection = ({ functionsByFile, testsByFile, testFiles }: CoverageData) => {
  const sortedFiles = Array.from(functionsByFile.entries()).sort(([a], [b]) => a.localeCompare(b))

  const sections = sortedFiles.map(([file, funcs]) => {
    const relFile = path.relative(process.cwd(), file)
    const matchingTest = findMatchingTestFile(file, testFiles, testsByFile)
    const status = matchingTest ? '✅' : '❌'

    const functionDetails = funcs
      .map(func => `- \`${func.name}\` (line ${func.line})`)
      .join('\n')

    const testDetails = matchingTest
      ? [`\n**Test Cases**: ${(testsByFile.get(matchingTest) || []).length}\n`].join('')
      : ''

    return [
      `### ${status} ${relFile}\n`,
      `**Functions**: ${funcs.length}\n`,
      functionDetails,
      '\n',
      testDetails,
    ].join('\n')
  })

  return ['## Files with Function Coverage\n', ...sections, ''].join('\n')
}

const buildTestFilesSection = ({ testFiles, testsByFile }: CoverageData) => {
  const sections = testFiles.map(file => {
    const relFile = path.relative(process.cwd(), file)
    const tests = testsByFile.get(file) || []

    const cases = tests.map(test => `- ${test}`).join('\n')

    return [`### ${relFile}\n`, `**Test Cases**: ${tests.length}\n`, cases, '\n'].join('\n')
  })

  return ['## Test Files\n', ...sections, ''].join('\n')
}

const buildRecommendations = ({ functionsByFile, testsByFile, testFiles }: CoverageData) => {
  const untested = Array.from(functionsByFile.entries()).filter(
    ([file]) => !findMatchingTestFile(file, testFiles, testsByFile)
  )

  const untestedLines = untested.length
    ? [
        '### Files Needing Test Coverage\n',
        ...untested.map(([file, funcs]) => {
          const relFile = path.relative(process.cwd(), file)
          return `- **${relFile}**: ${funcs.length} functions need tests`
        }),
        '\n',
      ]
    : []

  const bestPractices = BEST_PRACTICES.map((practice, index) => `${index + 1}. ${practice}`).join('\n')

  return [
    '## Recommendations\n',
    ...untestedLines,
    '### Best Practices\n',
    `${bestPractices}\n`,
  ].join('\n')
}

export const buildReport = (data: CoverageData) => {
  return [
    '# Function-to-Test Coverage Report\n',
    `Generated: ${new Date().toISOString()}\n`,
    buildSummary(data),
    '',
    buildFileCoverageSection(data),
    buildTestFilesSection(data),
    buildRecommendations(data),
  ].join('\n')
}
