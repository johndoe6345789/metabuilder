import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

export async function createIndexFile(functions: AstExtractedFunction[], functionsDir: string, outputPath: string) {
    const indexContent = buildIndexContent(functions, functionsDir)
    await writeFileSafely(outputPath, indexContent, this.dryRun)
  }
