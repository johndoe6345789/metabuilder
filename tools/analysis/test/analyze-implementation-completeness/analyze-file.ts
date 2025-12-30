import { readFileSync } from 'fs'
import { extname } from 'path'
import { analyzeBody } from './analyze-body'
import { AnalysisKind, ComponentAnalysis } from './types'

const DEFINITION_PATTERN = /(?:export\s+)?(?:async\s+)?(?:function|const)\s+(\w+)\s*(?::<[^=]*>)?\s*(?:=|{)/g
const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])

export function analyzeFileContent(filePath: string): ComponentAnalysis[] {
  if (!SUPPORTED_EXTENSIONS.has(extname(filePath))) return []

  try {
    const content = readFileSync(filePath, 'utf8')
    const matches: ComponentAnalysis[] = []
    let match: RegExpExecArray | null

    while ((match = DEFINITION_PATTERN.exec(content)) !== null) {
      const [analysis, isValid] = analyzeDefinition(content, filePath, match)
      if (isValid && shouldReport(analysis)) {
        matches.push(analysis)
      }
    }

    return matches
  } catch {
    return []
  }
}

function analyzeDefinition(
  content: string,
  filePath: string,
  match: RegExpExecArray
): [ComponentAnalysis, boolean] {
  const name = match[1]
  const startIndex = match.index
  const lineNumber = content.substring(0, startIndex).split('\n').length

  const bodyRange = findBodyRange(content, startIndex)
  if (!bodyRange) {
    return [createEmptyAnalysis(name, filePath, lineNumber), false]
  }

  const { start, end } = bodyRange
  const body = content.substring(start + 1, end)
  const isComponent = name[0] === name[0].toUpperCase() && filePath.includes('component')
  const analysisType: AnalysisKind = isComponent ? 'component' : 'function'

  return [analyzeBody(body, name, analysisType, filePath, lineNumber), true]
}

function findBodyRange(content: string, startIndex: number): { start: number; end: number } | null {
  const bodyStart = content.indexOf('{', startIndex)
  if (bodyStart === -1) return null

  let braceCount = 0
  for (let i = bodyStart; i < content.length; i++) {
    if (content[i] === '{') braceCount++
    if (content[i] === '}') braceCount--
    if (braceCount === 0) {
      return { start: bodyStart, end: i }
    }
  }

  return null
}

function createEmptyAnalysis(
  name: string,
  file: string,
  line: number
): ComponentAnalysis {
  return {
    name,
    file,
    line,
    type: 'function',
    returnLines: 0,
    jsxLines: 0,
    logicalLines: 0,
    completeness: 0,
    flags: ['unparsed-body'],
    severity: 'critical',
    summary: 'Unable to parse function body'
  }
}

function shouldReport(analysis: ComponentAnalysis): boolean {
  return analysis.flags.length > 0 || analysis.completeness < 50
}
