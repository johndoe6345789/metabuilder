import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export function generateHeaderFile(functions: FunctionInfo[], includes: string[], basename: string): string {
    const guard = `${basename.toUpperCase()}_HPP_INCLUDED`
    let content = ''

    content += `#ifndef ${guard}\n`
    content += `#define ${guard}\n\n`

    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }

    const namespace = functions[0]?.namespace
    if (namespace) {
      content += `namespace ${namespace} {\n\n`
    }

    for (const func of functions) {
      if (func.comments.length > 0) {
        content += func.comments.join('\n') + '\n'
      }
      const constKeyword = func.isConst ? ' const' : ''
      content += `${func.returnType} ${func.name}${func.params}${constKeyword};\n\n`
    }

    if (namespace) {
      content += `} // namespace ${namespace}\n\n`
    }

    content += `#endif // ${guard}\n`

    return content
  }
