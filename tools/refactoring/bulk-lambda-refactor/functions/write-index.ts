import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

export async function writeIndex(
    functions: FunctionInfo[],
    dir: string,
    basename: string,
    className: string,
    result: RefactorResult
  ) {
    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = buildIndexContent(functions, 'functions', className)

    await writeFileSafely(indexFilePath, indexContent, this.dryRun)

    result.newFiles.push(indexFilePath)
    this.log('    ✓ index.ts (re-exports)')
  }
