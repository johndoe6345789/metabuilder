import * as fs from 'fs/promises'
import * as path from 'path'

interface FileFromReport {
  path: string
  lines: number
  priority: 'high' | 'medium' | 'low'
}

export async function loadFilesFromReport(): Promise<FileFromReport[]> {
  const reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
  const content = await fs.readFile(reportPath, 'utf-8')

  const files: FileFromReport[] = []
  const lines = content.split('\n')

  let currentPriority: 'high' | 'medium' | 'low' = 'high'

  for (const line of lines) {
    if (line.includes('### High Priority')) currentPriority = 'high'
    else if (line.includes('### Medium Priority')) currentPriority = 'medium'
    else if (line.includes('### Low Priority')) currentPriority = 'low'
    else if (line.includes('### Skipped')) break

    const match = line.match(/- \[ \] `([^`]+)` \((\d+) lines\)/)
    if (match) {
      files.push({
        path: match[1],
        lines: parseInt(match[2], 10),
        priority: currentPriority,
      })
    }
  }

  return files
}
