import * as fs from 'fs/promises'
import * as path from 'path'

export async function writeFileSafely(targetPath: string, content: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    return
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, content, 'utf-8')
}
