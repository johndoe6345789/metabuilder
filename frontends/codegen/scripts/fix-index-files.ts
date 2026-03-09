#!/usr/bin/env tsx
/**
 * Fix index.ts files to only export existing TSX files
 */

import fs from 'fs'
import path from 'path'
import { globSync } from 'fs'

const ROOT_DIR = path.resolve(process.cwd())
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components')

const categories = ['atoms', 'molecules', 'organisms']

for (const category of categories) {
  const categoryDir = path.join(COMPONENTS_DIR, category)
  const indexPath = path.join(categoryDir, 'index.ts')

  if (!fs.existsSync(indexPath)) continue

  // Find all TSX files in this category
  const tsxFiles = globSync(path.join(categoryDir, '*.tsx'))
  const basenames = tsxFiles.map(f => path.basename(f, '.tsx'))

  console.log(`\n📁 ${category}/`)
  console.log(`   Found ${basenames.length} TSX files`)

  // Generate new exports
  const exports = basenames
    .sort()
    .map(name => `export { ${name} } from './${name}'`)
    .join('\n')

  // Write new index file
  const content = `// Auto-generated - only exports existing TSX files\n${exports}\n`
  fs.writeFileSync(indexPath, content)

  console.log(`   ✅ Updated ${category}/index.ts`)
}

console.log('\n✨ All index files updated!')
