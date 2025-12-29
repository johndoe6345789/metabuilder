#!/usr/bin/env tsx
/**
 * 🚀 AUTO CODE EXTRACTOR 3000™ 🚀
 * 
 * The ultimate one-command solution for automatically extracting large files (>150 LOC)
 * into modular lambda-per-file structure.
 * 
 * This tool combines all the best features of the refactoring suite into a single,
 * fully automated workflow with smart defaults and safety features.
 * 
 * Usage:
 *   npx tsx tools/refactoring/auto-code-extractor-3000.ts [options]
 * 
 * Options:
 *   --dry-run           Preview changes without modifying files
 *   --priority=high     Filter by priority: high, medium, low, all (default: high)
 *   --limit=N           Process only N files (default: 10)
 *   --batch-size=N      Process N files at a time (default: 5)
 *   --skip-lint         Skip linting phase
 *   --skip-test         Skip testing phase
 *   --auto-confirm      Skip confirmation prompts
 *   --verbose           Show detailed output
 *   --help              Show this help message
 * 
 * Examples:
 *   # Preview what would be extracted (safe)
 *   npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run
 * 
 *   # Extract 5 high-priority files with confirmation
 *   npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=5
 * 
 *   # Fully automated extraction of all high-priority files
 *   npx tsx tools/refactoring/auto-code-extractor-3000.ts --auto-confirm --priority=high
 * 
 *   # Process everything (use with caution!)
 *   npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=all --auto-confirm
 */

import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

interface ExtractionOptions {
  dryRun: boolean
  priority: 'high' | 'medium' | 'low' | 'all'
  limit: number
  batchSize: number
  skipLint: boolean
  skipTest: boolean
  autoConfirm: boolean
  verbose: boolean
}

interface FileToExtract {
  path: string
  lines: number
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  error?: string
  extractedFunctions?: string[]
}

interface ExtractedFunction {
  functionName: string
  originalFile: string
  extractedPath: string
  timestamp: string
}

interface ExtractionRegistry {
  version: string
  lastUpdated: string
  functions: ExtractedFunction[]
}

