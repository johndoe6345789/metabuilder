import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

type ModuleContext = {
  dir: string
  basename: string
  functions: FunctionInfo[]
  functionsDir: string
  dependencies: DependencyInfo
  result: RefactorResult
}

export class TypeScriptLambdaRefactor {
  constructor(private readonly options: { dryRun: boolean; log: (message: string) => void }) {}

  getFunctionExtension() {
    return '.ts'
  }

  async extractFunctions(filePath: string): Promise<FunctionInfo[]> {
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
          returnType,
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

  async extractDependencies(filePath: string): Promise<DependencyInfo> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')

    const imports: string[] = []
    const types: string[] = []

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

    return { imports, types }
  }

  generateFunctionFile(func: FunctionInfo, imports: string[]): string {
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

  async generateModule(context: ModuleContext) {
    const { dir, basename, functions, result } = context
    const className = basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Utils'
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = this.generateClassWrapper(className, functions)

    if (!this.options.dryRun) {
      await fs.writeFile(classFilePath, classContent, 'utf-8')
    }

    result.newFiles.push(classFilePath)
    this.options.log(`    ✓ ${className}.ts (class wrapper)`)

    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = this.generateIndexFile(functions, className)

    if (!this.options.dryRun) {
      await fs.writeFile(indexFilePath, indexContent, 'utf-8')
    }

    result.newFiles.push(indexFilePath)
    this.options.log(`    ✓ index.ts (re-exports)`)

    const reexportContent = `// This file has been refactored into modular functions\n` +
                           `export * from './${basename}'\n`

    if (!this.options.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.ts`), reexportContent, 'utf-8')
    }

    this.options.log(`    ✓ Updated ${basename}.ts to re-export`)
  }

  private generateClassWrapper(className: string, functions: FunctionInfo[]): string {
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

  private generateIndexFile(functions: FunctionInfo[], className: string): string {
    let content = '// Auto-generated re-exports\n\n'

    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `export { ${func.name} } from './functions/${kebabName}'\n`
    }

    content += `\nexport { ${className} } from './${className}'\n`

    return content
  }
}
