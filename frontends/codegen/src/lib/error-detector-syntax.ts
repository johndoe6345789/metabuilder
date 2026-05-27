import { CodeError } from '@/types/errors'
import { ProjectFile } from '@/types/project'

export function detectSyntaxErrors(
  file: ProjectFile,
): CodeError[] {
  const errors: CodeError[] = []
  if (
    file.language !== 'typescript' &&
    file.language !== 'javascript'
  ) return errors
  const lines = file.content.split('\n')
  lines.forEach((line, index) => {
    if (
      line.includes('function') &&
      !line.includes('(') &&
      line.includes('{')
    ) {
      errors.push({
        id: `syntax-${file.id}-${index}`,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        line: index + 1,
        message: 'Function declaration missing parentheses',
        severity: 'error',
        type: 'syntax',
        code: line.trim(),
      })
    }
    const open = (line.match(/{/g) || []).length
    const close = (line.match(/}/g) || []).length
    if (open !== close && !line.trim().startsWith('//')) {
      const next = lines[index + 1]
      if (next && !next.includes('}') && !next.includes('{')) {
        errors.push({
          id: `syntax-${file.id}-${index}`,
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          line: index + 1,
          message: 'Possible unbalanced braces',
          severity: 'warning',
          type: 'syntax',
          code: line.trim(),
        })
      }
    }
  })
  return errors
}
