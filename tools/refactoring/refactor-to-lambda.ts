#!/usr/bin/env ts-node
/**
 * Refactor large TypeScript files into lambda-per-file structure
 * 
 * This tool helps identify files exceeding 150 lines and tracks refactoring progress.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

interface FileInfo {
  path: string
  lines: number
  category: 'component' | 'library' | 'test' | 'tool' | 'dbal' | 'type' | 'other'
  priority: number
  status: 'pending' | 'in-progress' | 'completed' | 'skipped'
  reason?: string
}

async function countLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content.split('\n').length
  } catch {
    return 0
  }
}

function categorizeFile(filePath: string): FileInfo['category'] {
  if (filePath.includes('.test.')) return 'test'
  if (filePath.endsWith('.tsx')) return 'component'
  if (filePath.includes('/tools/')) return 'tool'
  if (filePath.includes('/dbal/')) return 'dbal'
  if (filePath.includes('/types/') || filePath.endsWith('.d.ts')) return 'type'
  if (filePath.includes('/lib/') && filePath.endsWith('.ts')) return 'library'
  return 'other'
}

function calculatePriority(file: FileInfo): number {
  // Higher priority for library files (easiest to refactor)
  // Lower priority for components (need more complex refactoring)
  // Skip tests and types
  const categoryPriority = {
    library: 10,
    tool: 8,
    dbal: 6,
    component: 4,
    test: 0, // Skip
    type: 0, // Skip
    other: 2,
  }
  
  const base = categoryPriority[file.category]
  
  // Prioritize moderately large files over extremely large ones
  // (easier to refactor step-by-step)
  if (file.lines > 1000) return base - 3
  if (file.lines > 500) return base - 1
  if (file.lines > 300) return base
  return base + 1
}

async function findLargeFiles(rootDir: string, minLines: number = 150): Promise<FileInfo[]> {
  const { stdout } = await execAsync(
    `find ${rootDir} \\( -name "*.ts" -o -name "*.tsx" \\) ` +
    `-not -path "*/node_modules/*" ` +
    `-not -path "*/.next/*" ` +
    `-not -path "*/dist/*" ` +
    `-not -path "*/build/*" ` +
    `-exec sh -c 'lines=$(wc -l < "$1"); if [ "$lines" -gt ${minLines} ]; then echo "$lines $1"; fi' _ {} \\;`
  )
  
  const files: FileInfo[] = []
  for (const line of stdout.trim().split('\n').filter(Boolean)) {
    const [linesStr, filePath] = line.trim().split(' ', 2)
    const lines = parseInt(linesStr, 10)
    const category = categorizeFile(filePath)
    const fileInfo: FileInfo = {
      path: filePath.replace(rootDir + '/', ''),
      lines,
      category,
      priority: 0,
      status: category === 'test' || category === 'type' ? 'skipped' : 'pending',
      reason: category === 'test' ? 'Test files can remain large for comprehensive coverage' :
              category === 'type' ? 'Type definition files are typically large' : undefined
    }
    fileInfo.priority = calculatePriority(fileInfo)
    files.push(fileInfo)
  }
  
  return files.sort((a, b) => b.priority - a.priority || b.lines - a.lines)
}

async function generateReport(files: FileInfo[]): Promise<string> {
  const total = files.length
  const byCategory = files.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const byStatus = files.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  let report = '# Lambda-per-File Refactoring Progress\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`
  report += `## Summary\n\n`
  report += `- **Total files > 150 lines:** ${total}\n`
  report += `- **Pending:** ${byStatus.pending || 0}\n`
  report += `- **In Progress:** ${byStatus['in-progress'] || 0}\n`
  report += `- **Completed:** ${byStatus.completed || 0}\n`
  report += `- **Skipped:** ${byStatus.skipped || 0}\n\n`
  
  report += `## By Category\n\n`
  for (const [category, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    report += `- **${category}:** ${count}\n`
  }
  
  report += `\n## Refactoring Queue\n\n`
  report += `Files are prioritized by ease of refactoring and impact.\n\n`
  
  // Group by priority
  const highPriority = files.filter(f => f.priority >= 8 && f.status === 'pending')
  const medPriority = files.filter(f => f.priority >= 4 && f.priority < 8 && f.status === 'pending')
  const lowPriority = files.filter(f => f.priority < 4 && f.status === 'pending')
  
  if (highPriority.length > 0) {
    report += `### High Priority (${highPriority.length} files)\n\n`
    report += `Library and tool files - easiest to refactor\n\n`
    for (const file of highPriority.slice(0, 20)) {
      report += `- [ ] \`${file.path}\` (${file.lines} lines)\n`
    }
    if (highPriority.length > 20) {
      report += `- ... and ${highPriority.length - 20} more\n`
    }
    report += `\n`
  }
  
  if (medPriority.length > 0) {
    report += `### Medium Priority (${medPriority.length} files)\n\n`
    report += `DBAL and component files - moderate complexity\n\n`
    for (const file of medPriority.slice(0, 20)) {
      report += `- [ ] \`${file.path}\` (${file.lines} lines)\n`
    }
    if (medPriority.length > 20) {
      report += `- ... and ${medPriority.length - 20} more\n`
    }
    report += `\n`
  }
  
  if (lowPriority.length > 0) {
    report += `### Low Priority (${lowPriority.length} files)\n\n`
    for (const file of lowPriority.slice(0, 20)) {
      report += `- [ ] \`${file.path}\` (${file.lines} lines)\n`
    }
    if (lowPriority.length > 20) {
      report += `- ... and ${lowPriority.length - 20} more\n`
    }
    report += `\n`
  }
  
  // Skipped files
  const skipped = files.filter(f => f.status === 'skipped')
  if (skipped.length > 0) {
    report += `### Skipped Files (${skipped.length})\n\n`
    report += `These files do not need refactoring:\n\n`
    for (const file of skipped.slice(0, 10)) {
      report += `- \`${file.path}\` (${file.lines} lines) - ${file.reason}\n`
    }
    if (skipped.length > 10) {
      report += `- ... and ${skipped.length - 10} more\n`
    }
    report += `\n`
  }
  
  report += `## Refactoring Patterns\n\n`
  report += `### For Library Files\n`
  report += `1. Create a \`functions/\` subdirectory\n`
  report += `2. Extract each function to its own file\n`
  report += `3. Create a class wrapper (like SchemaUtils)\n`
  report += `4. Update main file to re-export\n`
  report += `5. Verify tests still pass\n\n`
  
  report += `### For Components\n`
  report += `1. Extract hooks into separate files\n`
  report += `2. Extract sub-components\n`
  report += `3. Extract utility functions\n`
  report += `4. Keep main component < 150 lines\n\n`
  
  report += `### For DBAL Files\n`
  report += `1. Split adapters by operation type\n`
  report += `2. Extract provider implementations\n`
  report += `3. Keep interfaces separate from implementations\n\n`
  
  report += `## Example: SchemaUtils Pattern\n\n`
  report += `The \`frontends/nextjs/src/lib/schema/\` directory demonstrates the lambda-per-file pattern:\n\n`
  report += `\`\`\`\n`
  report += `schema/\n`
  report += `├── functions/\n`
  report += `│   ├── field/\n`
  report += `│   │   ├── get-field-label.ts\n`
  report += `│   │   ├── validate-field.ts\n`
  report += `│   │   └── ...\n`
  report += `│   ├── model/\n`
  report += `│   │   ├── find-model.ts\n`
  report += `│   │   └── ...\n`
  report += `│   └── index.ts (re-exports all)\n`
  report += `├── SchemaUtils.ts (class wrapper)\n`
  report += `└── schema-utils.ts (backward compat re-exports)\n`
  report += `\`\`\`\n\n`
  
  return report
}

async function main() {
  const rootDir = process.cwd()
  console.log('Scanning for TypeScript files exceeding 150 lines...')
  
  const files = await findLargeFiles(rootDir, 150)
  console.log(`Found ${files.length} files`)
  
  const report = await generateReport(files)
  
  const outputPath = path.join(rootDir, 'docs', 'todo', 'LAMBDA_REFACTOR_PROGRESS.md')
  await fs.writeFile(outputPath, report, 'utf-8')
  
  console.log(`Report generated: ${outputPath}`)
  console.log(`\nSummary:`)
  console.log(`- Total files: ${files.length}`)
  console.log(`- Pending refactor: ${files.filter(f => f.status === 'pending').length}`)
  console.log(`- Skipped: ${files.filter(f => f.status === 'skipped').length}`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { findLargeFiles, generateReport }
