import * as fs from 'fs/promises'

export async function extractImportsAndTypes(filePath: string): Promise<{ imports: string[]; types: string[] }> {
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

    if (
      trimmed.startsWith('export type ') ||
      trimmed.startsWith('export interface ') ||
      trimmed.startsWith('type ') ||
      trimmed.startsWith('interface ')
    ) {
      types.push(line)
    }
  }

  return { imports, types }
}
