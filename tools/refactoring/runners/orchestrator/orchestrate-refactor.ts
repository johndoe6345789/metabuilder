#!/usr/bin/env tsx
import * as fs from 'fs/promises'
import * as path from 'path'
import { executeRefactorPhase } from './execute-refactor-phase'
import { FileToProcess, loadFilesFromProgress } from './load-progress-files'
import { runLintTypecheckAndTests } from './run-post-steps'

const summarize = (files: FileToProcess[]) => ({
  total: files.length,
  completed: files.filter(f => f.status === 'completed').length,
  skipped: files.filter(f => f.status === 'skipped').length,
  failed: files.filter(f => f.status === 'failed').length
})

export const orchestrateRefactor = async (args: string[]): Promise<void> => {
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const priorityFilter = args.find(a => ['high', 'medium', 'low', 'all'].includes(a)) || 'all'
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 999
  const skipLint = args.includes('--skip-lint')
  const skipTest = args.includes('--skip-test')

  console.log('🚀 Lambda-per-File Refactoring Orchestrator\n')
  console.log('📋 Loading files from tracking report...')
  let files = await loadFilesFromProgress()
  if (priorityFilter !== 'all') {
    files = files.filter(f => f.priority === priorityFilter)
  }
  files = files.slice(0, limit)

  console.log(`\n📊 Configuration:`)
  console.log(`   Priority: ${priorityFilter}`)
  console.log(`   Limit: ${limit}`)
  console.log(`   Files to process: ${files.length}`)
  console.log(`   Mode: ${dryRun ? '🔍 DRY RUN (preview only)' : '⚡ LIVE (will modify files)'}`)
  console.log(`   Skip lint: ${skipLint}`)
  console.log(`   Skip tests: ${skipTest}`)

  if (files.length === 0) {
    console.log('\n⚠️  No files to process')
    return
  }

  if (!dryRun) {
    console.log(`\n⚠️  WARNING: This will refactor ${files.length} files!`)
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  await executeRefactorPhase(files, { dryRun, verbose: true })
  const summary = summarize(files)

  console.log('\n' + '='.repeat(60))
  console.log('REFACTORING SUMMARY')
  console.log('='.repeat(60))
  console.log(`   ✅ Completed: ${summary.completed}`)
  console.log(`   ⏭️  Skipped: ${summary.skipped}`)
  console.log(`   ❌ Failed: ${summary.failed}`)
  console.log(`   📊 Total: ${summary.total}`)

  if (!dryRun && summary.completed > 0) {
    await runLintTypecheckAndTests({ skipLint, skipTest })
  }

  const resultsPath = path.join(process.cwd(), 'docs/todo/REFACTOR_RESULTS.json')
  await fs.writeFile(resultsPath, JSON.stringify(files, null, 2), 'utf-8')
  console.log(`\n💾 Detailed results saved: ${resultsPath}`)

  console.log('\n' + '='.repeat(60))
  console.log('✨ REFACTORING COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Final Stats:`)
  console.log(`   Files refactored: ${summary.completed}`)
  console.log(`   Files skipped: ${summary.skipped}`)
  console.log(`   Files failed: ${summary.failed}`)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  orchestrateRefactor(args).catch(console.error)
}
