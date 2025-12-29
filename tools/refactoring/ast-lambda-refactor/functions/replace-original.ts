import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

async function replaceOriginal(filePath: string, basename: string, className: string, sampleFunction: string) {
    const newMainContent = `/**
 * This file has been refactored into modular lambda-per-file structure.
 *
 * Import individual functions or use the class wrapper:
 * @example
 * import { ${sampleFunction} } from './${basename}'
 *
 * @example
 * import { ${className} } from './${basename}'
 * ${className}.${sampleFunction}(...)
 */

export * from './${basename}'
`

    await writeFileSafely(filePath, newMainContent, this.dryRun)
    this.log(`    ✓ Updated ${path.basename(filePath)}`)
  }
