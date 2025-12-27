import { exec } from 'child_process'
import { promisify } from 'util'
import { categorizeFile } from './categorize-file'
import { FileInfo } from './types'

const execAsync = promisify(exec)

function calculatePriority(file: FileInfo): number {
  const categoryPriority = {
    library: 10,
    tool: 8,
    dbal: 6,
    component: 4,
    test: 0,
    type: 0,
    other: 2,
  }

  const base = categoryPriority[file.category as keyof typeof categoryPriority]

  if (file.lines > 1000) return base - 3
  if (file.lines > 500) return base - 1
  if (file.lines > 300) return base
  return base + 1
}

export async function findLargeFiles(rootDir: string, minLines: number = 150): Promise<FileInfo[]> {
  const { stdout } = await execAsync(
    `find ${rootDir} \\( -name "*.ts" -o -name "*.tsx" \\) ` +
      `-not -path "*/node_modules/*" ` +
      `-not -path "*/.next/*" ` +
      `-not -path "*/dist/*" ` +
      `-not -path "*/build/*" ` +
      `-exec sh -c 'lines=$(wc -l < "$1"); if [ "$lines" -gt ${minLines} ]; then echo "$lines $1"; fi' _ {} \\;`
  )

  const files: FileInfo[] = []
  for (const line of stdout.trim().split('\n').filter(Boolean)) {
    const [linesStr, filePath] = line.trim().split(' ', 2)
    const lines = parseInt(linesStr, 10)
    const category = categorizeFile(filePath)
    const fileInfo: FileInfo = {
      path: filePath.replace(rootDir + '/', ''),
      lines,
      category,
      priority: 0,
      status: category === 'test' || category === 'type' ? 'skipped' : 'pending',
      reason:
        category === 'test'
          ? 'Test files can remain large for comprehensive coverage'
          : category === 'type'
            ? 'Type definition files are typically large'
            : undefined,
    }
    fileInfo.priority = calculatePriority(fileInfo)
    files.push(fileInfo)
  }

  return files.sort((a, b) => b.priority - a.priority || b.lines - a.lines)
}
