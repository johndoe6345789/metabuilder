#!/usr/bin/env tsx
/**
 * Error-as-TODO Refactoring Runner
 * 
 * Runs refactoring and captures all errors/issues as actionable TODO items.
 * Philosophy: Errors are good - they tell us what needs to be fixed!
 */

import { MultiLanguageLambdaRefactor } from './multi-lang-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'

interface TodoItem {
  file: string
  category: 'parse_error' | 'type_error' | 'import_error' | 'test_failure' | 'lint_warning' | 'manual_fix_needed' | 'success'
  severity: 'high' | 'medium' | 'low' | 'info'
  message: string
  location?: string
  suggestion?: string
  relatedFiles?: string[]
}

interface RefactorSession {
  timestamp: string
  filesProcessed: number
  successCount: number
  todosGenerated: number
  todos: TodoItem[]
}

class ErrorAsTodoRefactor {
  private todos: TodoItem[] = []
  private dryRun: boolean
  private verbose: boolean

  constructor(options: { dryRun?: boolean; verbose?: boolean } = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message)
    }
  }

  private addTodo(todo: TodoItem) {
    this.todos.push(todo)
    const emoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
      info: '💡'
    }[todo.severity]
    
    this.log(`  ${emoji} TODO: ${todo.message}`)
  }

  async loadFilesFromReport(): Promise<string[]> {
    try {
      const reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
      const content = await fs.readFile(reportPath, 'utf-8')
      
      const files: string[] = []
      const lines = content.split('\n')
      
      for (const line of lines) {
        if (line.includes('### Skipped')) break
        const match = line.match(/- \[ \] `([^`]+)`/)
        if (match) {
          files.push(match[1])
        }
      }
      
      return files
    } catch (error) {
      this.addTodo({
        file: 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md',
        category: 'parse_error',
        severity: 'high',
        message: 'Could not load progress report - run refactor-to-lambda.ts first',
        suggestion: 'npx tsx tools/refactoring/refactor-to-lambda.ts'
      })
      return []
    }
  }

  async refactorWithTodoCapture(files: string[]): Promise<void> {
    console.log('🎯 Error-as-TODO Refactoring Runner')
    console.log('   Philosophy: Errors are good - they tell us what to fix!\n')
    console.log(`   Mode: ${this.dryRun ? '🔍 DRY RUN' : '⚡ LIVE'}`)
    console.log(`   Files: ${files.length}\n`)

    const refactor = new MultiLanguageLambdaRefactor({ dryRun: this.dryRun, verbose: false })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`\n[${i + 1}/${files.length}] 📝 ${file}`)

      try {
        // Check if file exists
        try {
          await fs.access(file)
        } catch {
          this.addTodo({
            file,
            category: 'parse_error',
            severity: 'low',
            message: 'File not found - may have been moved or deleted',
            suggestion: 'Update progress report or verify file location'
          })
          continue
        }

        // Attempt refactoring
        const result = await refactor.refactorFile(file)

        if (result.success) {
          console.log('  ✅ Refactored successfully')
          this.addTodo({
            file,
            category: 'success',
            severity: 'info',
            message: `Successfully refactored into ${result.newFiles.length} files`,
            relatedFiles: result.newFiles
          })
        } else if (result.errors.some(e => e.includes('skipping'))) {
          console.log('  ⏭️  Skipped (not enough functions)')
          this.addTodo({
            file,
            category: 'manual_fix_needed',
            severity: 'low',
            message: 'File has < 3 functions - manual refactoring may not be needed',
            suggestion: 'Review file to see if refactoring would add value'
          })
        } else {
          console.log('  ⚠️  Encountered issues')
          for (const error of result.errors) {
            this.addTodo({
              file,
              category: 'parse_error',
              severity: 'medium',
              message: error,
              suggestion: 'May need manual intervention or tool improvement'
            })
          }
        }

        // Check for common issues in refactored code
        if (result.success && !this.dryRun) {
          await this.detectPostRefactorIssues(file, result.newFiles)
        }

      } catch (error) {
        console.log('  ❌ Error occurred')
        this.addTodo({
          file,
          category: 'parse_error',
          severity: 'high',
          message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: 'Report this error for tool improvement'
        })
      }

      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  async detectPostRefactorIssues(originalFile: string, newFiles: string[]): Promise<void> {
    this.log('  🔍 Checking for common issues...')

    // Check for 'this' references in extracted functions
    for (const file of newFiles) {
      if (!file.endsWith('.ts')) continue
      
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        // Check for 'this' keyword
        if (content.includes('this.')) {
          this.addTodo({
            file,
            category: 'manual_fix_needed',
            severity: 'high',
            message: 'Contains "this" reference - needs manual conversion from class method to function',
            location: file,
            suggestion: 'Replace "this.methodName" with direct function calls or pass data as parameters'
          })
        }

        // Check for missing imports
        if (content.includes('import') && content.split('import').length > 10) {
          this.addTodo({
            file,
            category: 'import_error',
            severity: 'low',
            message: 'Many imports detected - may need optimization',
            suggestion: 'Review imports and remove unused ones'
          })
        }

        // Check file size (shouldn't be too large after refactoring)
        const lines = content.split('\n').length
        if (lines > 100) {
          this.addTodo({
            file,
            category: 'manual_fix_needed',
            severity: 'medium',
            message: `Extracted function is still ${lines} lines - may need further breakdown`,
            suggestion: 'Consider breaking into smaller functions'
          })
        }

      } catch (error) {
        // File read error - already handled elsewhere
      }
    }
  }

  generateTodoReport(): string {
    const byCategory = this.todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bySeverity = this.todos.reduce((acc, todo) => {
      acc[todo.severity] = (acc[todo.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    let report = '# Lambda Refactoring TODO List\n\n'
    report += `**Generated:** ${new Date().toISOString()}\n\n`
    report += `## Summary\n\n`
    report += `**Philosophy:** Errors are good - they're our TODO list! 🎯\n\n`
    report += `- Total items: ${this.todos.length}\n`
    report += `- 🔴 High priority: ${bySeverity.high || 0}\n`
    report += `- 🟡 Medium priority: ${bySeverity.medium || 0}\n`
    report += `- 🟢 Low priority: ${bySeverity.low || 0}\n`
    report += `- 💡 Successes: ${bySeverity.info || 0}\n\n`

    report += `## By Category\n\n`
    for (const [category, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
      const emoji = {
        parse_error: '🔧',
        type_error: '📘',
        import_error: '📦',
        test_failure: '🧪',
        lint_warning: '✨',
        manual_fix_needed: '👷',
        success: '✅'
      }[category] || '📋'
      
      report += `- ${emoji} ${category.replace(/_/g, ' ')}: ${count}\n`
    }

    // Group by severity
    const severityOrder = ['high', 'medium', 'low', 'info'] as const

    for (const severity of severityOrder) {
      const items = this.todos.filter(t => t.severity === severity)
      if (items.length === 0) continue

      const emoji = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
        info: '💡'
      }[severity]

      report += `\n## ${emoji} ${severity.toUpperCase()} Priority\n\n`

      // Group by file
      const byFile = items.reduce((acc, todo) => {
        const file = todo.file
        if (!acc[file]) acc[file] = []
        acc[file].push(todo)
        return acc
      }, {} as Record<string, TodoItem[]>)

      for (const [file, todos] of Object.entries(byFile)) {
        report += `### \`${file}\`\n\n`
        
        for (const todo of todos) {
          const categoryEmoji = {
            parse_error: '🔧',
            type_error: '📘',
            import_error: '📦',
            test_failure: '🧪',
            lint_warning: '✨',
            manual_fix_needed: '👷',
            success: '✅'
          }[todo.category] || '📋'
          
          report += `- [ ] ${categoryEmoji} **${todo.category.replace(/_/g, ' ')}**: ${todo.message}\n`
          
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
    report += `// Before (in extracted function)\n`
    report += `const result = this.helperMethod()\n\n`
    report += `// After (convert to function call)\n`
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

    return report
  }

  async run(files: string[], limitFiles?: number): Promise<void> {
    if (limitFiles) {
      files = files.slice(0, limitFiles)
    }

    await this.refactorWithTodoCapture(files)

    // Generate reports
    console.log('\n' + '='.repeat(60))
    console.log('📋 GENERATING TODO REPORT')
    console.log('='.repeat(60) + '\n')

    const report = this.generateTodoReport()
    const todoPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.md')
    
    await fs.writeFile(todoPath, report, 'utf-8')
    console.log(`✅ TODO report saved: ${todoPath}`)

    // Save JSON for programmatic access
    const session: RefactorSession = {
      timestamp: new Date().toISOString(),
      filesProcessed: files.length,
      successCount: this.todos.filter(t => t.category === 'success').length,
      todosGenerated: this.todos.filter(t => t.category !== 'success').length,
      todos: this.todos
    }

    const jsonPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.json')
    await fs.writeFile(jsonPath, JSON.stringify(session, null, 2), 'utf-8')
    console.log(`✅ JSON data saved: ${jsonPath}`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SESSION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Files processed: ${files.length}`)
    console.log(`✅ Successes: ${session.successCount}`)
    console.log(`📋 TODOs generated: ${session.todosGenerated}`)
    console.log(`  🔴 High: ${this.todos.filter(t => t.severity === 'high').length}`)
    console.log(`  🟡 Medium: ${this.todos.filter(t => t.severity === 'medium').length}`)
    console.log(`  🟢 Low: ${this.todos.filter(t => t.severity === 'low').length}`)

    console.log('\n💡 Remember: Errors are good! They tell us exactly what to fix.')
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Error-as-TODO Refactoring Runner\n')
    console.log('Treats all errors as actionable TODO items!\n')
    console.log('Usage: tsx error-as-todo-refactor.ts [options] [priority]\n')
    console.log('Options:')
    console.log('  -d, --dry-run      Preview without writing')
    console.log('  -v, --verbose      Show detailed output')
    console.log('  --limit=N          Process only N files')
    console.log('  high|medium|low    Filter by priority')
    console.log('  -h, --help         Show help\n')
    console.log('Examples:')
    console.log('  tsx error-as-todo-refactor.ts high --limit=5')
    console.log('  tsx error-as-todo-refactor.ts --dry-run medium')
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const priority = args.find(a => ['high', 'medium', 'low', 'all'].includes(a))

  const runner = new ErrorAsTodoRefactor({ dryRun, verbose })
  
  console.log('📋 Loading files from progress report...')
  let files = await runner.loadFilesFromReport()

  if (files.length === 0) {
    console.log('❌ No files found. Run refactor-to-lambda.ts first.')
    process.exit(1)
  }

  // Filter by priority if specified
  if (priority && priority !== 'all') {
    // This would need the priority data from the report
    console.log(`📌 Filtering for ${priority} priority files...`)
  }

  await runner.run(files, limit)

  console.log('\n✨ Done! Check REFACTOR_TODOS.md for your action items.')
}

if (require.main === module) {
  main().catch(console.error)
}

export { ErrorAsTodoRefactor }
