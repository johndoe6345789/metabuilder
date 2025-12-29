import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

function generateClassWrapper(className: string, functions: FunctionInfo[]): string {
    let content = '// Auto-generated class wrapper\n\n'

    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `import { ${func.name} } from './functions/${kebabName}'\n`
    }

    content += `\nexport class ${className} {\n`

    for (const func of functions) {
      const asyncKeyword = func.isAsync ? 'async ' : ''
      content += `  static ${asyncKeyword}${func.name}(...args: Parameters<typeof ${func.name}>) {\n`
      content += `    return ${func.isAsync ? 'await ' : ''}${func.name}(...args)\n`
      content += `  }\n\n`
    }

    content += '}\n'

    return content
  }
