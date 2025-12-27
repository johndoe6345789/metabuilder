import * as fs from 'fs/promises'
import * as path from 'path'

import { AddTodo } from './types'

const noop: AddTodo = () => undefined

export const loadFilesFromReport = async (
  addTodo?: AddTodo,
  reportPath = path.join(process.cwd(), 'docs/todo/LAMBDA_REFACTOR_PROGRESS.md')
): Promise<string[]> => {
  const recordTodo = addTodo ?? noop

  try {
    const content = await fs.readFile(reportPath, 'utf-8')
    const files: string[] = []

    for (const line of content.split('\n')) {
      if (line.includes('### Skipped')) break
      const match = line.match(/- \[ \] `([^`]+)`/)
      if (match) {
        files.push(match[1])
      }
    }

    return files
  } catch (error) {
    recordTodo({
      file: reportPath,
      category: 'parse_error',
      severity: 'high',
      message: 'Could not load progress report - run refactor-to-lambda.ts first',
      suggestion: 'npx tsx tools/refactoring/cli/refactor-to-lambda.ts'
    })
    return []
  }
}
