import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

function generateFunctionFile(func: FunctionInfo, imports: string[]): string {
    let content = ''

    if (imports.length > 0) {
      content += imports.join('\n') + '\n\n'
    }

    if (func.comments.length > 0) {
      content += func.comments.join('\n') + '\n'
    }

    const asyncKeyword = func.isAsync ? 'async ' : ''
    const exportKeyword = 'export '

    content += `${exportKeyword}${asyncKeyword}function ${func.name}${func.params}${func.returnType} {\n`

    const bodyLines = func.body.split('\n')
    const actualBody = bodyLines.slice(1, -1).join('\n')

    content += actualBody + '\n'
    content += '}\n'

    return content
  }
