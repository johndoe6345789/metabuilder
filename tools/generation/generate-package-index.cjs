#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const packagesDir = path.join(__dirname, '..', 'packages')
const entries = fs.readdirSync(packagesDir, { withFileTypes: true })

const packages = entries
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .flatMap((entry) => {
    const metadataPath = path.join(packagesDir, entry.name, 'seed', 'metadata.json')
    if (!fs.existsSync(metadataPath)) {
      return []
    }
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    return [
      {
        packageId: metadata.packageId,
        name: metadata.name,
        version: metadata.version,
        description: metadata.description,
        author: metadata.author,
        category: metadata.category,
        dependencies: metadata.dependencies ?? [],
        exports: metadata.exports ?? { components: [] },
      },
    ]
  })
  .sort((a, b) => a.packageId.localeCompare(b.packageId))

const output = {
  generatedAt: new Date().toISOString(),
  packages,
}

const outputPath = path.join(packagesDir, 'index.json')
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n')

console.log(`Wrote ${outputPath} (${packages.length} packages)`)
