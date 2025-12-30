#!/usr/bin/env tsx

import { execSync } from 'child_process'

interface CoverageMetrics {
  lines: number
  statements: number
  functions: number
  branches: number
  coverage: string
}

function extractCoverageMetrics(): CoverageMetrics {
  try {
    // Read coverage report if it exists
    const summaryPath = 'coverage/coverage-summary.json'
    
    try {
      const summaryContent = execSync(`cat ${summaryPath}`, { encoding: 'utf8' })
      const summary = JSON.parse(summaryContent)
      
      if (summary.total) {
        return {
          lines: summary.total.lines.pct,
          statements: summary.total.statements.pct,
          functions: summary.total.functions.pct,
          branches: summary.total.branches.pct,
          coverage: `${Math.round((summary.total.lines.pct + summary.total.statements.pct + summary.total.functions.pct + summary.total.branches.pct) / 4)}%`
        }
      }
    } catch (e) {
      // Fall back to npm test output
    }
    
    const output = execSync('npm run test:unit:coverage 2>&1 | tail -50', { encoding: 'utf8' })
    
    // Parse coverage percentages from vitest output
    const lineMatch = output.match(/Lines\s+:\s+([\d.]+)%/)
    const stmtMatch = output.match(/Statements\s+:\s+([\d.]+)%/)
    const funcMatch = output.match(/Functions\s+:\s+([\d.]+)%/)
    const branchMatch = output.match(/Branches\s+:\s+([\d.]+)%/)
    
    const lines = lineMatch ? parseFloat(lineMatch[1]) : 0
    const statements = stmtMatch ? parseFloat(stmtMatch[1]) : 0
    const functions = funcMatch ? parseFloat(funcMatch[1]) : 0
    const branches = branchMatch ? parseFloat(branchMatch[1]) : 0
    
    const avg = (lines + statements + functions + branches) / 4
    
    return {
      lines,
      statements,
      functions,
      branches,
      coverage: `${Math.round(avg)}%`
    }
  } catch (e) {
    return {
      lines: 0,
      statements: 0,
      functions: 0,
      branches: 0,
      coverage: 'unable to extract'
    }
  }
}

const metrics = extractCoverageMetrics()

const summary = {
  coverage: metrics.coverage,
  byType: {
    lines: `${metrics.lines}%`,
    statements: `${metrics.statements}%`,
    functions: `${metrics.functions}%`,
    branches: `${metrics.branches}%`
  },
  goals: {
    lines: 80,
    statements: 80,
    functions: 80,
    branches: 75
  },
  status: {
    lines: metrics.lines >= 80 ? 'pass' : 'fail',
    statements: metrics.statements >= 80 ? 'pass' : 'fail',
    functions: metrics.functions >= 80 ? 'pass' : 'fail',
    branches: metrics.branches >= 75 ? 'pass' : 'fail'
  },
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))
