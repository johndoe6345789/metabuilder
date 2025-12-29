import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

function generateIndexFile(functions: FunctionInfo[], className: string): string {
    let content = '// Auto-generated re-exports\n\n'

    for (const func of functions) {
      const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
      content += `export { ${func.name} } from './functions/${kebabName}'\n`
    }

    content += `\nexport { ${className} } from './${className}'\n`

    return content
  }
