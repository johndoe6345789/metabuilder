export interface Options {
  root: string
  maxLines: number
  ignore: Set<string>
  outFile?: string
}

export interface FileReport {
  path: string
  lines: number
  recommendation: string
}

export interface Summary {
  root: string
  maxLines: number
  ignored: string[]
  scanned: number
  overLimit: number
  timestamp: string
  files: FileReport[]
  outFile?: string
}

export const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'out',
  'tmp',
  '.turbo',
]

export const usage = `Usage: tsx list-large-typescript-files.ts [--root <path>] [--max-lines <number>] [--out <path>] [--ignore <dirA,dirB>]

Scans the repository for .ts/.tsx files longer than the threshold and suggests splitting them into a modular, lambda-per-file structure.`
