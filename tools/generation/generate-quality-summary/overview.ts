import { BASE_REPORT_PATH, QUALITY_SECTIONS, SectionDefinition } from './sections'
import { readJsonFile } from './report-reader'

type OverviewStatus = {
  status: string
  details: string
}

interface ReportData {
  coverage?: number
  totalIssues?: number
  critical?: number
  averageCoverage?: number
}

const selectDetails = (data: ReportData | null): OverviewStatus | undefined => {
  if (data?.coverage !== undefined) {
    return {
      status: data.coverage >= 80 ? '✅ Pass' : '⚠️ Warning',
      details: `${data.coverage}% coverage`,
    }
  }

  if (data?.totalIssues !== undefined) {
    return {
      status: data.critical === 0 ? '✅ Pass' : '❌ Issues',
      details: `${data.totalIssues} issues (${data.critical} critical)`,
    }
  }

  if (data?.averageCoverage !== undefined) {
    return {
      status: data.averageCoverage >= 70 ? '✅ Good' : '⚠️ Needs work',
      details: `${data.averageCoverage.toFixed(1)}% documented`,
    }
  }

  return undefined
}

const evaluateSection = (section: SectionDefinition): OverviewStatus => {
  for (const file of section.files) {
    const fullPath = `${BASE_REPORT_PATH}${file}`
    const data = readJsonFile(fullPath)
    const chosen = selectDetails(data)
    if (chosen) return chosen
  }

  return { status: '⚠️ No data', details: 'Report not available' }
}

export const buildOverviewTable = (): string => {
  const rows = QUALITY_SECTIONS.map((section) => {
    const { status, details } = evaluateSection(section)
    return `| ${section.icon} ${section.name} | ${status} | ${details} |\n`
  })

  return rows.join('')
}
