#!/usr/bin/env tsx
/**
 * Batch Refactor All Large Files
 * 
 * Processes all files from the tracking report in priority order
 */

import { BulkLambdaRefactor } from '../bulk-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'

interface FileToRefactor {
  path: string
  lines: number
  category: string
  priority: 'high' | 'medium' | 'low'
}

async function loadFilesFromReport(): Promise<FileToRefactor[]> {
  const reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
  const content = await fs.readFile(reportPath, 'utf-8')
  
  const files: FileToRefactor[] = []
  const lines = content.split('\n')
  
  let currentPriority: 'high' | 'medium' | 'low' = 'high'
  
  for (const line of lines) {
    if (line.includes('### High Priority')) currentPriority = 'high'
    else if (line.includes('### Medium Priority')) currentPriority = 'medium'
    else if (line.includes('### Low Priority')) currentPriority = 'low'
    else if (line.includes('### Skipped')) break
    
    // Match checklist items: - [ ] `path/to/file.ts` (123 lines)
    const match = line.match(/- \[ \] `([^`]+)` \((\d+) lines\)/)
    if (match) {
      files.push({
        path: match[1],
        lines: parseInt(match[2], 10),
        category: currentPriority,
        priority: currentPriority,
      })
    }
  }
  
  return files
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const priorityFilter = args.find(a => ['high', 'medium', 'low', 'all'].includes(a)) || 'high'
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '999', 10)
  
  console.log('📋 Loading files from tracking report...')
  const allFiles = await loadFilesFromReport()
  
  let filesToProcess = allFiles
  if (priorityFilter !== 'all') {
    filesToProcess = allFiles.filter(f => f.priority === priorityFilter)
  }
  
  filesToProcess = filesToProcess.slice(0, limit)
  
  console.log(`\n📊 Plan:`)
  console.log(`   Priority filter: ${priorityFilter}`)
  console.log(`   Files to process: ${filesToProcess.length}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will modify files)'}`)
  
  if (filesToProcess.length === 0) {
    console.log('\n⚠️  No files to process')
    process.exit(0)
  }
  
  // Show what will be processed
  console.log(`\n📝 Files queued:`)
  for (let i = 0; i < Math.min(10, filesToProcess.length); i++) {
    console.log(`   ${i + 1}. ${filesToProcess[i].path} (${filesToProcess[i].lines} lines)`)
  }
  if (filesToProcess.length > 10) {
    console.log(`   ... and ${filesToProcess.length - 10} more`)
  }
  
  // Confirmation for live mode
  if (!dryRun) {
    console.log(`\n⚠️  WARNING: This will modify ${filesToProcess.length} files!`)
    console.log(`   Press Ctrl+C to cancel, or wait 3 seconds to continue...`)
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  
  console.log('\n🚀 Starting refactoring...\n')
  
  const refactor = new BulkLambdaRefactor({ dryRun, verbose })
  const filePaths = filesToProcess.map(f => f.path)
  
  const results = await refactor.bulkRefactor(filePaths)
  
  // Save results
  const resultsPath = path.join(process.cwd(), 'docs/todo/REFACTOR_RESULTS.json')
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log(`\n💾 Results saved to: ${resultsPath}`)
  
  // Update progress report
  console.log('\n📝 Updating progress report...')
  // TODO: Mark completed files in the report
  
  console.log('\n✅ Batch refactoring complete!')
  console.log('\nNext steps:')
  console.log('  1. Run: npm run lint:fix')
  console.log('  2. Run: npm run typecheck')
  console.log('  3. Run: npm run test:unit')
  console.log('  4. Review changes and commit')
}

if (require.main === module) {
  main().catch(console.error)
}
