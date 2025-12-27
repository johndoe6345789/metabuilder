#!/usr/bin/env tsx
/**
 * Master Refactoring Orchestrator
 * 
 * Orchestrates the complete lambda-per-file refactoring process:
 * 1. Loads files from tracking report
 * 2. Refactors in priority order
 * 3. Runs linter and fixes imports
 * 4. Runs type checking
 * 5. Updates progress report
 */

import { ASTLambdaRefactor } from '../ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { loadFilesFromReport } from './utils/load-files-from-report'
import { runCommand } from './utils/run-command'

interface FileToProcess {
  path: string
  lines: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  error?: string
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const priorityFilter = args.find(a => ['high', 'medium', 'low', 'all'].includes(a)) || 'all'
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 999
  const skipLint = args.includes('--skip-lint')
  const skipTest = args.includes('--skip-test')

  console.log('🚀 Lambda-per-File Refactoring Orchestrator\n')
  
  // Load files
  console.log('📋 Loading files from tracking report...')
  let files: FileToProcess[] = (await loadFilesFromReport()).map(file => ({
    ...file,
    status: 'pending',
  }))
  
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
  
  // Show preview
  console.log(`\n📝 Files queued:`)
  const preview = files.slice(0, 10)
  preview.forEach((f, i) => {
    console.log(`   ${i + 1}. [${f.priority.toUpperCase()}] ${f.path} (${f.lines} lines)`)
  })
  if (files.length > 10) {
    console.log(`   ... and ${files.length - 10} more`)
  }
  
  // Safety confirmation for live mode
  if (!dryRun) {
    console.log(`\n⚠️  WARNING: This will refactor ${files.length} files!`)
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 1: REFACTORING')
  console.log('='.repeat(60) + '\n')
  
  // Refactor files
  const refactor = new ASTLambdaRefactor({ dryRun, verbose: true })
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`\n[${i + 1}/${files.length}] Processing: ${file.path}`)
    
    try {
      await refactor.refactorFile(file.path)
      file.status = 'completed'
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('skipping') || errorMsg.includes('No functions')) {
        file.status = 'skipped'
        file.error = errorMsg
      } else {
        file.status = 'failed'
        file.error = errorMsg
        console.error(`  ❌ Error: ${errorMsg}`)
      }
    }
    
    // Small delay to avoid overwhelming system
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Summary
  const summary = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    skipped: files.filter(f => f.status === 'skipped').length,
    failed: files.filter(f => f.status === 'failed').length,
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('REFACTORING SUMMARY')
  console.log('='.repeat(60))
  console.log(`   ✅ Completed: ${summary.completed}`)
  console.log(`   ⏭️  Skipped: ${summary.skipped}`)
  console.log(`   ❌ Failed: ${summary.failed}`)
  console.log(`   📊 Total: ${summary.total}`)
  
  if (!dryRun && summary.completed > 0) {
    // Phase 2: Linting
    if (!skipLint) {
      console.log('\n' + '='.repeat(60))
      console.log('PHASE 2: LINTING & IMPORT FIXING')
      console.log('='.repeat(60) + '\n')
      
      console.log('🔧 Running ESLint with --fix...')
      const lintResult = await runCommand('npm run lint:fix')
      console.log(lintResult.stdout)
      if (lintResult.stderr && !lintResult.stderr.includes('warning')) {
        console.log('⚠️  Lint stderr:', lintResult.stderr)
      }
      console.log('  ✅ Linting complete')
    }
    
    // Phase 3: Type checking
    console.log('\n' + '='.repeat(60))
    console.log('PHASE 3: TYPE CHECKING')
    console.log('='.repeat(60) + '\n')
    
    console.log('🔍 Running TypeScript compiler check...')
    const typecheckResult = await runCommand('npm run typecheck')
    
    if (typecheckResult.stderr.includes('error TS')) {
      console.log('❌ Type errors detected:')
      console.log(typecheckResult.stderr.split('\n').slice(0, 20).join('\n'))
      console.log('\n⚠️  Please fix type errors before committing')
    } else {
      console.log('  ✅ No type errors')
    }
    
    // Phase 4: Testing
    if (!skipTest) {
      console.log('\n' + '='.repeat(60))
      console.log('PHASE 4: TESTING')
      console.log('='.repeat(60) + '\n')
      
      console.log('🧪 Running unit tests...')
      const testResult = await runCommand('npm run test:unit -- --run')
      
      if (testResult.stderr.includes('FAIL') || testResult.stdout.includes('FAIL')) {
        console.log('❌ Some tests failed')
        console.log(testResult.stdout.split('\n').slice(-30).join('\n'))
      } else {
        console.log('  ✅ All tests passed')
      }
    }
  }
  
  // Save detailed results
  const resultsPath = path.join(process.cwd(), 'docs/todo/REFACTOR_RESULTS.json')
  await fs.writeFile(resultsPath, JSON.stringify(files, null, 2), 'utf-8')
  console.log(`\n💾 Detailed results saved: ${resultsPath}`)
  
  // Final instructions
  console.log('\n' + '='.repeat(60))
  console.log('✨ REFACTORING COMPLETE!')
  console.log('='.repeat(60))
  
  if (dryRun) {
    console.log('\n📌 This was a DRY RUN. No files were modified.')
    console.log('   Run without --dry-run to apply changes.')
  } else {
    console.log('\n📌 Next Steps:')
    console.log('   1. Review the changes: git diff')
    console.log('   2. Fix any type errors if needed')
    console.log('   3. Run tests: npm run test:unit')
    console.log('   4. Commit: git add . && git commit -m "Refactor to lambda-per-file structure"')
  }
  
  console.log(`\n📊 Final Stats:`)
  console.log(`   Files refactored: ${summary.completed}`)
  console.log(`   Files skipped: ${summary.skipped}`)
  console.log(`   Files failed: ${summary.failed}`)
  
  if (summary.failed > 0) {
    console.log(`\n❌ Failed files:`)
    files.filter(f => f.status === 'failed').forEach(f => {
      console.log(`   - ${f.path}: ${f.error}`)
    })
  }
}

if (require.main === module) {
  main().catch(console.error)
}
