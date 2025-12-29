import { writeFileSync } from 'fs'
import { analyzeCoverage, CoverageReport } from './analyze-test-coverage/coverage-runner'
import { analyzeImplementations } from './analyze-implementation-completeness/analyze-implementations'
import { summarizeAnalyses } from './analyze-implementation-completeness/summarize-analyses'
import { AnalysisSummary } from './analyze-implementation-completeness/types'

export interface TestAnalysisReport {
  coverage: CoverageReport
  implementationCompleteness: AnalysisSummary
}

export const buildTestAnalysisReport = async (): Promise<TestAnalysisReport> => {
  const [coverage, implementationCompleteness] = await Promise.all([
    analyzeCoverage(),
    Promise.resolve(summarizeAnalyses(analyzeImplementations()))
  ])

  return { coverage, implementationCompleteness }
}

export const writeTestAnalysisReport = (report: TestAnalysisReport, outputPath = 'test-analysis-report.json'): void => {
  try {
    writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.error(`Test analysis written to ${outputPath}`)
  } catch (error) {
    console.error(`Failed to write test analysis to ${outputPath}:`, error)
  }
}

export const runTestAnalysis = async (outputPath?: string): Promise<void> => {
  const report = await buildTestAnalysisReport()
  const destination = outputPath ?? 'test-analysis-report.json'

  writeTestAnalysisReport(report, destination)
  console.log(JSON.stringify(report, null, 2))
}
