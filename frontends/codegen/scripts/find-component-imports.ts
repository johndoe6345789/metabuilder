import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Components we want to remove (restored dependencies)
const targetComponents = {
  ui: ['accordion', 'alert', 'aspect-ratio', 'avatar', 'badge', 'button', 'card',
       'checkbox', 'collapsible', 'dialog', 'hover-card', 'input', 'label',
       'popover', 'progress', 'radio-group', 'resizable', 'scroll-area',
       'separator', 'skeleton', 'sheet', 'switch', 'tabs', 'textarea', 'toggle', 'tooltip'],
  molecules: ['DataSourceCard', 'EditorToolbar', 'EmptyEditorState', 'MonacoEditorPanel', 'SearchBar'],
  organisms: ['EmptyCanvasState', 'PageHeader', 'SchemaEditorCanvas', 'SchemaEditorPropertiesPanel',
              'SchemaEditorSidebar', 'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions'],
  atoms: ['Input']
}

interface ImportInfo {
  file: string
  line: number
  importStatement: string
  importedComponents: string[]
  fromPath: string
}

async function findAllImports(): Promise<ImportInfo[]> {
  const imports: ImportInfo[] = []

  const searchDirs = [
    'src/components',
    'src/pages',
    'src/lib',
    'src'
  ]

  for (const dir of searchDirs) {
    const dirPath = path.join(rootDir, dir)
    try {
      await processDirectory(dirPath, imports)
    } catch (e) {
      // Directory might not exist, skip
    }
  }

  return imports
}

async function processDirectory(dir: string, imports: ImportInfo[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      await processDirectory(fullPath, imports)
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      await processFile(fullPath, imports)
    }
  }
}

async function processFile(filePath: string, imports: ImportInfo[]): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for imports from our target components
    for (const [category, components] of Object.entries(targetComponents)) {
      for (const component of components) {
        const patterns = [
          `from ['"]@/components/${category}/${component}['"]`,
          `from ['"]./${component}['"]`,
          `from ['"]../${component}['"]`,
        ]

        for (const pattern of patterns) {
          if (new RegExp(pattern).test(line)) {
            // Extract imported components
            const importMatch = line.match(/import\s+(?:\{([^}]+)\}|(\w+))\s+from/)
            const importedComponents = importMatch
              ? (importMatch[1] || importMatch[2]).split(',').map(s => s.trim())
              : []

            imports.push({
              file: filePath.replace(rootDir, '').replace(/\\/g, '/'),
              line: i + 1,
              importStatement: line.trim(),
              importedComponents,
              fromPath: component
            })
          }
        }
      }
    }
  }
}

async function main() {
  console.log('🔍 Finding all imports of target components...\n')

  const imports = await findAllImports()

  if (imports.length === 0) {
    console.log('✅ No imports found! Components can be safely deleted.')
    return
  }

  console.log(`❌ Found ${imports.length} imports that need refactoring:\n`)

  const byFile: Record<string, ImportInfo[]> = {}
  for (const imp of imports) {
    if (!byFile[imp.file]) byFile[imp.file] = []
    byFile[imp.file].push(imp)
  }

  for (const [file, fileImports] of Object.entries(byFile)) {
    console.log(`📄 ${file}`)
    for (const imp of fileImports) {
      console.log(`   Line ${imp.line}: ${imp.importStatement}`)
      console.log(`      → Imports: ${imp.importedComponents.join(', ')}`)
    }
    console.log()
  }

  console.log('\n📊 Summary by category:')
  const byCategory: Record<string, number> = {}
  for (const imp of imports) {
    const key = imp.fromPath
    byCategory[key] = (byCategory[key] || 0) + 1
  }

  for (const [component, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${component}: ${count} imports`)
  }
}

main().catch(console.error)
