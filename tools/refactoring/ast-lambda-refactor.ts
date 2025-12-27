#!/usr/bin/env tsx
/**
 * AST-based Lambda Refactoring Tool
 * 
 * Uses TypeScript compiler API for accurate code analysis and transformation
 */

import * as ts from 'typescript'
import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ExtractedFunction {
  name: string
  fullText: string
  isExported: boolean
  isAsync: boolean
  leadingComments: string
  startPos: number
  endPos: number
}

interface ExtractedImport {
  fullText: string
  moduleSpecifier: string
  namedImports: string[]
}

class ASTLambdaRefactor {
  private dryRun: boolean
  private verbose: boolean

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
   * Parse TypeScript file and extract functions using AST
   */
  async analyzeFil(filePath: string): Promise<{
    functions: ExtractedFunction[]
    imports: ExtractedImport[]
    types: string[]
  }> {
    const sourceCode = await fs.readFile(filePath, 'utf-8')
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    )

    const functions: ExtractedFunction[] = []
    const imports: ExtractedImport[] = []
    const types: string[] = []

    const visit = (node: ts.Node) => {
      // Extract function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false
        const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false
        
        // Get leading comments
        const leadingComments = ts.getLeadingCommentRanges(sourceCode, node.getFullStart())
        let commentText = ''
        if (leadingComments) {
          for (const comment of leadingComments) {
            commentText += sourceCode.substring(comment.pos, comment.end) + '\n'
          }
        }

        functions.push({
          name: node.name.text,
          fullText: node.getText(sourceFile),
          isExported,
          isAsync,
          leadingComments: commentText.trim(),
          startPos: node.getStart(sourceFile),
          endPos: node.getEnd(),
        })
      }

