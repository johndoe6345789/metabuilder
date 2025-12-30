#!/usr/bin/env node

import { analyzeCoverage } from './analyze-test-coverage/coverage-runner'
import { printReport, writeJsonReport } from './analyze-test-coverage/reporter'

const run = async () => {
  try {
    const report = await analyzeCoverage()
    printReport(report)
    writeJsonReport(report)
  } catch (e) {
    console.error('Error analyzing coverage:', e)
    process.exit(1)
  }
}

run()
