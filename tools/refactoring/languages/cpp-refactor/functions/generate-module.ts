import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

export async function generateModule(context: ModuleContext) {
    const { dir, basename, functions, dependencies, result } = context
    const headerFilePath = path.join(dir, basename, `${basename}.hpp`)
    const headerContent = this.generateHeaderFile(functions, dependencies.imports, basename)

    if (!this.options.dryRun) {
      await fs.writeFile(headerFilePath, headerContent, 'utf-8')
    }

    result.newFiles.push(headerFilePath)
    this.options.log(`    ✓ ${basename}.hpp (header)`)

    const includeContent = `// This file has been refactored into modular functions\n` +
                          `#include "${basename}/${basename}.hpp"\n`

    if (!this.options.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.cpp`), includeContent, 'utf-8')
    }

    this.options.log(`    ✓ Updated ${basename}.cpp to include header`)
  }