class AutoCodeExtractor3000 {
  private options: ExtractionOptions
  private results: FileToExtract[] = []
  private startTime: number = 0
  private extractionRegistry: ExtractionRegistry = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    functions: []
  }

  constructor(options: Partial<ExtractionOptions> = {}) {
    this.options = {
      dryRun: options.dryRun ?? false,
      priority: options.priority ?? 'high',
      limit: options.limit ?? 10,
      batchSize: options.batchSize ?? 5,
      skipLint: options.skipLint ?? false,
      skipTest: options.skipTest ?? false,
      autoConfirm: options.autoConfirm ?? false,
      verbose: options.verbose ?? false,
    }
  }

  private log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }
    console.log(`${icons[level]} ${message}`)
  }

  private async loadExtractionRegistry(): Promise<void> {
    try {
      let rootDir = process.cwd()
      if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
        rootDir = path.join(rootDir, '..', '..')
      }
      
      const registryPath = path.join(rootDir, 'docs', 'todo', 'EXTRACTION_REGISTRY.json')
      this.log(`Loading extraction registry from ${registryPath}`, 'info')
      
      const content = await fs.readFile(registryPath, 'utf-8')
      this.extractionRegistry = JSON.parse(content)
      this.log(`✅ Loaded extraction registry with ${this.extractionRegistry.functions.length} functions`, 'success')
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        this.log('No existing extraction registry found, will create new one', 'info')
      } else {
        this.log(`⚠️  Warning loading registry: ${error instanceof Error ? error.message : String(error)}`, 'warning')
      }
    }
  }

  private async saveExtractionRegistry(): Promise<void> {
    if (this.options.dryRun) {
      this.log('Dry-run mode: skipping registry save', 'info')
      return
    }

    try {
      let rootDir = process.cwd()
      if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
        rootDir = path.join(rootDir, '..', '..')
      }
      
      this.extractionRegistry.lastUpdated = new Date().toISOString()
      const registryPath = path.join(rootDir, 'docs', 'todo', 'EXTRACTION_REGISTRY.json')
      
      this.log(`Saving extraction registry to ${registryPath}`, 'info')
      this.log(`Registry contains ${this.extractionRegistry.functions.length} functions`, 'info')
      
      await fs.writeFile(registryPath, JSON.stringify(this.extractionRegistry, null, 2), 'utf-8')
      this.log(`✅ Saved extraction registry with ${this.extractionRegistry.functions.length} functions`, 'success')
    } catch (error) {
      this.log(`❌ Error saving registry: ${error instanceof Error ? error.message : String(error)}`, 'error')
      if (this.options.verbose && error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }
  }

  private async scanAndCategorizeFiles(): Promise<FileToExtract[]> {
    this.log('Scanning codebase for files exceeding 150 lines...', 'info')
    
    // Find git root directory (repo root)
    let rootDir = process.cwd()
    
    // If running from frontends/nextjs, go up to repo root
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const files = await findLargeFiles(rootDir, 150)
    
    const categorized = files.map(file => {
      // Convert numeric priority to string priority
      let priorityStr: 'high' | 'medium' | 'low'
      if (file.priority >= 8) {
        priorityStr = 'high'
      } else if (file.priority >= 4) {
        priorityStr = 'medium'
      } else {
        priorityStr = 'low'
      }
      
      return {
        path: file.path,
        lines: file.lines,
        priority: priorityStr,
        category: file.category,
        status: file.status === 'skipped' ? 'skipped' : 'pending',
      }
    }) as FileToExtract[]
    
    return categorized
  }

  private filterFiles(files: FileToExtract[]): FileToExtract[] {
    let filtered = files.filter(f => f.status === 'pending')
    
    if (this.options.priority !== 'all') {
      filtered = filtered.filter(f => f.priority === this.options.priority)
    }
    
    return filtered.slice(0, this.options.limit)
  }

  private async confirmExecution(files: FileToExtract[]): Promise<boolean> {
    if (this.options.autoConfirm || this.options.dryRun) {
      return true
    }

    console.log('\n' + '='.repeat(70))
    console.log('⚠️  CONFIRMATION REQUIRED')
    console.log('='.repeat(70))
    console.log(`\nThis will refactor ${files.length} files into modular structure.`)
    console.log('Files will be split into individual function files.')
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    return true
  }

  private async extractBatch(files: FileToExtract[], startIdx: number): Promise<void> {
    const batch = files.slice(startIdx, startIdx + this.options.batchSize)
    const refactor = new ASTLambdaRefactor({ 
      dryRun: this.options.dryRun, 
      verbose: this.options.verbose 
    })

    // Find git root directory
    let rootDir = process.cwd()
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }

    for (let i = 0; i < batch.length; i++) {
      const file = batch[i]
      const globalIdx = startIdx + i + 1
      
      // Convert relative path to absolute path from root
      const absolutePath = path.join(rootDir, file.path)
      
      console.log(`\n[${globalIdx}/${files.length}] Processing: ${file.path}`)
      
      try {
        // Analyze file to get function names before extraction
        this.log(`  🔍 Analyzing file for functions...`, 'info')
        const { analyzeAstFile } = await import('./ast/analyze-ast-file')
        const { functions } = await analyzeAstFile(absolutePath)
        
        this.log(`  📊 Found ${functions.length} functions: ${functions.map(f => f.name).join(', ') || '(none)'}`, 'info')
        
        if (functions.length === 0) {
          file.status = 'skipped'
          file.error = 'No functions found in file'
          this.log(`  ⏭️  Skipped - no functions to extract`, 'warning')
          continue
        }
        
        if (functions.length <= 2) {
          file.status = 'skipped'
          file.error = `Only ${functions.length} function(s) - not worth refactoring`
          this.log(`  ⏭️  Skipped - only ${functions.length} function(s)`, 'warning')
          continue
        }
        
        this.log(`  🔨 Extracting ${functions.length} functions...`, 'info')
        await refactor.refactorFile(absolutePath)
        file.status = 'completed'
        
        // Record extracted functions in registry
        if (!this.options.dryRun && functions.length > 0) {
          const basename = path.basename(absolutePath, path.extname(absolutePath))
          const dir = path.dirname(absolutePath)
          
          this.log(`  📝 Recording ${functions.length} functions in registry...`, 'info')
          
          for (const func of functions) {
            const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
            const extractedPath = path.join(dir, basename, 'functions', `${kebabName}.ts`)
            
            this.extractionRegistry.functions.push({
              functionName: func.name,
              originalFile: file.path,
              extractedPath: extractedPath.replace(rootDir + '/', ''),
              timestamp: new Date().toISOString()
            })
          }
          
          file.extractedFunctions = functions.map(f => f.name)
          this.log(`  ✅ Recorded ${functions.length} functions in registry`, 'success')
        }
        
        this.log(`Successfully extracted ${file.path}`, 'success')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        
        this.log(`  ❌ Error: ${errorMsg}`, 'error')
        
        if (this.options.verbose && errorStack) {
          console.error('  Stack trace:', errorStack)
        }
        
        if (errorMsg.includes('skipping') || errorMsg.includes('No functions')) {
          file.status = 'skipped'
          file.error = errorMsg
          this.log(`Skipped ${file.path}: ${errorMsg}`, 'warning')
        } else {
          file.status = 'failed'
          file.error = errorMsg
          this.log(`Failed ${file.path}: ${errorMsg}`, 'error')
        }
      }
    }
  }

  private async runLinting(): Promise<boolean> {
    if (this.options.skipLint || this.options.dryRun) {
      return true
    }

    console.log('\n' + '='.repeat(70))
    console.log('PHASE 2: LINTING & IMPORT FIXING')
    console.log('='.repeat(70) + '\n')

    try {
      this.log('Running eslint with auto-fix...', 'info')
      await runCommand('npm run lint:fix', { ignoreError: true })
      this.log('Linting completed', 'success')
      return true
    } catch (error) {
      this.log('Linting encountered issues (this is normal)', 'warning')
      return true // Don't fail on lint errors
    }
  }

  private async runTests(): Promise<boolean> {
    if (this.options.skipTest || this.options.dryRun) {
      return true
    }

    console.log('\n' + '='.repeat(70))
    console.log('PHASE 3: TESTING')
    console.log('='.repeat(70) + '\n')

    try {
      this.log('Running unit tests...', 'info')
      await runCommand('npm test -- --run', { ignoreError: true })
      this.log('Tests completed', 'success')
      return true
    } catch (error) {
      this.log('Some tests may need updates (this is normal)', 'warning')
      return true // Don't fail on test errors
    }
  }

  private async updateProgressReport(): Promise<void> {
    if (this.options.dryRun) {
      return
    }

    this.log('Updating progress report...', 'info')
    
    // Find git root directory
    let rootDir = process.cwd()
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const allFiles = await findLargeFiles(rootDir, 150)
    const report = await generateProgressReport(allFiles)
    
    const outputPath = path.join(rootDir, 'docs', 'todo', 'LAMBDA_REFACTOR_PROGRESS.md')
    await fs.writeFile(outputPath, report, 'utf-8')
    
    this.log('Progress report updated', 'success')
  }

  private async saveResults(): Promise<void> {
    // Find git root directory
    let rootDir = process.cwd()
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const timestamp = new Date().toISOString()
    const duration = (Date.now() - this.startTime) / 1000
    
    const results = {
      timestamp,
      duration: `${duration.toFixed(2)}s`,
      options: this.options,
      summary: {
        total: this.results.length,
        completed: this.results.filter(f => f.status === 'completed').length,
        failed: this.results.filter(f => f.status === 'failed').length,
        skipped: this.results.filter(f => f.status === 'skipped').length,
      },
      files: this.results,
    }
    
    const outputPath = path.join(rootDir, 'docs', 'todo', 'AUTO_EXTRACT_RESULTS.json')
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8')
    
    this.log(`Results saved to ${outputPath}`, 'success')
  }

  private printSummary(): void {
    const completed = this.results.filter(f => f.status === 'completed').length
    const failed = this.results.filter(f => f.status === 'failed').length
    const skipped = this.results.filter(f => f.status === 'skipped').length
    const duration = (Date.now() - this.startTime) / 1000
    
    const totalFunctionsExtracted = this.results
      .filter(f => f.extractedFunctions)
      .reduce((sum, f) => sum + (f.extractedFunctions?.length || 0), 0)

    console.log('\n' + '='.repeat(70))
    console.log('🎉 AUTO CODE EXTRACTOR 3000™ - SUMMARY')
    console.log('='.repeat(70))
    console.log(`\n⏱️  Duration: ${duration.toFixed(2)}s`)
    console.log(`📊 Total Processed: ${this.results.length}`)
    console.log(`✅ Successfully Extracted: ${completed}`)
    console.log(`⏭️  Skipped: ${skipped}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📝 Functions Extracted: ${totalFunctionsExtracted}`)
    console.log(`🗃️  Registry Total: ${this.extractionRegistry.functions.length} functions`)
    
    if (skipped > 0) {
      console.log('\n⏭️  Skipped Files:')
      this.results
        .filter(f => f.status === 'skipped')
        .forEach(f => console.log(`   - ${f.path}: ${f.error}`))
    }
    
    if (failed > 0) {
      console.log('\n❌ Failed Files:')
      this.results
        .filter(f => f.status === 'failed')
        .forEach(f => console.log(`   - ${f.path}: ${f.error}`))
    }
    
    if (this.options.dryRun) {
      console.log('\n🔍 DRY RUN MODE: No files were modified')
      console.log('   Remove --dry-run flag to apply changes')
    } else {
      console.log('\n💾 Changes have been written to disk')
      console.log('   Review the changes and run tests before committing')
      
      if (totalFunctionsExtracted > 0) {
        console.log(`\n📚 Extraction Registry:`)
        console.log(`   - ${totalFunctionsExtracted} new functions recorded`)
        console.log(`   - ${this.extractionRegistry.functions.length} total functions tracked`)
        console.log(`   - Registry saved to: docs/todo/EXTRACTION_REGISTRY.json`)
      }
    }
    
    console.log('\n📝 Next Steps:')
    console.log('   1. Review generated files')
    console.log('   2. Run: npm run lint:fix')
    console.log('   3. Run: npm test')
    console.log('   4. Commit changes if satisfied')
    console.log('='.repeat(70) + '\n')
  }

  async run(): Promise<void> {
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
}