      // Extract class methods
      if (ts.isClassDeclaration(node) && node.members) {
        for (const member of node.members) {
          if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
            const isAsync = member.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false
            
            // Get leading comments
            const leadingComments = ts.getLeadingCommentRanges(sourceCode, member.getFullStart())
            let commentText = ''
            if (leadingComments) {
              for (const comment of leadingComments) {
                commentText += sourceCode.substring(comment.pos, comment.end) + '\n'
              }
            }

            // Convert method to function
            const methodText = member.getText(sourceFile)
            const functionText = this.convertMethodToFunction(methodText, member.name.text, isAsync)

            functions.push({
              name: member.name.text,
              fullText: functionText,
              isExported: true,
              isAsync,
              leadingComments: commentText.trim(),
              startPos: member.getStart(sourceFile),
              endPos: member.getEnd(),
            })
          }
        }
      }

      // Extract imports
      if (ts.isImportDeclaration(node)) {
        const moduleSpec = (node.moduleSpecifier as ts.StringLiteral).text
        const namedImports: string[] = []
        
        if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          for (const element of node.importClause.namedBindings.elements) {
            namedImports.push(element.name.text)
          }
        }

        imports.push({
          fullText: node.getText(sourceFile),
          moduleSpecifier: moduleSpec,
          namedImports,
        })
      }

      // Extract type definitions
      if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        types.push(node.getText(sourceFile))
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    return { functions, imports, types }
  }

  /**
   * Convert a class method to a standalone function
   */
  private convertMethodToFunction(methodText: string, methodName: string, isAsync: boolean): string {
    // Remove visibility modifiers (public, private, protected)
    let funcText = methodText.replace(/^\s*(public|private|protected)\s+/, '')
    
    // Ensure it starts with async if needed
    if (isAsync && !funcText.trim().startsWith('async')) {
      funcText = 'async ' + funcText
    }
    
    // Convert method syntax to function syntax
    // "methodName(...): Type {" -> "function methodName(...): Type {"
    funcText = funcText.replace(/^(\s*)(async\s+)?([a-zA-Z0-9_]+)(\s*\([^)]*\))/, '$1$2function $3$4')
    
    return funcText
  }

  /**
   * Create individual function file with proper imports
   */
  async createFunctionFile(
    func: ExtractedFunction,
    allImports: ExtractedImport[],
    outputPath: string
  ): Promise<void> {
    let content = ''

    // Add imports (for now, include all - can be optimized to only include used imports)
    if (allImports.length > 0) {
      content += allImports.map(imp => imp.fullText).join('\n') + '\n\n'
    }

    // Add comments
    if (func.leadingComments) {
      content += func.leadingComments + '\n'
    }

    // Add function (ensure it's exported)
    let funcText = func.fullText
    if (!func.isExported && !funcText.includes('export ')) {
      funcText = 'export ' + funcText
    } else if (!funcText.includes('export ')) {
      funcText = 'export ' + funcText
    }

    content += funcText + '\n'

    if (!this.dryRun) {
      await fs.writeFile(outputPath, content, 'utf-8')
    }
  }

  /**
   * Refactor a file using AST analysis
   */
  async refactorFile(filePath: string): Promise<void> {
    this.log(`\n🔍 Analyzing ${filePath}...`)

    const { functions, imports, types } = await this.analyzeFile(filePath)

    if (functions.length === 0) {
      this.log('  ⏭️  No functions found - skipping')
      return
    }

    if (functions.length <= 2) {
      this.log(`  ⏭️  Only ${functions.length} function(s) - skipping (not worth refactoring)`)
      return
    }

    this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)

    // Create output directory structure
    const dir = path.dirname(filePath)
    const basename = path.basename(filePath, path.extname(filePath))
    const functionsDir = path.join(dir, basename, 'functions')

    if (!this.dryRun) {
      await fs.mkdir(functionsDir, { recursive: true })
    }

    this.log(`  Creating: ${functionsDir}`)

    // Create individual function files
    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      const funcFile = path.join(functionsDir, `${kebabName}.ts`)
      
      await this.createFunctionFile(func, imports, funcFile)
      this.log(`    ✓ ${kebabName}.ts`)
    }

    // Create index file for re-exports
    const indexContent = this.generateIndexFile(functions, 'functions')
    const indexPath = path.join(dir, basename, 'index.ts')
    
    if (!this.dryRun) {
      await fs.writeFile(indexPath, indexContent, 'utf-8')
    }
    this.log(`    ✓ index.ts`)

    // Create class wrapper
    const className = this.toClassName(basename)
    const classContent = this.generateClassWrapper(className, functions)
    const classPath = path.join(dir, basename, `${className}.ts`)
    
    if (!this.dryRun) {
      await fs.writeFile(classPath, classContent, 'utf-8')
    }
    this.log(`    ✓ ${className}.ts`)

    // Replace original file with re-export
    const newMainContent = `/**
 * This file has been refactored into modular lambda-per-file structure.
 * 
 * Import individual functions or use the class wrapper:
 * @example
 * import { ${functions[0].name} } from './${basename}'
 * 
 * @example
 * import { ${className} } from './${basename}'
 * ${className}.${functions[0].name}(...)
 */

export * from './${basename}'
`

    if (!this.dryRun) {
      await fs.writeFile(filePath, newMainContent, 'utf-8')
    }
    this.log(`    ✓ Updated ${path.basename(filePath)}`)

    this.log(`  ✅ Refactored into ${functions.length + 2} files`)
  }

  private toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  }

  private toClassName(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Utils'
  }

  private generateIndexFile(functions: ExtractedFunction[], functionsDir: string): string {
    let content = '// Auto-generated re-exports\n\n'
    
    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      content += `export { ${func.name} } from './${functionsDir}/${kebabName}'\n`
    }
    
    return content
  }

  private generateClassWrapper(className: string, functions: ExtractedFunction[]): string {
    let content = `// Auto-generated class wrapper\n\n`
    
    // Import all functions
    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      content += `import { ${func.name} } from './functions/${kebabName}'\n`
    }
    
    content += `\n/**\n * ${className} - Convenience class wrapper\n */\n`
    content += `export class ${className} {\n`
    
    for (const func of functions) {
      const asyncKeyword = func.isAsync ? 'async ' : ''
      content += `  static ${asyncKeyword}${func.name}(...args: any[]) {\n`
      content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...args)\n`
      content += `  }\n\n`
    }
    
    content += '}\n'
    
    return content
  }

  // Fix the typo in the method name
  async analyzeFile(filePath: string): Promise<{
    functions: ExtractedFunction[]
    imports: ExtractedImport[]
    types: string[]
  }> {
    return this.analyzeFil(filePath)
  }

  /**
   * Process multiple files
   */
  async bulkRefactor(files: string[]): Promise<void> {
    console.log(`\n📦 AST-based Lambda Refactoring`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files: ${files.length}\n`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[${i + 1}/${files.length}] ${file}`)

      try {
        await this.refactorFile(file)
        successCount++
      } catch (error) {
        if (error instanceof Error && error.message.includes('skipping')) {
          skipCount++
        } else {
          console.error(`  ❌ Error: ${error}`)
          errorCount++
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log('AST-based Lambda Refactoring Tool\n')
    console.log('Usage: tsx ast-lambda-refactor.ts [options] <file>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview without writing')
    console.log('  -v, --verbose    Verbose output')
    console.log('  -h, --help       Show help')
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const file = args.find(a => !a.startsWith('-'))

  if (!file) {
    console.error('Error: Please provide a file to refactor')
    process.exit(1)
  }

  const refactor = new ASTLambdaRefactor({ dryRun, verbose })
  await refactor.bulkRefactor([file])

  if (!dryRun) {
    console.log('\n🔧 Running linter...')
    try {
      await execAsync('npm run lint:fix')
      console.log('  ✅ Lint complete')
    } catch (e) {
      console.log('  ⚠️  Lint had warnings (may be expected)')
    }
  }

  console.log('\n✨ Done!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { ASTLambdaRefactor }
