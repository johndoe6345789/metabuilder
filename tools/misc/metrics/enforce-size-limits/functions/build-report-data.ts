import { ReportData, Violation } from '../types'

export function buildReportData(violations: Violation[]): ReportData {
  const errors = violations.filter(v => v.severity === 'error').length
  const warnings = violations.filter(v => v.severity === 'warning').length

  return {
    timestamp: new Date().toISOString(),
    errors,
    warnings,
    violations,
  }
}
