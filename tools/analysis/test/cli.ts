#!/usr/bin/env tsx

import { runTestAnalysis } from './report'

runTestAnalysis(process.argv[2]).catch(error => {
  console.error('Failed to generate test analysis report:', error)
  process.exit(1)
})
