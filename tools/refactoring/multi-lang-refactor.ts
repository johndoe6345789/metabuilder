#!/usr/bin/env tsx
/**
 * Multi-Language Lambda Refactoring Tool
 * 
 * Supports both TypeScript and C++ refactoring into lambda-per-file structure
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
  isStatic: boolean
  isConst: boolean
  namespace?: string
  className?: string
}

interface RefactorResult {
  success: boolean
  originalFile: string
  newFiles: string[]
  errors: string[]
}

type Language = 'typescript' | 'cpp'

class MultiLanguageLambdaRefactor {
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
   * Detect language from file extension
   */
  detectLanguage(filePath: string): Language {
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.cpp' || ext === '.cc' || ext === '.cxx' || ext === '.hpp' || ext === '.h') {
      return 'cpp'
    }
    return 'typescript'
  }

  /**
   * Extract functions from TypeScript file
   */
  async extractTypeScriptFunctions(filePath: string): Promise<FunctionInfo[]> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    const functions: FunctionInfo[] = []

    const functionRegex = /^(export\s+)?(async\s+)?function\s+([a-zA-Z0-9_]+)\s*(\([^)]*\))(\s*:\s*[^{]+)?\s*\{/
    const methodRegex = /^\s*(public|private|protected)?\s*(static\s+)?(async\s+)?([a-zA-Z0-9_]+)\s*(\([^)]*\))(\s*:\s*[^{]+)?\s*\{/

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      
      const funcMatch = line.match(functionRegex)
      const methodMatch = line.match(methodRegex)
      
      if (funcMatch || methodMatch) {
        const isMethod = !!methodMatch
        const match = funcMatch || methodMatch!
        
        const isExported = funcMatch ? !!match[1] : true
        const isStatic = methodMatch ? !!match[2] : false
        const isAsync = funcMatch ? !!match[2] : !!match[3]
        const name = funcMatch ? match[3] : match[4]
        const params = funcMatch ? match[4] : match[5]
        const returnType = (funcMatch ? match[5] : match[6]) || ''

        const comments: string[] = []
        let commentLine = i - 1
        while (commentLine >= 0 && (lines[commentLine].trim().startsWith('//') || 
                                     lines[commentLine].trim().startsWith('*') ||
                                     lines[commentLine].trim().startsWith('/*'))) {
          comments.unshift(lines[commentLine])
          commentLine--
        }

        let braceCount = 1
        let bodyLines: string[] = [line]
        let j = i + 1
        
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
          isStatic,
          isConst: false,
        })

        i = j
      } else {
        i++
      }
    }

    return functions
  }

  /**
   * Extract functions from C++ file
   */
  async extractCppFunctions(filePath: string): Promise<FunctionInfo[]> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    const functions: FunctionInfo[] = []

    // Match C++ function definitions
    // ReturnType functionName(params) { or ReturnType ClassName::functionName(params) {
    const functionRegex = /^([a-zA-Z_][a-zA-Z0-9_:<>*&\s]*?)\s+([a-zA-Z_][a-zA-Z0-9_:]*)\s*(\([^)]*\))\s*(const)?\s*(noexcept)?\s*\{/
    
    let i = 0
    let currentNamespace = ''
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Track namespace
      const namespaceMatch = line.match(/^namespace\s+([a-zA-Z0-9_]+)/)
      if (namespaceMatch) {
        currentNamespace = namespaceMatch[1]
      }
      
      const funcMatch = line.match(functionRegex)
      
      if (funcMatch) {
        const returnType = funcMatch[1].trim()
        const fullName = funcMatch[2]
        const params = funcMatch[3]
        const isConst = !!funcMatch[4]
        
        // Parse class name if present (ClassName::methodName)
        const nameParts = fullName.split('::')
        const name = nameParts[nameParts.length - 1]
        const className = nameParts.length > 1 ? nameParts[0] : undefined
        const isMethod = !!className

        // Collect comments
        const comments: string[] = []
        let commentLine = i - 1
        while (commentLine >= 0 && (lines[commentLine].trim().startsWith('//') || 
                                     lines[commentLine].trim().startsWith('/*') ||
                                     lines[commentLine].trim().startsWith('*'))) {
          comments.unshift(lines[commentLine])
          commentLine--
        }

        // Find function body
        let braceCount = 1
        let bodyLines: string[] = [line]
        let j = i + 1
        
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
          isAsync: false, // C++ doesn't have async keyword like TS
          isExported: true, // In C++, visibility is different
          params,
          returnType,
          body: bodyLines.join('\n'),
          startLine: i,
          endLine: j - 1,
          comments,
          isMethod,
          isStatic: false,
          isConst,
          namespace: currentNamespace || undefined,
          className,
        })

        i = j
      } else {
        i++
      }
    }

    return functions
  }

  /**
   * Extract imports/includes and types
   */
  async extractDependencies(filePath: string, language: Language): Promise<{ 
    imports: string[]
    types: string[] 
  }> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const imports: string[] = []
    const types: string[] = []
    
    if (language === 'typescript') {
      let inImport = false
      let currentImport = ''
      
      for (const line of lines) {
        const trimmed = line.trim()
        
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
        
        if (trimmed.startsWith('export type ') || trimmed.startsWith('export interface ') || 
            trimmed.startsWith('type ') || trimmed.startsWith('interface ')) {
          types.push(line)
        }
      }
    } else {
      // C++
      for (const line of lines) {
        const trimmed = line.trim()
        
        // Collect #include statements
        if (trimmed.startsWith('#include')) {
          imports.push(line)
        }
        
        // Collect type definitions (struct, class, using, typedef)
        if (trimmed.startsWith('struct ') || trimmed.startsWith('class ') || 
            trimmed.startsWith('using ') || trimmed.startsWith('typedef ')) {
          types.push(line)
        }
      }
    }
    
    return { imports, types }
  }

  /**
   * Generate TypeScript function file
   */
  generateTypeScriptFunctionFile(func: FunctionInfo, imports: string[]): string {
    let content = ''
    
    if (imports.length > 0) {
      content += imports.join('\n') + '\n\n'
    }
    
    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }
    
    const asyncKeyword = func.isAsync ? 'async ' : ''
    const exportKeyword = 'export '
    
    content += `${exportKeyword}${asyncKeyword}function ${func.name}${func.params}${func.returnType} {\n`
    
    const bodyLines = func.body.split('\n')
    const actualBody = bodyLines.slice(1, -1).join('\n')
    
    content += actualBody + '\n'
    content += '}\n'
    
    return content
  }

  /**
   * Generate C++ function file (.cpp)
   */
  generateCppFunctionFile(func: FunctionInfo, includes: string[]): string {
    let content = ''
    
    // Add includes
    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }
    
    // Add namespace if present
    if (func.namespace) {
      content += `namespace ${func.namespace} {\n\n`
    }
    
    // Add comments
    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }
    
    // Add function
    const constKeyword = func.isConst ? ' const' : ''
    content += `${func.returnType} ${func.name}${func.params}${constKeyword} {\n`
    
    const bodyLines = func.body.split('\n')
    const actualBody = bodyLines.slice(1, -1).join('\n')
    
    content += actualBody + '\n'
    content += '}\n'
    
    if (func.namespace) {
      content += `\n} // namespace ${func.namespace}\n`
    }
    
    return content
  }

  /**
   * Generate C++ header file (.hpp)
   */
  generateCppHeaderFile(functions: FunctionInfo[], includes: string[], basename: string): string {
    const guard = `${basename.toUpperCase()}_HPP_INCLUDED`
    let content = ''
    
    content += `#ifndef ${guard}\n`
    content += `#define ${guard}\n\n`
    
    // Add includes
    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }
    
    // Determine namespace
    const namespace = functions[0]?.namespace
    if (namespace) {
      content += `namespace ${namespace} {\n\n`
    }
    
    // Add function declarations
    for (const func of functions) {
      if (func.comments.length > 0) {
        content += func.comments.join('\n') + '\n'
      }
      const constKeyword = func.isConst ? ' const' : ''
      content += `${func.returnType} ${func.name}${func.params}${constKeyword};\n\n`
    }
    
    if (namespace) {
      content += `} // namespace ${namespace}\n\n`
    }
    
    content += `#endif // ${guard}\n`
    
    return content
  }

  /**
   * Refactor a file (auto-detects language)
   */
  async refactorFile(filePath: string): Promise<RefactorResult> {
    const result: RefactorResult = {
      success: false,
      originalFile: filePath,
      newFiles: [],
      errors: [],
    }

    try {
      const language = this.detectLanguage(filePath)
      this.log(`\n🔍 Analyzing ${filePath} (${language})...`)
      
      // Extract functions based on language
      const functions = language === 'typescript' 
        ? await this.extractTypeScriptFunctions(filePath)
        : await this.extractCppFunctions(filePath)
      
      if (functions.length === 0) {
        result.errors.push('No functions found to extract')
        return result
      }

      if (functions.length <= 2) {
        result.errors.push(`Only ${functions.length} function(s) - skipping`)
        return result
      }

      this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)
      
      // Extract dependencies
      const { imports, types } = await this.extractDependencies(filePath, language)
      
      // Create directories
      const dir = path.dirname(filePath)
      const ext = path.extname(filePath)
      const basename = path.basename(filePath, ext)
      const functionsDir = path.join(dir, basename, 'functions')
      
      if (!this.dryRun) {
        await fs.mkdir(functionsDir, { recursive: true })
      }
      
      this.log(`  Creating functions directory: ${functionsDir}`)
      
      // Generate function files
      for (const func of functions) {
        const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
        const funcExt = language === 'typescript' ? '.ts' : '.cpp'
        const funcFilePath = path.join(functionsDir, `${kebabName}${funcExt}`)
        
        const content = language === 'typescript'
          ? this.generateTypeScriptFunctionFile(func, imports)
          : this.generateCppFunctionFile(func, imports)
        
        if (!this.dryRun) {
          await fs.writeFile(funcFilePath, content, 'utf-8')
        }
        
        result.newFiles.push(funcFilePath)
        this.log(`    ✓ ${kebabName}${funcExt}`)
      }
      
      if (language === 'typescript') {
        // Generate TypeScript index and class wrapper
        await this.generateTypeScriptModule(dir, basename, functions, functionsDir, result)
      } else {
        // Generate C++ header and module files
        await this.generateCppModule(dir, basename, functions, imports, functionsDir, result)
      }
      
      result.success = true
      this.log(`  ✅ Successfully refactored into ${result.newFiles.length} files`)
      
    } catch (error) {
      result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
      this.log(`  ❌ Failed: ${result.errors[0]}`)
    }

    return result
  }

  private async generateTypeScriptModule(
    dir: string,
    basename: string,
    functions: FunctionInfo[],
    functionsDir: string,
    result: RefactorResult
  ) {
    // Generate class wrapper
    const className = basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Utils'
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = this.generateTypeScriptClassWrapper(className, functions)
    
    if (!this.dryRun) {
      await fs.writeFile(classFilePath, classContent, 'utf-8')
    }
    
    result.newFiles.push(classFilePath)
    this.log(`    ✓ ${className}.ts (class wrapper)`)
    
    // Generate index file
    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = this.generateTypeScriptIndexFile(functions, className)
    
    if (!this.dryRun) {
      await fs.writeFile(indexFilePath, indexContent, 'utf-8')
    }
    
    result.newFiles.push(indexFilePath)
    this.log(`    ✓ index.ts (re-exports)`)
    
    // Update original file
    const reexportContent = `// This file has been refactored into modular functions\n` +
                           `export * from './${basename}'\n`
    
    if (!this.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.ts`), reexportContent, 'utf-8')
    }
    
    this.log(`    ✓ Updated ${basename}.ts to re-export`)
  }

  private async generateCppModule(
    dir: string,
    basename: string,
    functions: FunctionInfo[],
    includes: string[],
    functionsDir: string,
    result: RefactorResult
  ) {
    // Generate header file
    const headerFilePath = path.join(dir, basename, `${basename}.hpp`)
    const headerContent = this.generateCppHeaderFile(functions, includes, basename)
    
    if (!this.dryRun) {
      await fs.writeFile(headerFilePath, headerContent, 'utf-8')
    }
    
    result.newFiles.push(headerFilePath)
    this.log(`    ✓ ${basename}.hpp (header)`)
    
    // Update original file to include the new header
    const includeContent = `// This file has been refactored into modular functions\n` +
                          `#include "${basename}/${basename}.hpp"\n`
    
    if (!this.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.cpp`), includeContent, 'utf-8')
    }
    
    this.log(`    ✓ Updated ${basename}.cpp to include header`)
  }

  private generateTypeScriptClassWrapper(className: string, functions: FunctionInfo[]): string {
    let content = '// Auto-generated class wrapper\n\n'
    
    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `import { ${func.name} } from './functions/${kebabName}'\n`
    }
    
    content += `\nexport class ${className} {\n`
    
    for (const func of functions) {
      const asyncKeyword = func.isAsync ? 'async ' : ''
      content += `  static ${asyncKeyword}${func.name}(...args: any[]) {\n`
      content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...args)\n`
      content += `  }\n\n`
    }
    
    content += '}\n'
    
    return content
  }

  private generateTypeScriptIndexFile(functions: FunctionInfo[], className: string): string {
    let content = '// Auto-generated re-exports\n\n'
    
    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `export { ${func.name} } from './functions/${kebabName}'\n`
    }
    
    content += `\nexport { ${className} } from './${className}'\n`
    
    return content
  }

  async bulkRefactor(files: string[]): Promise<RefactorResult[]> {
    console.log(`\n📦 Multi-Language Lambda Refactoring`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files: ${files.length}\n`)

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
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    
    return results
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log('Multi-Language Lambda Refactoring Tool\n')
    console.log('Supports: TypeScript (.ts, .tsx) and C++ (.cpp, .hpp, .cc, .h)\n')
    console.log('Usage: tsx multi-lang-refactor.ts [options] <file>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview without writing')
    console.log('  -v, --verbose    Verbose output')
    console.log('  -h, --help       Show help')
    console.log('\nExamples:')
    console.log('  tsx multi-lang-refactor.ts --dry-run src/utils.ts')
    console.log('  tsx multi-lang-refactor.ts --verbose dbal/src/adapter.cpp')
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const files = args.filter(a => !a.startsWith('-'))

  if (files.length === 0) {
    console.error('Error: Please provide file(s) to refactor')
    process.exit(1)
  }

  const refactor = new MultiLanguageLambdaRefactor({ dryRun, verbose })
  await refactor.bulkRefactor(files)

  console.log('\n✨ Done!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { MultiLanguageLambdaRefactor }
