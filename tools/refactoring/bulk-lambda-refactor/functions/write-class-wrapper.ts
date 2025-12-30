import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

export async function writeClassWrapper(
    basename: string,
    functions: FunctionInfo[],
    dir: string,
    result: RefactorResult
  ) {
    const className = this.toClassName(basename)
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = buildClassWrapper(className, functions, 'functions')

    await writeFileSafely(classFilePath, classContent, this.dryRun)

    result.newFiles.push(classFilePath)
    this.log(`    ✓ ${className}.ts (class wrapper)`)

    return className
  }
