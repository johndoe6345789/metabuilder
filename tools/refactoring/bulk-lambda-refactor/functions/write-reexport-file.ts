import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

async function writeReexportFile(filePath: string, basename: string) {
    const reexportContent = `// This file has been refactored into modular functions\\n` +
                           `// Import from individual functions or use the class wrapper\\n\\n` +
                           `export * from './${basename}'\\n`

    await writeFileSafely(filePath, reexportContent, this.dryRun)
    this.log(`    ✓ Updated ${path.basename(filePath)} to re-export`)
  }
