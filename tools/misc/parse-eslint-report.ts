import { readFileSync } from 'fs'

try {
  const report = JSON.parse(readFileSync('eslint-report.json', 'utf8'))
  const summary = {
    totalFiles: report.length,
    filesWithIssues: report.filter((f: any) => f.messages.length > 0).length,
    errors: report.reduce((sum: number, f: any) => sum + f.messages.filter((m: any) => m.severity === 2).length, 0),
    warnings: report.reduce((sum: number, f: any) => sum + f.messages.filter((m: any) => m.severity === 1).length, 0),
    timestamp: new Date().toISOString()
  }
  console.log(JSON.stringify(summary, null, 2))
} catch (e) {
  console.log(JSON.stringify({
    totalFiles: 0,
    filesWithIssues: 0,
    errors: 0,
    warnings: 0,
    timestamp: new Date().toISOString()
  }, null, 2))
}
