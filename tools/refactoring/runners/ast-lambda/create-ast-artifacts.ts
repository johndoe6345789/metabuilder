import * as path from 'path'
import { AstExtractedFunction, ExtractedImport } from '../../lambda/types'
import { buildAstFunctionContent } from '../../io/build-ast-function-content'
import { buildClassWrapper } from '../../io/build-class-wrapper'
import { buildIndexContent } from '../../io/build-index-content'
import { writeFileSafely } from '../../io/write-file'
import { astNameHelpers } from '../../ast/analyze-ast-file'

export const createAstArtifacts = async (
  functions: AstExtractedFunction[],
  imports: ExtractedImport[],
  filePath: string,
  dryRun: boolean
): Promise<string[]> => {
  const dir = path.dirname(filePath)
  const basename = path.basename(filePath, path.extname(filePath))
  const functionsDir = path.join(dir, basename, 'functions')
  const created: string[] = []

  for (const func of functions) {
    const kebabName = astNameHelpers.toKebabCase(func.name)
    const funcFile = path.join(functionsDir, `${kebabName}.ts`)
    const content = buildAstFunctionContent(func, imports)
    await writeFileSafely(funcFile, content, dryRun)
    created.push(funcFile)
  }

  const indexPath = path.join(dir, basename, 'index.ts')
  const indexContent = buildIndexContent(functions, 'functions')
  await writeFileSafely(indexPath, indexContent, dryRun)
  created.push(indexPath)

  const className = astNameHelpers.toClassName(basename)
  const classPath = path.join(dir, basename, `${className}.ts`)
  const classContent = buildClassWrapper(className, functions, 'functions')
  await writeFileSafely(classPath, classContent, dryRun)
  created.push(classPath)

  const reexportContent = `/**
 * This file has been refactored into modular lambda-per-file structure.
 */
\nexport * from './${basename}'\n`
  await writeFileSafely(filePath, reexportContent, dryRun)
  created.push(filePath)

  return created
}
