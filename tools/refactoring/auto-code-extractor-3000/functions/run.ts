import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function run(): Promise<void> {
    this.startTime = Date.now()
    
    console.log('\n' + '='.repeat(70))
    console.log('🚀 AUTO CODE EXTRACTOR 3000™')
    console.log('='.repeat(70))
    console.log('\nThe ultimate solution for automated code extraction!')
    console.log(`Mode: ${this.options.dryRun ? '🔍 DRY RUN' : '⚡ LIVE'}`)
    console.log(`Priority: ${this.options.priority.toUpperCase()}`)
    console.log(`Limit: ${this.options.limit} files`)
    console.log(`Batch Size: ${this.options.batchSize} files`)
    console.log('='.repeat(70) + '\n')

    // Load existing extraction registry
    await this.loadExtractionRegistry()

    // Phase 1: Scan and categorize
    console.log('PHASE 1: SCANNING & EXTRACTION')
    console.log('='.repeat(70) + '\n')
    
    const allFiles = await this.scanAndCategorizeFiles()
    const filesToProcess = this.filterFiles(allFiles)
    
    this.log(`Found ${allFiles.length} files exceeding 150 lines`, 'info')
    this.log(`Filtered to ${filesToProcess.length} files for extraction`, 'info')
    
    if (filesToProcess.length === 0) {
      this.log('No files to process! All done! 🎉', 'success')
      return
    }

    // Show preview
    console.log('\n📝 Files queued for extraction:')
    const preview = filesToProcess.slice(0, 10)
    preview.forEach((f, i) => {
      console.log(`   ${i + 1}. [${f.priority.toUpperCase()}] ${f.path} (${f.lines} lines)`)
    })
    if (filesToProcess.length > 10) {
      console.log(`   ... and ${filesToProcess.length - 10} more`)
    }

    // Confirm execution
    const confirmed = await this.confirmExecution(filesToProcess)
    if (!confirmed) {
      this.log('Extraction cancelled', 'warning')
      return
    }

    // Extract in batches
    this.results = filesToProcess
    
    for (let i = 0; i < filesToProcess.length; i += this.options.batchSize) {
      const batchNum = Math.floor(i / this.options.batchSize) + 1
      const totalBatches = Math.ceil(filesToProcess.length / this.options.batchSize)
      
      console.log(`\n📦 Batch ${batchNum}/${totalBatches}`)
      await this.extractBatch(filesToProcess, i)
    }

    // Post-processing
    await this.runLinting()
    await this.runTests()
    await this.saveExtractionRegistry()
    await this.updateProgressReport()
    await this.saveResults()
    
    // Final summary
    this.printSummary()
  }
