import { RefactorSession, TodoItem, TodoSeverity } from './types'

const severityEmoji: Record<TodoSeverity, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
  info: '💡'
}

const categoryEmoji: Record<TodoItem['category'], string> = {
  parse_error: '🔧',
  type_error: '📘',
  import_error: '📦',
  test_failure: '🧪',
  lint_warning: '✨',
  manual_fix_needed: '👷',
  success: '✅'
}

export const buildTodoReport = (todos: TodoItem[]): { session: RefactorSession; markdown: string } => {
  const byCategory = todos.reduce((acc, todo) => {
    acc[todo.category] = (acc[todo.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const bySeverity = todos.reduce((acc, todo) => {
    acc[todo.severity] = (acc[todo.severity] || 0) + 1
    return acc
  }, {} as Record<TodoSeverity, number>)

  const session: RefactorSession = {
    timestamp: new Date().toISOString(),
    filesProcessed: todos.length,
    successCount: todos.filter(t => t.category === 'success').length,
    todosGenerated: todos.filter(t => t.category !== 'success').length,
    todos
  }

  let report = '# Lambda Refactoring TODO List\n\n'
  report += `**Generated:** ${session.timestamp}\n\n`
  report += `## Summary\n\n`
  report += `**Philosophy:** Errors are good - they're our TODO list! 🎯\n\n`
  report += `- Total items: ${todos.length}\n`
  report += `- 🔴 High priority: ${bySeverity.high || 0}\n`
  report += `- 🟡 Medium priority: ${bySeverity.medium || 0}\n`
  report += `- 🟢 Low priority: ${bySeverity.low || 0}\n`
  report += `- 💡 Successes: ${bySeverity.info || 0}\n\n`

  report += `## By Category\n\n`
  for (const [category, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    const emoji = categoryEmoji[category as TodoItem['category']] || '📋'
    report += `- ${emoji} ${category.replace(/_/g, ' ')}: ${count}\n`
  }

  const severityOrder: TodoSeverity[] = ['high', 'medium', 'low', 'info']
  for (const severity of severityOrder) {
    const items = todos.filter(t => t.severity === severity)
    if (items.length === 0) continue

    report += `\n## ${severityEmoji[severity]} ${severity.toUpperCase()} Priority\n\n`
    const byFile = items.reduce((acc, todo) => {
      const file = todo.file
      if (!acc[file]) acc[file] = []
      acc[file].push(todo)
      return acc
    }, {} as Record<string, TodoItem[]>)

    for (const [file, groupedTodos] of Object.entries(byFile)) {
      report += `### \`${file}\`\n\n`
      for (const todo of groupedTodos) {
        const emoji = categoryEmoji[todo.category] || '📋'
        report += `- [ ] ${emoji} **${todo.category.replace(/_/g, ' ')}**: ${todo.message}\n`

        if (todo.location) {
          report += `  - 📍 Location: \`${todo.location}\`\n`
        }

        if (todo.suggestion) {
          report += `  - 💡 Suggestion: ${todo.suggestion}\n`
        }

        if (todo.relatedFiles && todo.relatedFiles.length > 0) {
          report += `  - 📁 Related files: ${todo.relatedFiles.length} files created\n`
        }

        report += '\n'
      }
    }
  }

  report += `\n## Quick Fixes\n\n`
  report += `### For "this" references:\n`
  report += `\`\`\`typescript\n`
  report += `import { helperMethod } from './helper-method'\n`
  report += `const result = helperMethod()\n`
  report += `\`\`\`\n\n`

  report += `### For import cleanup:\n`
  report += `\`\`\`bash\n`
  report += `npm run lint:fix\n`
  report += `\`\`\`\n\n`

  report += `### For type errors:\n`
  report += `\`\`\`bash\n`
  report += `npm run typecheck\n`
  report += `\`\`\`\n\n`

  report += `## Next Steps\n\n`
  report += `1. Address high-priority items first (${bySeverity.high || 0} items)\n`
  report += `2. Fix "this" references in extracted functions\n`
  report += `3. Run \`npm run lint:fix\` to clean up imports\n`
  report += `4. Run \`npm run typecheck\` to verify types\n`
  report += `5. Run \`npm run test:unit\` to verify functionality\n`
  report += `6. Commit working batches incrementally\n\n`

  report += `## Remember\n\n`
  report += `**Errors are good!** They're not failures - they're a TODO list telling us exactly what needs attention. ✨\n`

  return { session, markdown: report }
}
