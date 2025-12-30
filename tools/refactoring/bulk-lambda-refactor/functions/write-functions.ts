import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

export async function writeFunctions(
    functions: FunctionInfo[],
    imports: string[],
    types: string[],
    functionsDir: string,
    result: RefactorResult
  ) {
    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      const funcFilePath = path.join(functionsDir, `${kebabName}.ts`)
      const content = buildFunctionContent(func, imports, types)

      await writeFileSafely(funcFilePath, content, this.dryRun)

      result.newFiles.push(funcFilePath)
      this.log(`    ✓ ${kebabName}.ts`)
    }
  }
