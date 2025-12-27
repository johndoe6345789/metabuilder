#!/usr/bin/env tsx
/**
 * Bulk Lambda-per-File Refactoring Tool
 * 
 * Automatically refactors TypeScript files into lambda-per-file structure:
 * 1. Analyzes file to extract functions/methods
 * 2. Creates functions/ subdirectory
 * 3. Extracts each function to its own file
 * 4. Creates class wrapper
 * 5. Updates imports
 * 6. Runs linter to fix issues
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface FunctionInfo {
  name: string
  isAsync: boolean
  isExported: boolean
  params: string
  returnType: string
  body: string
  startLine: number
  endLine: number
  comments: string[]
  isMethod: boolean
}

interface RefactorResult {
  success: boolean
  originalFile: string
  newFiles: string[]
  errors: string[]
}

class BulkLambdaRefactor {
  private dryRun: boolean = false
  private verbose: boolean = false

  constructor(options: { dryRun?: boolean; verbose?: boolean } = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message)
    }
  }

  /**
   * Extract functions from a TypeScript file
   */
  async extractFunctions(filePath: string): Promise<FunctionInfo[]> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    const functions: FunctionInfo[] = []

    // Simple regex-based extraction (can be improved with AST parsing)
    const functionRegex = /^(export\s+)?(async\s+)?function\s+([a-zA-Z0-9_]+)\s*(\([^)]*\))(\s*:\s*[^{]+)?\s*\{/
    const methodRegex = /^\s*(public|private|protected)?\s*(async\s+)?([a-zA-Z0-9_]+)\s*(\([^)]*\))(\s*:\s*[^{]+)?\s*\{/

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      
      // Try to match function
      const funcMatch = line.match(functionRegex)
      const methodMatch = line.match(methodRegex)
      
      if (funcMatch || methodMatch) {
        const isMethod = !!methodMatch
        const match = funcMatch || methodMatch!
        
        const isExported = !!match[1]
        const isAsync = !!(funcMatch ? match[2] : methodMatch![2])
        const name = funcMatch ? match[3] : methodMatch![3]
        const params = funcMatch ? match[4] : methodMatch![4]
        const returnType = (funcMatch ? match[5] : methodMatch![5]) || ''

        // Collect comments above function
        const comments: string[] = []
        let commentLine = i - 1
        while (commentLine >= 0 && (lines[commentLine].trim().startsWith('//') || 
                                     lines[commentLine].trim().startsWith('*') ||
                                     lines[commentLine].trim().startsWith('/*'))) {
          comments.unshift(lines[commentLine])
          commentLine--
        }

        // Find matching closing brace
        let braceCount = 1
        let bodyStart = i + 1
        let j = i
        let bodyLines: string[] = [line]
        
        // Count braces to find function end
        j++
        while (j < lines.length && braceCount > 0) {
          bodyLines.push(lines[j])
          for (const char of lines[j]) {
            if (char === '{') braceCount++
            if (char === '}') braceCount--
            if (braceCount === 0) break
          }
          j++
        }

        functions.push({
          name,
          isAsync,
          isExported,
          params,
          returnType: returnType.trim(),
          body: bodyLines.join('\n'),
          startLine: i,
          endLine: j - 1,
          comments,
          isMethod,
        })

        i = j
      } else {
        i++
      }
    }

    return functions
  }

  /**
   * Extract imports and types from original file
   */
  async extractImportsAndTypes(filePath: string): Promise<{ imports: string[]; types: string[] }> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const imports: string[] = []
    const types: string[] = []
    
    let inImport = false
    let currentImport = ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Handle multi-line imports
      if (trimmed.startsWith('import ') || inImport) {
        currentImport += line + '\n'
        if (trimmed.includes('}') || (!trimmed.includes('{') && trimmed.endsWith("'"))) {
          imports.push(currentImport.trim())
          currentImport = ''
          inImport = false
        } else {
          inImport = true
        }
      }
      
      // Extract type definitions
      if (trimmed.startsWith('export type ') || trimmed.startsWith('export interface ') || 
          trimmed.startsWith('type ') || trimmed.startsWith('interface ')) {
        types.push(line)
      }
    }
    
    return { imports, types }
  }

  /**
   * Generate individual function file
   */
  generateFunctionFile(func: FunctionInfo, imports: string[], types: string[]): string {
    let content = ''
    
    // Add relevant imports (simplified - could be smarter about which imports are needed)
    if (imports.length > 0) {
      content += imports.join('\n') + '\n\n'
    }
    
    // Add comments
    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }
    
    // Add function
    const asyncKeyword = func.isAsync ? 'async ' : ''
    const exportKeyword = 'export '
    
    content += `${exportKeyword}${asyncKeyword}function ${func.name}${func.params}${func.returnType} {\n`
    
    // Extract function body (remove first and last line which are the function declaration and closing brace)
    const bodyLines = func.body.split('\n')
    const actualBody = bodyLines.slice(1, -1).join('\n')
    
    content += actualBody + '\n'
    content += '}\n'
    
    return content
  }

  /**
   * Generate class wrapper file
   */
  generateClassWrapper(className: string, functions: FunctionInfo[], functionsDir: string): string {
    let content = ''
    
    // Import all functions
    content += `// Auto-generated class wrapper\n`
    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `import { ${func.name} } from './${functionsDir}/${kebabName}'\n`
    }
    
    content += `\n/**\n`
    content += ` * ${className} - Class wrapper for ${functions.length} functions\n`
    content += ` * \n`
    content += ` * This is a convenience wrapper. Prefer importing individual functions.\n`
    content += ` */\n`
    content += `export class ${className} {\n`
    
    // Add static methods
    for (const func of functions) {
      const asyncKeyword = func.isAsync ? 'async ' : ''
      content += `  static ${asyncKeyword}${func.name}${func.params}${func.returnType} {\n`
      content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...arguments as any)\n`
      content += `  }\n\n`
    }
    
    content += '}\n'
    
    return content
  }

  /**
   * Generate index file that re-exports everything
   */
  generateIndexFile(functions: FunctionInfo[], functionsDir: string, className: string): string {
    let content = ''
    
    content += `// Auto-generated re-exports for backward compatibility\n\n`
    
    // Re-export all functions
    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `export { ${func.name} } from './${functionsDir}/${kebabName}'\n`
    }
    
    // Re-export class wrapper
    content += `\n// Class wrapper for convenience\n`
    content += `export { ${className} } from './${className}'\n`
    
    return content
  }

  /**
   * Refactor a single file
   */
  async refactorFile(filePath: string): Promise<RefactorResult> {
    const result: RefactorResult = {
      success: false,
      originalFile: filePath,
      newFiles: [],
      errors: [],
    }

    try {
      this.log(`\n🔍 Analyzing ${filePath}...`)
      
      // Extract functions
      const functions = await this.extractFunctions(filePath)
      
      if (functions.length === 0) {
        result.errors.push('No functions found to extract')
        return result
      }

      // Skip if only 1-2 functions (not worth refactoring)
      if (functions.length <= 2) {
        result.errors.push(`Only ${functions.length} function(s) - skipping`)
        return result
      }

      this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)
      
      // Extract imports and types
      const { imports, types } = await this.extractImportsAndTypes(filePath)
      
      // Create directories
      const dir = path.dirname(filePath)
      const basename = path.basename(filePath, path.extname(filePath))
      const functionsDir = path.join(dir, basename, 'functions')
      
      if (!this.dryRun) {
        await fs.mkdir(functionsDir, { recursive: true })
      }
      
      this.log(`  Creating functions directory: ${functionsDir}`)
      
      // Generate function files
      for (const func of functions) {
        const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
        const funcFilePath = path.join(functionsDir, `${kebabName}.ts`)
        const content = this.generateFunctionFile(func, imports, types)
        
        if (!this.dryRun) {
          await fs.writeFile(funcFilePath, content, 'utf-8')
        }
        
        result.newFiles.push(funcFilePath)
        this.log(`    ✓ ${kebabName}.ts`)
      }
      
      // Generate class wrapper
      const className = basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Utils'
      const classFilePath = path.join(dir, basename, `${className}.ts`)
      const classContent = this.generateClassWrapper(className, functions, 'functions')
      
      if (!this.dryRun) {
        await fs.writeFile(classFilePath, classContent, 'utf-8')
      }
      
      result.newFiles.push(classFilePath)
      this.log(`    ✓ ${className}.ts (class wrapper)`)
      
      // Generate index file
      const indexFilePath = path.join(dir, basename, 'index.ts')
      const indexContent = this.generateIndexFile(functions, 'functions', className)
      
      if (!this.dryRun) {
        await fs.writeFile(indexFilePath, indexContent, 'utf-8')
      }
      
      result.newFiles.push(indexFilePath)
      this.log(`    ✓ index.ts (re-exports)`)
      
      // Update original file to re-export from new location
      const reexportContent = `// This file has been refactored into modular functions\n` +
                             `// Import from individual functions or use the class wrapper\n\n` +
                             `export * from './${basename}'\n`
      
      if (!this.dryRun) {
        await fs.writeFile(filePath, reexportContent, 'utf-8')
      }
      
      this.log(`    ✓ Updated ${path.basename(filePath)} to re-export`)
      
      result.success = true
      this.log(`  ✅ Successfully refactored into ${result.newFiles.length} files`)
      
    } catch (error) {
      result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
      this.log(`  ❌ Failed: ${result.errors[0]}`)
    }

    return result
  }

  /**
   * Run linter and fix imports
   */
  async runLintFix(workingDir: string): Promise<void> {
    this.log('\n🔧 Running ESLint to fix imports and formatting...')
    
    try {
      const { stdout, stderr } = await execAsync('npm run lint:fix', { cwd: workingDir })
      if (stdout) this.log(stdout)
      if (stderr) this.log(stderr)
      this.log('  ✅ Linting completed')
    } catch (error) {
      this.log(`  ⚠️  Linting had issues (may be expected): ${error}`)
    }
  }

  /**
   * Bulk refactor multiple files
   */
  async bulkRefactor(files: string[]): Promise<RefactorResult[]> {
    console.log(`\n📦 Bulk Lambda Refactoring Tool`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files to process: ${files.length}\n`)
    
    const results: RefactorResult[] = []
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[${i + 1}/${files.length}] Processing: ${file}`)
      
      const result = await this.refactorFile(file)
      results.push(result)
      
      if (result.success) {
        successCount++
      } else if (result.errors.some(e => e.includes('skipping'))) {
        skipCount++
      } else {
        errorCount++
      }
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📁 Total new files: ${results.reduce((acc, r) => acc + r.newFiles.length, 0)}`)
    
    return results
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2)
  
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const filesArg = args.find(arg => !arg.startsWith('-'))
  
  if (!filesArg && !args.includes('--help') && !args.includes('-h')) {
    console.log('Usage: tsx bulk-lambda-refactor.ts [options] <file-pattern>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview changes without writing files')
    console.log('  -v, --verbose    Show detailed output')
    console.log('  -h, --help       Show this help')
    console.log('\nExamples:')
    console.log('  tsx bulk-lambda-refactor.ts --dry-run "frontends/nextjs/src/lib/**/*.ts"')
    console.log('  tsx bulk-lambda-refactor.ts --verbose frontends/nextjs/src/lib/rendering/page/page-definition-builder.ts')
    process.exit(1)
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Bulk Lambda-per-File Refactoring Tool\n')
    console.log('Automatically refactors TypeScript files into lambda-per-file structure.')
    console.log('\nUsage: tsx bulk-lambda-refactor.ts [options] <file-pattern>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview changes without writing files')
    console.log('  -v, --verbose    Show detailed output')
    console.log('  -h, --help       Show this help')
    process.exit(0)
  }

  const refactor = new BulkLambdaRefactor({ dryRun, verbose })
  
  // For now, process single file (can be extended to glob patterns)
  const files = [filesArg!]
  
  const results = await refactor.bulkRefactor(files)
  
  if (!dryRun && results.some(r => r.success)) {
    console.log('\n🔧 Running linter to fix imports...')
    await refactor.runLintFix(process.cwd())
  }
  
  console.log('\n✨ Done!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { BulkLambdaRefactor }