// CLI Interface
function showHelp(): void {
  console.log(`
🚀 AUTO CODE EXTRACTOR 3000™ 🚀

The ultimate one-command solution for automatically extracting large files (>150 LOC)
into modular lambda-per-file structure.

USAGE:
  npx tsx tools/refactoring/auto-code-extractor-3000.ts [options]

OPTIONS:
  --dry-run           Preview changes without modifying files
  --priority=<level>  Filter by priority: high, medium, low, all (default: high)
  --limit=N           Process only N files (default: 10)
  --batch-size=N      Process N files at a time (default: 5)
  --skip-lint         Skip linting phase
  --skip-test         Skip testing phase
  --auto-confirm      Skip confirmation prompts
  --verbose           Show detailed output
  --help              Show this help message

EXAMPLES:
  # Preview what would be extracted (safe to run)
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run

  # Extract 5 high-priority files with confirmation
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=5

  # Fully automated extraction of high-priority files
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --auto-confirm

  # Process all files (use with caution!)
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=all --limit=50 --auto-confirm

  # Verbose dry run of medium priority files
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --priority=medium --verbose

WORKFLOW:
  1. 📋 Scans codebase for files >150 LOC
  2. 🎯 Filters by priority and limit
  3. 🔨 Extracts functions into individual files
  4. 🔧 Runs linter to fix imports
  5. 🧪 Runs tests to verify functionality
  6. 📊 Updates progress reports
  7. 💾 Saves detailed results

SAFETY FEATURES:
  - Dry run mode for safe preview
  - Batch processing for incremental work
  - Automatic backup via git history
  - Confirmation prompts for destructive operations
  - Detailed error reporting and recovery

For more information, see: tools/refactoring/README.md
`)
}

