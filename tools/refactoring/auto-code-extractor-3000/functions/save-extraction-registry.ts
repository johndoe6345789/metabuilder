import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function saveExtractionRegistry(): Promise<void> {
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
