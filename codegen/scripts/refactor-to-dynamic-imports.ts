import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

/**
 * Strategy: Replace static imports with dynamic component loading
 *
 * Before:
 *   import { Button } from '@/components/ui/button'
 *   <Button variant="primary">Click</Button>
 *
 * After:
 *   import { getComponent } from '@/lib/component-loader'
 *   const Button = getComponent('Button')
 *   <Button variant="primary">Click</Button>
 */

interface RefactorTask {
  file: string
  replacements: Array<{
    oldImport: string
    newImport: string
    components: string[]
  }>
}

const targetComponents = {
  ui: ['button', 'card', 'badge', 'label', 'input', 'separator', 'scroll-area',
       'tabs', 'dialog', 'textarea', 'tooltip', 'switch', 'alert', 'skeleton',
       'progress', 'collapsible', 'resizable', 'popover', 'hover-card', 'checkbox',
       'accordion', 'aspect-ratio', 'avatar', 'radio-group', 'sheet', 'toggle'],
  molecules: ['DataSourceCard', 'EditorToolbar', 'EmptyEditorState', 'MonacoEditorPanel', 'SearchBar'],
  organisms: ['EmptyCanvasState', 'PageHeader', 'SchemaEditorCanvas', 'SchemaEditorPropertiesPanel',
              'SchemaEditorSidebar', 'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions'],
  atoms: ['Input']
}

export async function refactorFile(filePath: string): Promise<boolean> {
  let content = await fs.readFile(filePath, 'utf-8')
  let modified = false

  // Find all imports to replace
  const componentsToLoad = new Set<string>()

  for (const [category, components] of Object.entries(targetComponents)) {
    for (const component of components) {
      const patterns = [
        new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]@/components/${category}/${component}['"]`, 'g'),
        new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]@/components/${category}/${component}['"]`, 'g'),
      ]

      for (const pattern of patterns) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const importedItems = match[1].split(',').map(s => s.trim().split(' as ')[0].trim())
          importedItems.forEach(item => componentsToLoad.add(item))

          // Remove the import line
          content = content.replace(match[0], '')
          modified = true
        }
      }
    }
  }

  if (!modified) return false

  // Add dynamic component loader import at top
  const loaderImport = `import { loadComponent } from '@/lib/component-loader'\n`

  // Add component loading statements
  const componentLoads = Array.from(componentsToLoad)
    .map(comp => `const ${comp} = loadComponent('${comp}')`)
    .join('\n')

  // Find first import statement location
  const firstImportMatch = content.match(/^import\s/m)
  if (firstImportMatch && firstImportMatch.index !== undefined) {
    content = content.slice(0, firstImportMatch.index) +
              loaderImport + '\n' +
              componentLoads + '\n\n' +
              content.slice(firstImportMatch.index)
  }

  await fs.writeFile(filePath, content)
  return true
}

async function createComponentLoader() {
  const loaderPath = path.join(rootDir, 'src/lib/component-loader.ts')

  const loaderContent = `/**
 * Dynamic Component Loader
 * Loads components from the registry at runtime instead of static imports
 */

import { ComponentType, lazy } from 'react'

const componentCache = new Map<string, ComponentType<any>>()

export function loadComponent(componentName: string): ComponentType<any> {
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!
  }

  // Try to load from different sources
  const loaders = [
    () => import(\`@/components/ui/\${componentName.toLowerCase()}\`),
    () => import(\`@/components/atoms/\${componentName}\`),
    () => import(\`@/components/molecules/\${componentName}\`),
    () => import(\`@/components/organisms/\${componentName}\`),
  ]

  // Create lazy component
  const LazyComponent = lazy(async () => {
    for (const loader of loaders) {
      try {
        const module = await loader()
        return { default: module[componentName] || module.default }
      } catch (e) {
        continue
      }
    }
    throw new Error(\`Component \${componentName} not found\`)
  })

  componentCache.set(componentName, LazyComponent)
  return LazyComponent
}

export function getComponent(componentName: string): ComponentType<any> {
  return loadComponent(componentName)
}
`

  await fs.writeFile(loaderPath, loaderContent)
  console.log('✅ Created component-loader.ts')
}

async function main() {
  console.log('🚀 Starting AGGRESSIVE refactoring to eliminate static imports...\n')
  console.log('⚠️  WARNING: This is a MAJOR refactoring affecting 975+ import statements!\n')
  console.log('Press Ctrl+C now if you want to reconsider...\n')

  await new Promise(resolve => setTimeout(resolve, 3000))

  console.log('🔧 Creating dynamic component loader...')
  await createComponentLoader()

  console.log('\n📝 This approach requires significant testing and may break things.')
  console.log('   Recommendation: Manual refactoring of high-value components instead.\n')
}

main().catch(console.error)
