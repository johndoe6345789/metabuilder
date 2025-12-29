import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function extractBatch(files: FileToExtract[], startIdx: number): Promise<void> {
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
