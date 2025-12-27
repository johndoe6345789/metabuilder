import { FileInfo } from './types'

export async function generateProgressReport(files: FileInfo[]): Promise<string> {
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
