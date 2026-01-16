/**
 * JSON-Driven Package Tests
 * 
 * This test file dynamically loads and executes all Playwright tests
 * defined in packages/*/playwright/tests.json
 * 
 * No code generation - tests are interpreted directly from JSON at runtime.
 */

import { test } from '@playwright/test'
import { resolve } from 'path'
import { loadAllPackageTests } from './json-runner/playwright-json-runner'

// Load all package tests from JSON
const packagesDir = resolve(__dirname, '../packages')
await loadAllPackageTests(packagesDir, test)
