import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export async function extractDependencies(filePath: string): Promise<DependencyInfo> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')

    const imports: string[] = []
    const types: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('#include')) {
        imports.push(line)
      }

      if (trimmed.startsWith('struct ') || trimmed.startsWith('class ') ||
          trimmed.startsWith('using ') || trimmed.startsWith('typedef ')) {
        types.push(line)
      }
    }

    return { imports, types }
  }
