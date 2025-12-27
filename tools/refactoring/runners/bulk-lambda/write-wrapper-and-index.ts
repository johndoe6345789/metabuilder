import * as path from 'path'
import { buildClassWrapper } from '../../io/build-class-wrapper'
import { buildIndexContent } from '../../io/build-index-content'
import { writeFileSafely } from '../../io/write-file'
import { FunctionInfo } from '../../lambda/types'

export const writeWrapperAndIndex = async (
  basename: string,
  functions: FunctionInfo[],
  dir: string,
  dryRun: boolean
): Promise<{ className: string; files: string[] }> => {
  const className = basename
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Utils'

  const files: string[] = []
  const classFilePath = path.join(dir, basename, `${className}.ts`)
  const classContent = buildClassWrapper(className, functions, 'functions')
  await writeFileSafely(classFilePath, classContent, dryRun)
  files.push(classFilePath)

  const indexFilePath = path.join(dir, basename, 'index.ts')
  const indexContent = buildIndexContent(functions, 'functions', className)
  await writeFileSafely(indexFilePath, indexContent, dryRun)
  files.push(indexFilePath)

  const reexportContent = `// This file has been refactored into modular functions\n` +
    `// Import from individual functions or use the class wrapper\n\n` +
    `export * from './${basename}'\n`
  await writeFileSafely(path.join(dir, `${basename}.ts`), reexportContent, dryRun)
  files.push(path.join(dir, `${basename}.ts`))

  return { className, files }
}
