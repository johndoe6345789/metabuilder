#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'

interface Options {
  root: string
  maxLines: number
  ignore: Set<string>
  outFile?: string
}

interface FileReport {
  path: string
  lines: number
  recommendation: string
}

interface Summary {
  root: string
  maxLines: number
  ignored: string[]
  scanned: number
  overLimit: number
  timestamp: string
  files: FileReport[]
}

const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'out',
  'tmp',
  '.turbo'
]

const usage = `Usage: tsx list-large-typescript-files.ts [--root <path>] [--max-lines <number>] [--out <path>] [--ignore <dirA,dirB>]

Scans the repository for .ts/.tsx files longer than the threshold and suggests splitting them into a modular, lambda-per-file structure.`

const parseArgs = (): Options => {
  const args = process.argv.slice(2)
  const options: Options = {
    root: process.cwd(),
    maxLines: 150,
    ignore: new Set(DEFAULT_IGNORE),
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    switch (arg) {
      case '--root':
        options.root = path.resolve(args[i + 1] ?? '.')
        i += 1
        break
      case '--max-lines':
        options.maxLines = Number(args[i + 1] ?? options.maxLines)
        i += 1
        break
      case '--out':
        options.outFile = args[i + 1]
        i += 1
        break
      case '--ignore': {
        const extra = (args[i + 1] ?? '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        extra.forEach((entry) => options.ignore.add(entry))
        i += 1
        break
      }
      case '--help':
        console.log(usage)
        process.exit(0)
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`)
        }
    }
  }

  return options
}

const countLines = async (filePath: string): Promise<number> => {
  const content = await fs.readFile(filePath, 'utf8')
  return content.split(/\r?\n/).length
}

const shouldSkip = (segment: string, ignore: Set<string>): boolean => ignore.has(segment)

const walkFiles = async (options: Options): Promise<{ reports: FileReport[]; total: number }> => {
  const queue: string[] = [options.root]
  const reports: FileReport[] = []
  let total = 0

  while (queue.length > 0) {
    const current = queue.pop() as string
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      if (shouldSkip(entry.name, options.ignore)) continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(fullPath)
        continue
      }
      if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) continue
      total += 1
      const lines = await countLines(fullPath)
      if (lines > options.maxLines) {
        const relativePath = path.relative(options.root, fullPath)
        reports.push({
          path: relativePath,
          lines,
          recommendation: 'Split into focused modules; keep one primary lambda per file and extract helpers.',
        })
      }
    }
  }

  return { reports: reports.sort((a, b) => b.lines - a.lines), total }
}

const writeSummary = async (summary: Summary, destination?: string) => {
  if (!destination) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(`Report written to ${destination}`)
}

const main = async () => {
  const options = parseArgs()
  const { reports, total } = await walkFiles(options)
  const summary: Summary = {
    root: options.root,
    maxLines: options.maxLines,
    ignored: Array.from(options.ignore).sort(),
    scanned: total,
    overLimit: reports.length,
    timestamp: new Date().toISOString(),
    files: reports,
  }

  await writeSummary(summary, options.outFile)
}

main().catch((error) => {
  console.error('Failed to generate TypeScript file size report', error)
  process.exit(1)
})
