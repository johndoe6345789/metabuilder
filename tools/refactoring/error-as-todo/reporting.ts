import * as fs from 'fs/promises'
import * as path from 'path'
import { RefactorSession, TodoItem } from './types'

const PROGRESS_PATH = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
const TODO_MARKDOWN_PATH = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.md')
const TODO_JSON_PATH = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.json')

type TodoLogger = (todo: TodoItem) => void
const sectionDivider = '\n## '

export async function loadFilesFromReport(addTodo: TodoLogger): Promise<string[]> {
  try {
    const content = await fs.readFile(PROGRESS_PATH, 'utf-8')
    const files: string[] = []
    for (const line of content.split('\n')) {
      if (line.includes('### Skipped')) break
      const match = line.match(/- \[ \] `([^`]+)`/)
      if (match) files.push(match[1])
    }
    return files
  } catch (error) {
    addTodo({
      file: PROGRESS_PATH,
      category: 'parse_error',
      severity: 'high',
      message: 'Could not load progress report - run refactor-to-lambda.ts first',
      suggestion: 'npx tsx tools/refactoring/cli/refactor-to-lambda.ts'
    })
    return []
  }
}

export function generateTodoReport(todos: TodoItem[]): string {
  const byCategory = todos.reduce<Record<string, number>>((acc, todo) => ({ ...acc, [todo.category]: (acc[todo.category] || 0) + 1 }), {})
  const bySeverity = todos.reduce<Record<string, number>>((acc, todo) => ({ ...acc, [todo.severity]: (acc[todo.severity] || 0) + 1 }), {})
  const append = (line: string) => (report += line)
  let report = '# Lambda Refactoring TODO List\n\n'
  append(`**Generated:** ${new Date().toISOString()}\n\n`)
  append('## Summary\n\n')
  append(`**Philosophy:** Errors are good - they're our TODO list! 🎯\n\n`)
  append(`- Total items: ${todos.length}\n- 🔴 High priority: ${bySeverity.high || 0}\n- 🟡 Medium priority: ${bySeverity.medium || 0}\n- 🟢 Low priority: ${bySeverity.low || 0}\n- 💡 Successes: ${bySeverity.info || 0}\n\n`)

  append('## By Category\n\n')
  for (const [category, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    const emoji = { parse_error: '🔧', type_error: '📘', import_error: '📦', test_failure: '🧪', lint_warning: '✨', manual_fix_needed: '👷', success: '✅' }[category] || '📋'
    append(`- ${emoji} ${category.replace(/_/g, ' ')}: ${count}\n`)
  }

  for (const severity of ['high', 'medium', 'low', 'info'] as const) {
    const items = todos.filter(t => t.severity === severity)
    if (items.length === 0) continue
    const emoji = { high: '🔴', medium: '🟡', low: '🟢', info: '💡' }[severity]
    append(`${sectionDivider}${emoji} ${severity.toUpperCase()} Priority\n\n`)
    const byFile = items.reduce<Record<string, TodoItem[]>>((acc, todo) => ({ ...acc, [todo.file]: [...(acc[todo.file] || []), todo] }), {})
    for (const [file, todosForFile] of Object.entries(byFile)) {
      append(`### \`${file}\`\n\n`)
      todosForFile.forEach(todo => {
        const categoryEmoji = { parse_error: '🔧', type_error: '📘', import_error: '📦', test_failure: '🧪', lint_warning: '✨', manual_fix_needed: '👷', success: '✅' }[todo.category] || '📋'
        append(`- [ ] ${categoryEmoji} **${todo.category.replace(/_/g, ' ')}**: ${todo.message}\n`)
        if (todo.location) append(`  - 📍 Location: \`${todo.location}\`\n`)
        if (todo.suggestion) append(`  - 💡 Suggestion: ${todo.suggestion}\n`)
        if (todo.relatedFiles && todo.relatedFiles.length > 0) append(`  - 📁 Related files: ${todo.relatedFiles.length} files created\n`)
        append('\n')
      })
    }
  }

  append(`${sectionDivider}Quick Fixes\n\n`)
  append(
    `### For "this" references:\n\`\`\`typescript\nconst result = this.helperMethod()\n\nimport { helperMethod } from './helper-method'\nconst result = helperMethod()\n\`\`\`\n\n` +
      '### For import cleanup:\n```bash\nnpm run lint:fix\n```\n\n' +
      '### For type errors:\n```bash\nnpm run typecheck\n```\n\n'
  )

  append('## Next Steps\n\n')
  append(`1. Address high-priority items first (${bySeverity.high || 0} items)\n2. Fix "this" references in extracted functions\n3. Run \`npm run lint:fix\` to clean up imports\n4. Run \`npm run typecheck\` to verify types\n5. Run \`npm run test:unit\` to verify functionality\n6. Commit working batches incrementally\n\n`)
  append('## Remember\n\n**Errors are good!** They\'re not failures - they\'re a TODO list telling us exactly what needs attention. ✨\n')
  return report
}

export function buildSession(filesProcessed: number, todos: TodoItem[]): RefactorSession {
  return {
    timestamp: new Date().toISOString(),
    filesProcessed,
    successCount: todos.filter(t => t.category === 'success').length,
    todosGenerated: todos.filter(t => t.category !== 'success').length,
    todos
  }
}

export async function writeReports(session: RefactorSession, markdown: string): Promise<void> {
  await fs.writeFile(TODO_MARKDOWN_PATH, markdown, 'utf-8')
  await fs.writeFile(TODO_JSON_PATH, JSON.stringify(session, null, 2), 'utf-8')
  console.log(`✅ TODO report saved: ${TODO_MARKDOWN_PATH}`)
  console.log(`✅ JSON data saved: ${TODO_JSON_PATH}`)
}
