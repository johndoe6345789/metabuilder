import { analyzeAstFile } from '../../ast/analyze-ast-file'
import { createAstArtifacts } from './create-ast-artifacts'

export const refactorAstFile = async (
  filePath: string,
  options: { dryRun: boolean; verbose: boolean }
): Promise<{ created: string[]; skipped: boolean }> => {
  const { functions, imports } = await analyzeAstFile(filePath)

  if (functions.length === 0) {
    if (options.verbose) console.log('  ⏭️  No functions found - skipping')
    return { created: [], skipped: true }
  }

  if (functions.length <= 2) {
    if (options.verbose) console.log(`  ⏭️  Only ${functions.length} function(s) - skipping`)
    return { created: [], skipped: true }
  }

  if (options.verbose) {
    console.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)
  }

  const created = await createAstArtifacts(functions, imports, filePath, options.dryRun)
  if (options.verbose) console.log(`  ✅ Refactored into ${created.length} files`)

  return { created, skipped: false }
}
