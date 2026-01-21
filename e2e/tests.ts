/**
 * Playwright Tests - Auto-discover and execute JSON test definitions
 *
 * This file loads all JSON test definitions from packages/*/playwright/tests.json
 * and registers them as Playwright tests at runtime.
 *
 * Usage: npm run test:e2e
 */

import { test } from '@playwright/test'
import { loadAllPackageTests } from './json-runner/playwright-json-runner'
import { resolve } from 'path'

// Discover and register all JSON tests from packages
const packagesDir = resolve(__dirname, '../packages')
void loadAllPackageTests(packagesDir, test)
