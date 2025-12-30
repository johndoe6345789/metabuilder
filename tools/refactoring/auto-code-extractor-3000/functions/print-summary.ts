import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export function printSummary(): void {
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
