import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const componentsToAnalyze = {
  molecules: ['DataSourceCard', 'EditorToolbar', 'EmptyEditorState', 'MonacoEditorPanel', 'SearchBar'],
  organisms: ['EmptyCanvasState', 'PageHeader', 'SchemaEditorCanvas', 'SchemaEditorPropertiesPanel',
              'SchemaEditorSidebar', 'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions'],
}

async function analyzeComponent(category: string, component: string): Promise<void> {
  const tsFile = path.join(rootDir, `src/components/${category}/${component}.tsx`)
  const content = await fs.readFile(tsFile, 'utf-8')

  // Check if it's pure composition (only uses UI primitives)
  const hasBusinessLogic = /useState|useEffect|useCallback|useMemo|useReducer|useRef/.test(content)
  const hasComplexLogic = /if\s*\(.*\{|switch\s*\(|for\s*\(|while\s*\(/.test(content)

  // Extract what it imports
  const imports = content.match(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]/g) || []
  const importedComponents = imports.flatMap(imp => {
    const match = imp.match(/\{([^}]+)\}/)
    return match ? match[1].split(',').map(s => s.trim()) : []
  })

  // Check if it only imports from ui/atoms (pure composition)
  const onlyUIPrimitives = imports.every(imp =>
    imp.includes('@/components/ui/') ||
    imp.includes('@/components/atoms/') ||
    imp.includes('@/lib/utils') ||
    imp.includes('lucide-react') ||
    imp.includes('@phosphor-icons')
  )

  const lineCount = content.split('\n').length

  console.log(`\n📄 ${component}`)
  console.log(`   Lines: ${lineCount}`)
  console.log(`   Has hooks: ${hasBusinessLogic ? '❌' : '✅'}`)
  console.log(`   Has complex logic: ${hasComplexLogic ? '❌' : '✅'}`)
  console.log(`   Only UI primitives: ${onlyUIPrimitives ? '✅' : '❌'}`)
  console.log(`   Imports: ${importedComponents.slice(0, 5).join(', ')}${importedComponents.length > 5 ? '...' : ''}`)

  if (!hasBusinessLogic && onlyUIPrimitives && lineCount < 100) {
    console.log(`   🎯 CANDIDATE FOR PURE JSON`)
  }
}

async function main() {
  console.log('🔍 Analyzing components for pure JSON conversion...\n')
  console.log('Looking for components that:')
  console.log('  - No hooks (useState, useEffect, etc.)')
  console.log('  - No complex logic')
  console.log('  - Only import UI primitives')
  console.log('  - Are simple compositions\n')

  for (const [category, components] of Object.entries(componentsToAnalyze)) {
    console.log(`\n═══ ${category.toUpperCase()} ═══`)
    for (const component of components) {
      try {
        await analyzeComponent(category, component)
      } catch (e) {
        console.log(`\n📄 ${component}`)
        console.log(`   ⚠️  Could not analyze: ${e}`)
      }
    }
  }

  console.log('\n\n✨ Analysis complete!')
}

main().catch(console.error)
