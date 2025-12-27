#!/usr/bin/env tsx

import { generateStubReport } from './stub-report/report-builder'

function main() {
  const report = generateStubReport()
  console.log(report)
}

main()
