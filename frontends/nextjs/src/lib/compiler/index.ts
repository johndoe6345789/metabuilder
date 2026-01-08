/**
 * Compiler utilities
 */

import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'

export interface CompileOptions {
  minify?: boolean
  sourceMaps?: boolean
}

export interface CompileResult {
  code: string
  map?: string
}

export function compile(source: string, _options?: CompileOptions): CompileResult {
  // TODO: Implement compilation
  return { code: source }
}

export async function loadAndInjectStyles(packageId: string): Promise<string> {
  try {
    const packagePath = path.join(process.cwd(), 'packages', packageId, 'static_content', 'styles.css')
    const css = await fs.readFile(packagePath, 'utf-8')
    return css
  } catch {
    // If no styles file, return empty
    return ''
  }
}
