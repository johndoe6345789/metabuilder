import { DEFAULT_CONFIG } from './constants'
import { buildReportData } from './functions/build-report-data'
import { printReport } from './functions/print-report'
import { scanDirectory } from './functions/scan-directory'
import { writeReportFile } from './functions/write-report-file'
import { EnforcementConfig, ReportData } from './types'

export function runSizeLimitEnforcement(config: EnforcementConfig = DEFAULT_CONFIG): { report: ReportData; exitCode: number } {
  const violations = scanDirectory(config.rootDir, config.limits, config.excludeDirs)
  const report = buildReportData(violations)

  printReport(report)
  writeReportFile(report, config.rootDir, config.reportFileName)

  const exitCode = report.errors > 0 ? 1 : 0
  return { report, exitCode }
}
