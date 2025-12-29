import * as fs from 'fs/promises'
import * as path from 'path'
import { DependencyInfo, FunctionInfo, RefactorResult } from './types'

async function generateModule(context: ModuleContext) {
    const { dir, basename, functions, result } = context
    const className = basename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Utils'
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = this.generateClassWrapper(className, functions)

    if (!this.options.dryRun) {
      await fs.writeFile(classFilePath, classContent, 'utf-8')
    }

    result.newFiles.push(classFilePath)
    this.options.log(`    ✓ ${className}.ts (class wrapper)`)

    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = this.generateIndexFile(functions, className)

    if (!this.options.dryRun) {
      await fs.writeFile(indexFilePath, indexContent, 'utf-8')
    }

    result.newFiles.push(indexFilePath)
    this.options.log(`    ✓ index.ts (re-exports)`)

    const reexportContent = `// This file has been refactored into modular functions\n` +
                           `export * from './${basename}'\n`

    if (!this.options.dryRun) {
      await fs.writeFile(path.join(dir, `${basename}.ts`), reexportContent, 'utf-8')
    }

    this.options.log(`    ✓ Updated ${basename}.ts to re-export`)
  }
