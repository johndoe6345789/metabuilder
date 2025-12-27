import * as fs from 'fs/promises'
import * as path from 'path'

export type FileToProcess = {
  path: string
  lines: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  error?: string
}

export const loadFilesFromProgress = async (): Promise<FileToProcess[]> => {
  const reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
  const content = await fs.readFile(reportPath, 'utf-8')

  const files: FileToProcess[] = []
  const lines = content.split('\n')
  let currentPriority: FileToProcess['priority'] = 'high'

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
        status: 'pending'
      })
    }
  }

  return files
}
