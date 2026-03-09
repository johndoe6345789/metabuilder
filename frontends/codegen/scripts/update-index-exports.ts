import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

/**
 * Update index.ts files to remove exports for deleted components
 */
async function updateIndexFiles(): Promise<void> {
  console.log('📝 Updating index.ts files...\n')

  const directories = [
    'src/components/atoms',
    'src/components/molecules',
    'src/components/organisms',
    'src/components/ui',
  ]

  for (const dir of directories) {
    const indexPath = path.join(rootDir, dir, 'index.ts')
    const dirPath = path.join(rootDir, dir)

    console.log(`📂 Processing ${dir}/index.ts...`)

    try {
      // Read current index.ts
      const indexContent = await fs.readFile(indexPath, 'utf-8')
      const lines = indexContent.split('\n')

      // Get list of existing .tsx files
      const files = await fs.readdir(dirPath)
      const existingComponents = new Set(
        files
          .filter(f => f.endsWith('.tsx') && f !== 'index.tsx')
          .map(f => f.replace('.tsx', ''))
      )

      // Filter out exports for deleted components
      const updatedLines = lines.filter(line => {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('//')) {
          return true
        }

        // Check if it's an export line
        const exportMatch = line.match(/export\s+(?:\{([^}]+)\}|.+)\s+from\s+['"]\.\/([^'"]+)['"]/)
        if (!exportMatch) {
          return true // Keep non-export lines
        }

        const componentName = exportMatch[2]
        const exists = existingComponents.has(componentName)

        if (!exists) {
          console.log(`   ❌ Removing export: ${componentName}`)
          return false
        }

        return true
      })

      // Write updated index.ts
      await fs.writeFile(indexPath, updatedLines.join('\n'))

      console.log(`   ✅ Updated ${dir}/index.ts\n`)
    } catch (error) {
      console.error(`   ❌ Error processing ${dir}/index.ts:`, error)
    }
  }

  console.log('✨ Index files updated!')
}

updateIndexFiles().catch(console.error)
