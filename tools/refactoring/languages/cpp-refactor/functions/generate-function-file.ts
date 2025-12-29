import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export function generateFunctionFile(func: FunctionInfo, includes: string[]): string {
    let content = ''

    if (includes.length > 0) {
      content += includes.join('\n') + '\n\n'
    }

    if (func.namespace) {
      content += `namespace ${func.namespace} {\n\n`
    }

    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }

    const constKeyword = func.isConst ? ' const' : ''
    content += `${func.returnType} ${func.name}${func.params}${constKeyword} {\n`

    const bodyLines = func.body.split('\n')
    const actualBody = bodyLines.slice(1, -1).join('\n')

    content += actualBody + '\n'
    content += '}\n'

    if (func.namespace) {
      content += `\n} // namespace ${func.namespace}\n`
    }

    return content
  }
