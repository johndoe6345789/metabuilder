import { CodeError } from '@/types/errors'
import { ProjectFile } from '@/types/project'

export function detectBasicTypeErrors(
  file: ProjectFile,
): CodeError[] {
  const errors: CodeError[] = []
  if (file.language !== 'typescript') return errors
  const lines = file.content.split('\n')
  lines.forEach((line, index) => {
    if (
      line.includes('any') &&
      !line.trim().startsWith('//')
    ) {
      errors.push({
        id: `type-${file.id}-${index}`,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        line: index + 1,
        message:
          'Use of "any" type — consider a more specific type',
        severity: 'warning',
        type: 'type',
        code: line.trim(),
      })
    }
    if (/\bvar\s+/.test(line)) {
      errors.push({
        id: `lint-${file.id}-${index}`,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        line: index + 1,
        message: 'Use "const" or "let" instead of "var"',
        severity: 'warning',
        type: 'lint',
        code: line.trim(),
      })
    }
  })
  return errors
}
