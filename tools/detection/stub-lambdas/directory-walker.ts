import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { StubLocation } from './patterns'
import { scanFile } from './file-scanner'
import { isCodeFile } from './patterns'

export const collectStubs = (rootDir: string): StubLocation[] => {
  const results: StubLocation[] = []

  const walkDir = (dir: string) => {
    try {
      const files = readdirSync(dir)

      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
          walkDir(fullPath)
        } else if (isCodeFile(file)) {
          scanFile(fullPath, results)
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  walkDir(rootDir)
  return results
}
