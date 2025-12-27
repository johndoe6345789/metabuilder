#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'fs'

function generateStubReport(): string {
  let report = '# Stub Implementation Detection Report\n\n'
  
  report += '## Overview\n\n'
  report += 'This report identifies incomplete, placeholder, or stubbed implementations in the codebase.\n'
  report += 'Stubs should be replaced with real implementations before production use.\n\n'
  report += 'When scanning utility folders (like the new `tools/refactoring/runners` modules), pass the target root as the third argument to `detect-stub-implementations.ts`.\n\n'
  
  // Load pattern detection results
  if (existsSync('stub-patterns.json')) {
    try {
      const patterns = JSON.parse(readFileSync('stub-patterns.json', 'utf8'))
      
      report += '## Pattern-Based Detection Results\n\n'
      report += `**Total Stubs Found**: ${patterns.totalStubsFound}\n\n`
      
      // Severity
      report += '### By Severity\n\n'
      report += `- 🔴 **Critical**: ${patterns.bySeverity.high} (blocks production)\n`
      report += `- 🟠 **Medium**: ${patterns.bySeverity.medium} (should be fixed)\n`
      report += `- 🟡 **Low**: ${patterns.bySeverity.low} (nice to fix)\n\n`
      
      // Types
      report += '### By Type\n\n'
      for (const [type, count] of Object.entries(patterns.byType)) {
        if (count > 0) {
          report += `- **${type}**: ${count}\n`
        }
      }
      report += '\n'
      
      // Critical issues
      if (patterns.criticalIssues && patterns.criticalIssues.length > 0) {
        report += '### 🔴 Critical Stubs\n\n'
        report += 'These must be implemented before production:\n\n'
        report += '| File | Line | Function | Type |\n'
        report += '|------|------|----------|------|\n'
        patterns.criticalIssues.slice(0, 20).forEach(issue => {
          report += `| \`${issue.file}\` | ${issue.line} | \`${issue.function}\` | ${issue.type} |\n`
        })
        report += '\n'
      }
      
      // Top findings
      if (patterns.details && patterns.details.length > 0) {
        report += '### Detailed Findings\n\n'
        report += '<details><summary>Click to expand (showing first 15)</summary>\n\n'
        report += '| File | Line | Function | Type | Code Preview |\n'
        report += '|------|------|----------|------|---------------|\n'
        patterns.details.slice(0, 15).forEach(item => {
          const preview = item.code?.substring(0, 50)?.replace(/\n/g, ' ') || 'N/A'
          report += `| ${item.file} | ${item.line} | ${item.name} | ${item.type} | \`${preview}...\` |\n`
        })
        report += '\n</details>\n\n'
      }
    } catch (e) {
      report += '⚠️ Could not parse pattern detection results.\n\n'
    }
  }
  
  // Load completeness analysis
  if (existsSync('implementation-analysis.json')) {
    try {
      const completeness = JSON.parse(readFileSync('implementation-analysis.json', 'utf8'))
      
      report += '## Implementation Completeness Analysis\n\n'
      report += `**Average Completeness Score**: ${completeness.averageCompleteness}%\n\n`
      
      // Breakdown
      report += '### Completeness Levels\n\n'
      report += `- **Critical** (0% complete): ${completeness.bySeverity.critical}\n`
      report += `- **High** (10-30% complete): ${completeness.bySeverity.high}\n`
      report += `- **Medium** (40-70% complete): ${completeness.bySeverity.medium}\n`
      report += `- **Low** (80-99% complete): ${completeness.bySeverity.low}\n\n`
      
      // Flag types
      if (Object.values(completeness.flagTypes).some(v => v > 0)) {
        report += '### Common Stub Indicators\n\n'
        for (const [flag, count] of Object.entries(completeness.flagTypes)) {
          if (count > 0) {
            report += `- **${flag}**: ${count} instances\n`
          }
        }
        report += '\n'
      }
      
      // Critical stubs
      if (completeness.criticalStubs && completeness.criticalStubs.length > 0) {
        report += '### 🔴 Incomplete Implementations (0% Completeness)\n\n'
        report += '<details><summary>Click to expand</summary>\n\n'
        completeness.criticalStubs.forEach(stub => {
          report += `#### \`${stub.name}\` in \`${stub.file}:${stub.line}\`\n`
          report += `**Type**: ${stub.type}\n`
          report += `**Flags**: ${stub.flags.join(', ')}\n`
          report += `**Summary**: ${stub.summary}\n\n`
        })
        report += '</details>\n\n'
      }
    } catch (e) {
      report += '⚠️ Could not parse completeness analysis.\n\n'
    }
  }
  
  // Recommendations
  report += '## How to Fix Stub Implementations\n\n'
  
  report += '### Pattern: "Not Implemented" Errors\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function processData(data) {\n'
  report += '  throw new Error("not implemented")\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function processData(data) {\n'
  report += '  return data.map(item => transform(item))\n'
  report += '}\n'
  report += '```\n\n'
  
  report += '### Pattern: Console.log Only\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function validateEmail(email) {\n'
  report += '  console.log("validating:", email)\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function validateEmail(email: string): boolean {\n'
  report += '  return /^[^@]+@[^@]+\\.\\w+$/.test(email)\n'
  report += '}\n'
  report += '```\n\n'
  
  report += '### Pattern: Return null/undefined\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function fetchUserData(id: string) {\n'
  report += '  return null // TODO: implement API call\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export async function fetchUserData(id: string): Promise<User> {\n'
  report += '  const response = await fetch(`/api/users/${id}`)\n'
  report += '  return response.json()\n'
  report += '}\n'
  report += '```\n\n'
  
  report += '### Pattern: Placeholder Component\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function Dashboard() {\n'
  report += '  return <div>TODO: Build dashboard</div>\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function Dashboard() {\n'
  report += '  return (\n'
  report += '    <div className="dashboard">\n'
  report += '      <Header />\n'
  report += '      <MainContent />\n'
  report += '      <Sidebar />\n'
  report += '    </div>\n'
  report += '  )\n'
  report += '}\n'
  report += '```\n\n'
  
  report += '### Pattern: Mock Data\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function getUsers() {\n'
  report += '  return [ // stub data\n'
  report += '    { id: 1, name: "John" },\n'
  report += '    { id: 2, name: "Jane" }\n'
  report += '  ]\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export async function getUsers(): Promise<User[]> {\n'
  report += '  const response = await Database.query("SELECT * FROM users")\n'
  report += '  return response.map(row => new User(row))\n'
  report += '}\n'
  report += '```\n\n'
  
  report += '## Checklist for Implementation\n\n'
  report += '- [ ] All critical stubs have been implemented\n'
  report += '- [ ] Functions have proper type signatures\n'
  report += '- [ ] Components render actual content (not placeholders)\n'
  report += '- [ ] All TODO/FIXME comments reference GitHub issues\n'
  report += '- [ ] Mock data is replaced with real data sources\n'
  report += '- [ ] Error handling is in place\n'
  report += '- [ ] Functions are tested with realistic inputs\n'
  report += '- [ ] Documentation comments are added (JSDoc)\n\n'
  
  report += '## Best Practices\n\n'
  report += '1. **Never commit stubs to main** - Use feature branches and require reviews\n'
  report += '2. **Use TypeScript types** - Force implementations by using specific return types\n'
  report += '3. **Convert stubs to issues** - Don\'t use TODO in code, create GitHub issues\n'
  report += '4. **Test from the start** - Write tests before implementing\n'
  report += '5. **Use linting rules** - Configure ESLint to catch console.log and TODO\n\n'
  
  report += `---\n\n`
  report += `**Generated**: ${new Date().toISOString()}\n`
  
  return report
}

console.log(generateStubReport())