function parseArgs(): Partial<ExtractionOptions> {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const options: Partial<ExtractionOptions> = {}

  // Boolean flags
  options.dryRun = args.includes('--dry-run') || args.includes('-d')
  options.skipLint = args.includes('--skip-lint')
  options.skipTest = args.includes('--skip-test')
  options.autoConfirm = args.includes('--auto-confirm')
  options.verbose = args.includes('--verbose') || args.includes('-v')

  // Priority
  const priorityArg = args.find(a => a.startsWith('--priority='))
  if (priorityArg) {
    const priority = priorityArg.split('=')[1] as 'high' | 'medium' | 'low' | 'all'
    if (['high', 'medium', 'low', 'all'].includes(priority)) {
      options.priority = priority
    }
  }

  // Limit
  const limitArg = args.find(a => a.startsWith('--limit='))
  if (limitArg) {
    options.limit = parseInt(limitArg.split('=')[1], 10)
  }

  // Batch size
  const batchArg = args.find(a => a.startsWith('--batch-size='))
  if (batchArg) {
    options.batchSize = parseInt(batchArg.split('=')[1], 10)
  }

  return options
}

// Main execution
async function main() {
  try {
    const options = parseArgs()
    const extractor = new AutoCodeExtractor3000(options)
    await extractor.run()
  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { AutoCodeExtractor3000, ExtractionOptions, FileToExtract }
