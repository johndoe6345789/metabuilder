import { refactorAstFile } from '../ast-lambda/refactor-ast-file'
import { FileToProcess } from './load-progress-files'

export const executeRefactorPhase = async (
  files: FileToProcess[],
  options: { dryRun: boolean; verbose: boolean }
): Promise<void> => {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 1: REFACTORING')
  console.log('='.repeat(60) + '\n')

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`\n[${i + 1}/${files.length}] Processing: ${file.path}`)

    try {
      await refactorAstFile(file.path, options)
      file.status = 'completed'
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('skipping') || errorMsg.includes('No functions')) {
        file.status = 'skipped'
        file.error = errorMsg
      } else {
        file.status = 'failed'
        file.error = errorMsg
        console.error(`  ❌ Error: ${errorMsg}`)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
