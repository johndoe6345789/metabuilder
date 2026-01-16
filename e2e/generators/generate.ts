#!/usr/bin/env tsx
/**
 * Generate Playwright tests from JSON definitions
 * 
 * Usage:
 *   npm run test:generate              # Generate all package tests
 *   npm run test:generate ui_home      # Generate specific package tests
 */

import { resolve } from 'path'
import { generatePlaywrightTest, generateAllPlaywrightTests, discoverPlaywrightPackages } from './playwright-generator'

async function main() {
  const packageName = process.argv[2]
  const projectRoot = resolve(__dirname, '../..')
  const packagesDir = resolve(projectRoot, 'packages')
  const outputDir = resolve(projectRoot, 'e2e/generated')

  console.log('🎭 Playwright Test Generator')
  console.log('═'.repeat(50))
  console.log(`Packages dir: ${packagesDir}`)
  console.log(`Output dir: ${outputDir}`)
  console.log('')

  try {
    if (packageName) {
      // Generate for specific package
      console.log(`Generating tests for package: ${packageName}`)
      const outputPath = await generatePlaywrightTest(packageName, packagesDir, outputDir)
      console.log(`✅ Generated: ${outputPath}`)
    } else {
      // Discover and generate all
      const packages = await discoverPlaywrightPackages(packagesDir)
      console.log(`Found ${packages.length} packages with Playwright tests:`)
      packages.forEach(pkg => console.log(`  - ${pkg}`))
      console.log('')

      const generated = await generateAllPlaywrightTests(packagesDir, outputDir)
      console.log('')
      console.log(`✅ Generated ${generated.length} test files`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
