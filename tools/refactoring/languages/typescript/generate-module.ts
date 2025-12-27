import * as fs from 'fs/promises'
import * as path from 'path'
import { FunctionInfo, RefactorResult } from '../types'
import { generateTypeScriptFunctionFile } from './generate-function-file'
import { extractTypeScriptDependencies } from './extract-dependencies'
import { extractTypeScriptFunctions } from './extract-functions'

const toKebab = (name: string) => name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
const toClassName = (basename: string) => basename.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('') + 'Utils'

export const generateTypeScriptModule = async (
  filePath: string,
  options: { dryRun: boolean; log: (message: string) => void }
): Promise<RefactorResult> => {
  const result: RefactorResult = { success: false, originalFile: filePath, newFiles: [], errors: [] }

  try {
    const functions = await extractTypeScriptFunctions(filePath)
    if (functions.length === 0) {
      result.errors.push('No functions found to extract')
      return result
    }
    if (functions.length <= 2) {
      result.errors.push(`Only ${functions.length} function(s) - skipping`)
      return result
    }

    const dependencies = await extractTypeScriptDependencies(filePath)
    const dir = path.dirname(filePath)
    const basename = path.basename(filePath, path.extname(filePath))
    const functionsDir = path.join(dir, basename, 'functions')

    for (const func of functions) {
      const kebabName = toKebab(func.name)
      const funcFilePath = path.join(functionsDir, `${kebabName}.ts`)
      const content = generateTypeScriptFunctionFile(func, dependencies.imports)
      if (!options.dryRun) {
        await fs.mkdir(functionsDir, { recursive: true })
        await fs.writeFile(funcFilePath, content, 'utf-8')
      }
      result.newFiles.push(funcFilePath)
      options.log(`    ✓ ${kebabName}.ts`)
    }

    const className = toClassName(basename)
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = buildClassWrapper(className, functions)
    if (!options.dryRun) {
      await fs.writeFile(classFilePath, classContent, 'utf-8')
    }
    result.newFiles.push(classFilePath)
    options.log(`    ✓ ${className}.ts (class wrapper)`)

    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = buildIndexFile(functions, className)
    if (!options.dryRun) {
      await fs.writeFile(indexFilePath, indexContent, 'utf-8')
    }
    result.newFiles.push(indexFilePath)
    options.log(`    ✓ index.ts (re-exports)`)

    const reexportContent = `// This file has been refactored into modular functions\n` +
      `export * from './${basename}'\n`
    if (!options.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.ts`), reexportContent, 'utf-8')
    }
    options.log(`    ✓ Updated ${basename}.ts to re-export`)

    result.success = true
  } catch (error) {
    result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}

const buildClassWrapper = (className: string, functions: FunctionInfo[]): string => {
  let content = '// Auto-generated class wrapper\n\n'
  for (const func of functions) {
    const kebabName = toKebab(func.name)
    content += `import { ${func.name} } from './functions/${kebabName}'\n`
  }
  content += `\nexport class ${className} {\n`
  for (const func of functions) {
    const asyncKeyword = func.isAsync ? 'async ' : ''
    content += `  static ${asyncKeyword}${func.name}(...args: any[]) {\n`
    content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...args)\n`
    content += '  }\n\n'
  }
  content += '}\n'
  return content
}

const buildIndexFile = (functions: FunctionInfo[], className: string): string => {
  let content = '// Auto-generated re-exports\n\n'
  for (const func of functions) {
    const kebabName = toKebab(func.name)
    content += `export { ${func.name} } from './functions/${kebabName}'\n`
  }
  content += `\nexport { ${className} } from './${className}'\n`
  return content
}
