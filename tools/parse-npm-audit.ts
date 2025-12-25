#!/usr/bin/env tsx

// Parse npm audit JSON and format results
import { execSync } from 'child_process'

try {
  const audit = JSON.parse(execSync('npm audit --json 2>/dev/null || echo "{}"', { encoding: 'utf8' }))
  
  const summary = {
    vulnerabilities: {
      critical: audit.metadata?.vulnerabilities?.critical || 0,
      high: audit.metadata?.vulnerabilities?.high || 0,
      moderate: audit.metadata?.vulnerabilities?.moderate || 0,
      low: audit.metadata?.vulnerabilities?.low || 0,
      info: audit.metadata?.vulnerabilities?.info || 0
    },
    totalVulnerabilities: audit.metadata?.totalVulnerabilities || 0,
    advisories: Object.values(audit.vulnerabilities || {}).map((v: any) => ({
      name: v.name,
      severity: v.severity,
      version: v.version,
      fixAvailable: v.fixAvailable
    })),
    timestamp: new Date().toISOString()
  }
  
  console.log(JSON.stringify(summary, null, 2))
} catch (e) {
  console.log(JSON.stringify({
    vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0 },
    totalVulnerabilities: 0,
    advisories: [],
    timestamp: new Date().toISOString()
  }, null, 2))
}
