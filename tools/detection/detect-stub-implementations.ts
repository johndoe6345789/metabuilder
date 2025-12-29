#!/usr/bin/env tsx

import { collectStubs } from './stub-lambdas/directory-walker'
import { summarizeStubs, writeSummary } from './stub-lambdas/reporter'

const rootDir = 'src'
const outputPath = process.argv[2] || 'stub-patterns.json'

const stubs = collectStubs(rootDir)
const summary = summarizeStubs(stubs)

writeSummary(summary, outputPath)

console.log(JSON.stringify(summary, null, 2))
