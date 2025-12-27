#!/usr/bin/env node
/**
 * Code Size Limit Enforcer
 *
 * Enforces multiple metrics to keep files maintainable:
 * - TypeScript/React: Max 150 lines of actual code (LOC)
 * - Any file: Max 300 lines total (including comments/whitespace)
 * - Max 3 levels of nesting in functions
 * - Max 10 exports per file
 * - Max 5 parameters per function
 */

import { runSizeLimitEnforcement } from './enforce-size-limits'

console.log('🔍 Scanning for size limit violations...\n')

const { exitCode } = runSizeLimitEnforcement()

if (exitCode !== 0) {
  process.exit(exitCode)
}
