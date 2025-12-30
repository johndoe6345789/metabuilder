export interface SectionDefinition {
  name: string
  files: string[]
  icon: string
}

export const BASE_REPORT_PATH = 'quality-reports/'

export const QUALITY_SECTIONS: SectionDefinition[] = [
  {
    name: '🔍 Code Quality',
    files: ['code-quality-reports/code-quality-reports'],
    icon: '📊',
  },
  {
    name: '🧪 Test Coverage',
    files: ['coverage-reports/coverage-metrics.json'],
    icon: '✓',
  },
  {
    name: '🔐 Security',
    files: ['security-reports/security-report.json'],
    icon: '🛡️',
  },
  {
    name: '📚 Documentation',
    files: ['documentation-reports/jsdoc-report.json'],
    icon: '📖',
  },
  {
    name: '⚡ Performance',
    files: ['performance-reports/bundle-analysis.json'],
    icon: '🚀',
  },
  {
    name: '📦 Dependencies',
    files: ['dependency-reports/license-report.json'],
    icon: '📦',
  },
  {
    name: '🎯 Type Safety',
    files: ['type-reports/ts-strict-report.json'],
    icon: '✔️',
  },
]
