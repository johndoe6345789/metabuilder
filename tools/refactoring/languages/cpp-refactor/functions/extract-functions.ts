import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export async function extractFunctions(filePath: string): Promise<FunctionInfo[]> {
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
