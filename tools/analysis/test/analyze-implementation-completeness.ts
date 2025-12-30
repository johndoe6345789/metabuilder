#!/usr/bin/env tsx

import { analyzeImplementations } from './analyze-implementation-completeness/analyze-implementations'
import { summarizeAnalyses } from './analyze-implementation-completeness/summarize-analyses'
import { writeSummary } from './analyze-implementation-completeness/write-summary'

const outputPath = process.argv[2] || 'implementation-analysis.json'

const analyses = analyzeImplementations()
const summary = summarizeAnalyses(analyses)
const serialized = JSON.stringify(summary, null, 2)

writeSummary(outputPath, serialized)
console.log(serialized)
