import { ReportData } from '../types'

export function printReport(report: ReportData): void {
  const errors = report.violations.filter(v => v.severity === 'error')
  const warnings = report.violations.filter(v => v.severity === 'warning')

  if (report.violations.length === 0) {
    console.log('✅ All files comply with size limits!')
    return
  }

  console.log('\n📊 Code Size Limit Violations Report\n')
  console.log('━'.repeat(100))

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`)
    for (const violation of errors) {
      console.log(`  📄 ${violation.file}`)
      console.log(`     ${violation.metric}: ${violation.current} / ${violation.limit}`)
      console.log('')
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`)
    for (const violation of warnings) {
      console.log(`  📄 ${violation.file}`)
      console.log(`     ${violation.metric}: ${violation.current} / ${violation.limit}`)
      console.log('')
    }
  }

  console.log('━'.repeat(100))
  console.log(`\n📈 Summary: ${errors.length} errors, ${warnings.length} warnings\n`)
}
