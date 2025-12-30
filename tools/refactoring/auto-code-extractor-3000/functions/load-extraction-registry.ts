import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function loadExtractionRegistry(): Promise<void> {
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
