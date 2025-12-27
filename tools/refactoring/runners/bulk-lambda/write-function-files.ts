import * as path from 'path'
import { buildFunctionContent } from '../../io/build-function-content'
import { writeFileSafely } from '../../io/write-file'
import { FunctionInfo } from '../../lambda/types'

export const writeFunctionFiles = async (
  functions: FunctionInfo[],
  imports: string[],
  types: string[],
  functionsDir: string,
  dryRun: boolean
): Promise<string[]> => {
  const newFiles: string[] = []

  for (const func of functions) {
    const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    const funcFilePath = path.join(functionsDir, `${kebabName}.ts`)
    const content = buildFunctionContent(func, imports, types)
    await writeFileSafely(funcFilePath, content, dryRun)
    newFiles.push(funcFilePath)
  }

  return newFiles
}
