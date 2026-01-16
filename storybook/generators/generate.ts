#!/usr/bin/env tsx
/**
 * Generate Storybook stories from JSON definitions
 * 
 * Usage:
 *   npm run storybook:generate              # Generate all package stories
 *   npm run storybook:generate ui_home      # Generate specific package stories
 */

import { resolve } from 'path'
import { generateStorybookStory, generateAllStorybookStories, discoverStorybookPackages } from './storybook-generator'

async function main() {
  const packageName = process.argv[2]
  const projectRoot = resolve(__dirname, '../..')
  const packagesDir = resolve(projectRoot, 'packages')
  const outputDir = resolve(projectRoot, 'storybook/generated')

  console.log('📚 Storybook Story Generator')
  console.log('═'.repeat(50))
  console.log(`Packages dir: ${packagesDir}`)
  console.log(`Output dir: ${outputDir}`)
  console.log('')

  try {
    if (packageName) {
      // Generate for specific package
      console.log(`Generating stories for package: ${packageName}`)
      const outputPath = await generateStorybookStory(packageName, packagesDir, outputDir)
      console.log(`✅ Generated: ${outputPath}`)
    } else {
      // Discover and generate all
      const packages = await discoverStorybookPackages(packagesDir)
      console.log(`Found ${packages.length} packages with Storybook stories:`)
      packages.forEach(pkg => console.log(`  - ${pkg}`))
      console.log('')

      const generated = await generateAllStorybookStories(packagesDir, outputDir)
      console.log('')
      console.log(`✅ Generated ${generated.length} story files`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
