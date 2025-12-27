#!/usr/bin/env tsx

import { parseArgs } from './list-large-typescript-files/args'
import { walkFiles } from './list-large-typescript-files/file-scanner'
import { writeSummary } from './list-large-typescript-files/write-summary'
import type { Summary } from './list-large-typescript-files/types'

const buildSummary = async (): Promise<Summary> => {
  const options = parseArgs()
  const { reports, total } = await walkFiles(options)

  return {
    root: options.root,
    maxLines: options.maxLines,
    ignored: Array.from(options.ignore).sort(),
    scanned: total,
    overLimit: reports.length,
    timestamp: new Date().toISOString(),
    files: reports,
    outFile: options.outFile,
  }
}

const main = async () => {
  const summary = await buildSummary()
  await writeSummary(summary, summary.outFile)
}

main().catch((error) => {
  console.error('Failed to generate TypeScript file size report', error)
  process.exit(1)
})
