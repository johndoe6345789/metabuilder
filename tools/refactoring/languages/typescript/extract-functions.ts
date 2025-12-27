import * as fs from 'fs/promises'
import { FunctionInfo } from '../types'

export const extractTypeScriptFunctions = async (filePath: string): Promise<FunctionInfo[]> => {
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
      const bodyLines: string[] = [line]
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
