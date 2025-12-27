interface MinimalFunctionInfo {
  name: string
  isAsync: boolean
}

export function buildClassWrapper(className: string, functions: MinimalFunctionInfo[], functionsDir: string): string {
  let content = ''

  content += `// Auto-generated class wrapper\n`
  for (const func of functions) {
    const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    content += `import { ${func.name} } from './${functionsDir}/${kebabName}'\n`
  }

  content += `\n/**\n * ${className} - Class wrapper for ${functions.length} functions\n` +
             ` * \n` +
             ` * This is a convenience wrapper. Prefer importing individual functions.\n` +
             ` */\n`
  content += `export class ${className} {\n`

  for (const func of functions) {
    const asyncKeyword = func.isAsync ? 'async ' : ''
    content += `  static ${asyncKeyword}${func.name}(...args: any[]) {\n`
    content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...args as any)\n`
    content += `  }\n\n`
  }

  content += '}\n'

  return content
}
