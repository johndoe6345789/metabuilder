import { AnalysisKind, ComponentAnalysis, Severity } from './types'

const FLAG_WEIGHTS: Record<string, number> = {
  'has-todo-comments': 20,
  'throws-not-implemented': 100,
  'only-console-log': 30,
  'returns-empty-value': 25,
  'marked-as-mock': 40,
  'component-no-jsx': 50,
  'empty-fragment': 50,
  'minimal-body': 30,
  'mock-data-return': 40
}

const JSX_COMPONENT_PATTERN = /<[A-Z]/
const EMPTY_FRAGMENT_PATTERN = /<>\s*<\/>/
const EMPTY_RETURN_PATTERN = /return\s+(null|undefined|{}\s*;)/
const MOCK_RETURN_PATTERN = /return\s+\{[^}]*\}\s*\/\/\s*(mock|stub|example|placeholder)/i
const NOT_IMPLEMENTED_PATTERN = /throw\s+new\s+Error\s*\(\s*['"]not\s+implemented/i

export function analyzeBody(
  body: string,
  name: string,
  type: AnalysisKind,
  filePath: string,
  lineNumber: number
): ComponentAnalysis {
  const lines = body.split('\n').filter(line => line.trim().length > 0)
  const returnLines = lines.filter(line => line.includes('return')).length
  const jsxLines = lines.filter(line => JSX_COMPONENT_PATTERN.test(line)).length
  const logicalLines = lines.filter(line =>
    !line.match(/^\/\//) &&
    !line.match(/^\*/) &&
    line.trim().length > 0 &&
    !line.includes('return')
  ).length

  const flags = collectFlags(body, type, jsxLines, logicalLines, returnLines)
  const completeness = calculateCompleteness(flags)
  const severity = determineSeverity(completeness)
  const summary = flags.length > 0
    ? `Potential stub: ${flags.join(', ')}`
    : `Low implementation density (${completeness}%)`

  return {
    file: filePath,
    line: lineNumber,
    name,
    type,
    returnLines,
    jsxLines,
    logicalLines,
    completeness,
    flags,
    severity,
    summary
  }
}

function collectFlags(
  body: string,
  type: AnalysisKind,
  jsxLines: number,
  logicalLines: number,
  returnLines: number
): string[] {
  const flags: string[] = []

  if (body.includes('TODO') || body.includes('FIXME')) {
    flags.push('has-todo-comments')
  }

  if (NOT_IMPLEMENTED_PATTERN.test(body)) {
    flags.push('throws-not-implemented')
  }

  if (body.includes('console.log') && logicalLines <= 1) {
    flags.push('only-console-log')
  }

  if (EMPTY_RETURN_PATTERN.test(body)) {
    flags.push('returns-empty-value')
  }

  if (body.match(/\/\/\s*(mock|stub|placeholder)/i)) {
    flags.push('marked-as-mock')
  }

  if (type === 'component' && jsxLines === 0) {
    flags.push('component-no-jsx')
  }

  if (EMPTY_FRAGMENT_PATTERN.test(body)) {
    flags.push('empty-fragment')
  }

  if (logicalLines <= 1 && returnLines === 1) {
    flags.push('minimal-body')
  }

  if (MOCK_RETURN_PATTERN.test(body)) {
    flags.push('mock-data-return')
  }

  return flags
}

function calculateCompleteness(flags: string[]): number {
  const baseCompleteness = 100

  const totalPenalty = flags.reduce((penalty, flag) => {
    const weight = FLAG_WEIGHTS[flag] ?? 0
    return penalty + weight
  }, 0)

  const completeness = baseCompleteness - totalPenalty
  return Math.max(0, Math.min(100, completeness))
}

function determineSeverity(completeness: number): Severity {
  if (completeness === 0) return 'critical'
  if (completeness < 30) return 'high'
  if (completeness < 60) return 'medium'
  if (completeness < 80) return 'low'
  return 'info'
}
