import { CodeError } from '@/types/errors'
import { ProjectFile } from '@/types/project'

export function detectImportErrors(
  file: ProjectFile,
): CodeError[] {
  const errors: CodeError[] = []
  const lines = file.content.split('\n')
  const importedNames = new Set<string>()
  const usedNames = new Set<string>()
  lines.forEach((line) => {
    if (line.trim().startsWith('import ')) {
      const m = line.match(
        /import\s+(?:{([^}]+)}|(\w+))\s+from/,
      )
      if (m) {
        if (m[1]) {
          m[1].split(',').forEach((name) => {
            importedNames.add(
              name.trim().split(' as ')[0],
            )
          })
        }
        if (m[2]) importedNames.add(m[2].trim())
      }
    } else {
      importedNames.forEach((name) => {
        if (new RegExp(`\\b${name}\\b`).test(line)) {
          usedNames.add(name)
        }
      })
    }
  })
  importedNames.forEach((name) => {
    if (!usedNames.has(name)) {
      errors.push({
        id: `import-${file.id}-${name}`,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        message: `Unused import: ${name}`,
        severity: 'warning',
        type: 'import',
      })
    }
  })
  return errors
}
