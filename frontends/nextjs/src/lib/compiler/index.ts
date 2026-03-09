/**
 * Compiler utilities
 */

import { promises as fs } from 'fs'
import path from 'path'
import { transform } from 'esbuild'

export interface CompileOptions {
  minify?: boolean
  sourceMaps?: boolean
}

export interface CompileResult {
  code: string
  map?: string
}

/**
 * Compile JavaScript/TypeScript code using esbuild
 * 
 * @param source - Source code to compile
 * @param options - Compilation options
 * @returns Compiled code and optional source map
 */
export async function compile(source: string, options?: CompileOptions): Promise<CompileResult> {
  try {
    const result = await transform(source, {
      loader: 'ts',  // Treat as TypeScript by default
      minify: options?.minify ?? false,
      sourcemap: options?.sourceMaps ?? false,
      target: 'es2020',
      format: 'esm',
    })

    return {
      code: result.code,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      map: (result.map !== null && result.map !== undefined && result.map !== '') ? result.map : undefined,
    }
  } catch (error) {
    // Return compilation error as a comment in the code
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      code: `// Compilation Error:\n// ${errorMessage}\n\n${source}`,
    }
  }
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
