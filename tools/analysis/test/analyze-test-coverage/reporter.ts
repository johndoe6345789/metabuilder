import * as fs from 'fs'
import * as path from 'path'
import { CoverageReport, FunctionDef } from './coverage-runner'

export const printReport = (report: CoverageReport) => {
  console.log('\n' + '='.repeat(70))
  console.log('FUNCTION-TO-TEST COVERAGE ANALYSIS')
  console.log('='.repeat(70))

  console.log(`\nSummary:`)
  console.log(`  Total Functions: ${report.totalFunctions}`)
  console.log(`  Tested Functions: ${report.testedFunctions}`)
  console.log(`  Untested Functions: ${report.untested.length}`)
  console.log(`  Coverage: ${report.coverage}%`)

  if (report.untested.length > 0) {
    console.log(`\n${'─'.repeat(70)}`)
    console.log('UNTESTED FUNCTIONS:')
    console.log(`${'─'.repeat(70)}`)

    const grouped = new Map<string, FunctionDef[]>()
    report.untested.forEach(fn => {
      if (!grouped.has(fn.file)) {
        grouped.set(fn.file, [])
      }
      grouped.get(fn.file)!.push(fn)
    })

    grouped.forEach((fns, file) => {
      console.log(`\n📄 ${file}`)
      fns.forEach(fn => {
        console.log(`   └─ ${fn.name} (${fn.type}) [line ${fn.line}]`)
      })
    })

    console.log(`\n${'─'.repeat(70)}`)
    console.log('TODO - CREATE TESTS FOR:')
    console.log(`${'─'.repeat(70)}`)

    report.untested.forEach(fn => {
      console.log(`- [ ] Write test for \`${fn.name}\` in ${fn.file}`)
    })
  }

  console.log('\n' + '='.repeat(70) + '\n')
}

export const writeJsonReport = (report: CoverageReport) => {
  const reportPath = path.join(process.cwd(), 'coverage-report.json')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalFunctions: report.totalFunctions,
          testedFunctions: report.testedFunctions,
          untestedFunctions: report.untested.length,
          coverage: report.coverage
        },
        untested: report.untested
      },
      null,
      2
    )
  )
  console.log(`✅ Report saved to: coverage-report.json`)
}
