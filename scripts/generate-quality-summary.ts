#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

function generateQualitySummary(): string {
  let markdown = '# Quality Metrics Summary\n\n'
  
  const reportPath = 'quality-reports/'
  const sections = [
    {
      name: '🔍 Code Quality',
      files: ['code-quality-reports/code-quality-reports'],
      icon: '📊'
    },
    {
      name: '🧪 Test Coverage',
      files: ['coverage-reports/coverage-metrics.json'],
      icon: '✓'
    },
    {
      name: '🔐 Security',
      files: ['security-reports/security-report.json'],
      icon: '🛡️'
    },
    {
      name: '📚 Documentation',
      files: ['documentation-reports/jsdoc-report.json'],
      icon: '📖'
    },
    {
      name: '⚡ Performance',
      files: ['performance-reports/bundle-analysis.json'],
      icon: '🚀'
    },
    {
      name: '📦 Dependencies',
      files: ['dependency-reports/license-report.json'],
      icon: '📦'
    },
    {
      name: '🎯 Type Safety',
      files: ['type-reports/ts-strict-report.json'],
      icon: '✔️'
    }
  ]
  
  markdown += '## Overview\n\n'
  markdown += '| Metric | Status | Details |\n'
  markdown += '|--------|--------|----------|\n'
  
  for (const section of sections) {
    let status = '⚠️ No data'
    let details = 'Report not available'
    
    for (const file of section.files) {
      const fullPath = `${reportPath}${file}`
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf8')
          const data = JSON.parse(content)
          
          if (data.coverage) {
            status = data.coverage >= 80 ? '✅ Pass' : '⚠️ Warning'
            details = `${data.coverage}% coverage`
          } else if (data.totalIssues !== undefined) {
            status = data.critical === 0 ? '✅ Pass' : '❌ Issues'
            details = `${data.totalIssues} issues (${data.critical} critical)`
          } else if (data.averageCoverage) {
            status = data.averageCoverage >= 70 ? '✅ Good' : '⚠️ Needs work'
            details = `${data.averageCoverage.toFixed(1)}% documented`
          }
          break
        } catch (e) {
          // Continue to next file
        }
      }
    }
    
    markdown += `| ${section.icon} ${section.name} | ${status} | ${details} |\n`
  }
  
  markdown += '\n## Detailed Metrics\n\n'
  
  // Code Complexity
  markdown += '### Code Complexity\n\n'
  const complexityPath = `${reportPath}code-quality-reports/code-quality-reports/complexity-report.json`
  if (existsSync(complexityPath)) {
    try {
      const complexity = JSON.parse(readFileSync(complexityPath, 'utf8'))
      markdown += `- **Total files analyzed**: ${complexity.totalFilesAnalyzed}\n`
      markdown += `- **Average complexity**: ${complexity.avgMaxComplexity?.toFixed(2) || 'N/A'}\n`
      markdown += `- **Violations**: ${complexity.totalViolations || 0}\n\n`
    } catch (e) {
      markdown += 'No data available\n\n'
    }
  }
  
  // Security Issues
  markdown += '### Security Scan Results\n\n'
  const securityPath = `${reportPath}security-reports/security-reports/security-report.json`
  if (existsSync(securityPath)) {
    try {
      const security = JSON.parse(readFileSync(securityPath, 'utf8'))
      markdown += `- **Critical Issues**: ${security.critical || 0} ❌\n`
      markdown += `- **High Severity**: ${security.high || 0} ⚠️\n`
      markdown += `- **Medium Severity**: ${security.medium || 0} ℹ️\n`
      markdown += `- **Total Issues**: ${security.totalIssues || 0}\n\n`
    } catch (e) {
      markdown += 'No data available\n\n'
    }
  }
  
  // File Size Analysis
  markdown += '### File Size Metrics\n\n'
  const filesizePath = `${reportPath}size-reports/size-reports/file-sizes-report.json`
  if (existsSync(filesizePath)) {
    try {
      const filesize = JSON.parse(readFileSync(filesizePath, 'utf8'))
      markdown += `- **Files analyzed**: ${filesize.totalFilesAnalyzed}\n`
      markdown += `- **Violations**: ${filesize.totalViolations || 0}\n`
      if (filesize.largestFiles) {
        markdown += `- **Largest file**: ${filesize.largestFiles[0]?.file || 'N/A'} (${filesize.largestFiles[0]?.lines || 0} lines)\n`
      }
      markdown += '\n'
    } catch (e) {
      markdown += 'No data available\n\n'
    }
  }
  
  // Performance Metrics
  markdown += '### Performance Budget\n\n'
  const perfPath = `${reportPath}performance-reports/performance-reports/bundle-analysis.json`
  if (existsSync(perfPath)) {
    try {
      const perf = JSON.parse(readFileSync(perfPath, 'utf8'))
      markdown += `- **Total bundle size**: ${perf.totalBundleSize?.mb || 'N/A'}MB\n`
      markdown += `- **Gzip size**: ${perf.gzipSize?.mb || 'N/A'}MB\n`
      markdown += `- **Status**: ${perf.budgetStatus?.status === 'ok' ? '✅' : '⚠️'}\n\n`
    } catch (e) {
      markdown += 'No data available\n\n'
    }
  }
  
  markdown += '---\n\n'
  markdown += '## Recommendations\n\n'
  markdown += '- 🎯 Maintain test coverage above 80%\n'
  markdown += '- 📚 Add JSDoc comments to exported functions\n'
  markdown += '- 🔍 Address complexity warnings for better maintainability\n'
  markdown += '- ⚡ Monitor bundle size to prevent performance degradation\n'
  markdown += '- 🔐 Fix any security issues before merging\n'
  markdown += '- 📖 Keep documentation up to date\n\n'
  
  markdown += `**Report generated**: ${new Date().toISOString()}\n`
  
  return markdown
}

console.log(generateQualitySummary())
