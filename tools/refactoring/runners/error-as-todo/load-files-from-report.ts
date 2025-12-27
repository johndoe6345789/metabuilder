import * as fs from 'fs/promises'
import * as path from 'path'
import { TodoItem } from './types'

export const loadFilesFromProgressReport = async (
  onError: (todo: TodoItem) => void
): Promise<string[]> => {
  try {
    const reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
    const content = await fs.readFile(reportPath, 'utf-8')

    const files: string[] = []
    const lines = content.split('\n')

    for (const line of lines) {
      if (line.includes('### Skipped')) break
      const match = line.match(/- \[ \] `([^`]+)`/)
      if (match) {
        files.push(match[1])
      }
    }

    return files
  } catch (error) {
    onError({
      file: 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md',
      category: 'parse_error',
      severity: 'high',
      message: 'Could not load progress report - run refactor-to-lambda.ts first',
      suggestion: 'npx tsx tools/refactoring/cli/refactor-to-lambda.ts'
    })
    return []
  }
}
