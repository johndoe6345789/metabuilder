import { readFileSync } from 'fs'
import { StubLocation, STUB_PATTERNS } from './patterns'

export const scanFile = (filePath: string, results: StubLocation[]): void => {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const functionPattern = /(?:export\s+)?(?:async\s+)?(?:function|const)\s+(\w+)/g
    let match

    while ((match = functionPattern.exec(content)) !== null) {
      const functionName = match[1]
      const startIndex = match.index
      const lineNumber = content.substring(0, startIndex).split('\n').length

      const bodyStart = content.indexOf('{', startIndex)
      let braceCount = 0
      let bodyEnd = bodyStart

      for (let i = bodyStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++
        if (content[i] === '}') braceCount--
        if (braceCount === 0) {
          bodyEnd = i
          break
        }
      }

      const functionBody = content.substring(bodyStart, bodyEnd + 1)
      checkPatterns(functionBody, filePath, lineNumber, functionName, results)
    }

    lines.forEach((line, idx) => {
      if (line.match(/stub|placeholder|mock|not implemented|TODO.*implementation/i)) {
        results.push({
          file: filePath,
          line: idx + 1,
          type: 'todo-comment',
          name: 'Stub indicator',
          severity: 'low',
          code: line.trim()
        })
      }
    })
  } catch {
    // Skip files that can't be analyzed
  }
}

const checkPatterns = (
  body: string,
  filePath: string,
  lineNumber: number,
  name: string,
  results: StubLocation[]
): void => {
  for (const pattern of STUB_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, 'i')
    if (regex.test(body)) {
      const bodyLineNum = body.split('\n')[0]?.length > 0 ? lineNumber : lineNumber + 1

      results.push({
        file: filePath,
        line: bodyLineNum,
        type: pattern.type,
        name,
        severity: pattern.severity,
        code: body.split('\n').slice(0, 3).join('\n').substring(0, 80)
      })
    }
  }
}
