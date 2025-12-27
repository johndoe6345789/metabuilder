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

export class CppLambdaRefactor {
  constructor(private readonly options: { dryRun: boolean; log: (message: string) => void }) {}

  getFunctionExtension() {
    return '.cpp'
  }

  async extractFunctions(filePath: string): Promise<FunctionInfo[]> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    const functions: FunctionInfo[] = []

    const functionRegex = /^([a-zA-Z_][a-zA-Z0-9_:<>*&\s]*?)\s+([a-zA-Z_][a-zA-Z0-9_:]*)\s*(\([^)]*\))\s*(const)?\s*(noexcept)?\s*\{/

    let i = 0
    let currentNamespace = ''

    while (i < lines.length) {
      const line = lines[i]

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

        const nameParts = fullName.split('::')
        const name = nameParts[nameParts.length - 1]
        const className = nameParts.length > 1 ? nameParts[0] : undefined
        const isMethod = !!className

        const comments: string[] = []
        let commentLine = i - 1
        while (commentLine >= 0 && (lines[commentLine].trim().startsWith('//') ||
                                     lines[commentLine].trim().startsWith('/*') ||
                                     lines[commentLine].trim().startsWith('*'))) {
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
          isAsync: false,
          isExported: true,
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

  async extractDependencies(filePath: string): Promise<DependencyInfo> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')

    const imports: string[] = []
    const types: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('#include')) {
        imports.push(line)
      }

      if (trimmed.startsWith('struct ') || trimmed.startsWith('class ') ||
          trimmed.startsWith('using ') || trimmed.startsWith('typedef ')) {
        types.push(line)
      }
    }

    return { imports, types }
  }

  generateFunctionFile(func: FunctionInfo, includes: string[]): string {
    let content = ''

    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }

    if (func.namespace) {
      content += `namespace ${func.namespace} {\n\n`
    }

    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }

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

  async generateModule(context: ModuleContext) {
    const { dir, basename, functions, dependencies, result } = context
    const headerFilePath = path.join(dir, basename, `${basename}.hpp`)
    const headerContent = this.generateHeaderFile(functions, dependencies.imports, basename)

    if (!this.options.dryRun) {
      await fs.writeFile(headerFilePath, headerContent, 'utf-8')
    }

    result.newFiles.push(headerFilePath)
    this.options.log(`    ✓ ${basename}.hpp (header)`)

    const includeContent = `// This file has been refactored into modular functions\n` +
                          `#include "${basename}/${basename}.hpp"\n`

    if (!this.options.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.cpp`), includeContent, 'utf-8')
    }

    this.options.log(`    ✓ Updated ${basename}.cpp to include header`)
  }

  private generateHeaderFile(functions: FunctionInfo[], includes: string[], basename: string): string {
    const guard = `${basename.toUpperCase()}_HPP_INCLUDED`
    let content = ''

    content += `#ifndef ${guard}\n`
    content += `#define ${guard}\n\n`

    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }

    const namespace = functions[0]?.namespace
    if (namespace) {
      content += `namespace ${namespace} {\n\n`
    }

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
}
