import { refactorAstFile } from './refactor-ast-file'

export const bulkAstRefactor = async (
  files: string[],
  options: { dryRun: boolean; verbose: boolean }
): Promise<void> => {
  console.log(`\n📦 AST-based Lambda Refactoring`)
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Files: ${files.length}\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`[${i + 1}/${files.length}] ${file}`)

    try {
      const result = await refactorAstFile(file, options)
      if (result.skipped) {
        skipCount++
      } else {
        successCount++
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`)
      errorCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ⏭️  Skipped: ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
}
