import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const missingComponents = [
  'AtomicLibraryShowcase',
  'CodeEditor',
  'ComponentTreeBuilder',
  'ComponentTreeManager',
  'ConflictResolutionPage',
  'DockerBuildDebugger',
  'DocumentationView',
  'ErrorPanel',
  'FaviconDesigner',
  'FeatureIdeaCloud',
  'FeatureToggleSettings',
  'JSONComponentTreeManager',
  'JSONLambdaDesigner',
  'JSONModelDesigner',
  'PersistenceDashboard',
  'PersistenceExample',
  'ProjectDashboard',
  'PWASettings',
  'SassStylesShowcase',
  'StyleDesigner',
]

async function createComponentJSON(componentName: string) {
  // Convert to kebab-case for filename
  const fileName = componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '') + '.json'

  const filePath = path.join(rootDir, 'src/config/pages/components', fileName)

  // Check if component file exists
  const possiblePaths = [
    path.join(rootDir, `src/components/${componentName}.tsx`),
    path.join(rootDir, `src/components/${componentName}/index.tsx`),
  ]

  let componentPath = ''
  for (const p of possiblePaths) {
    try {
      await fs.access(p)
      componentPath = `@/components/${componentName}`
      break
    } catch {
      // Continue searching
    }
  }

  if (!componentPath) {
    console.log(`   ⚠️  ${componentName} - Component file not found, creating placeholder`)
    componentPath = `@/components/${componentName}`
  }

  const json = {
    type: componentName,
    jsonCompatible: false,
    wrapperRequired: true,
    load: {
      path: componentPath,
      export: componentName,
    },
    props: {},
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n')
  console.log(`   ✅ Created: ${fileName}`)
}

async function main() {
  console.log('📝 Creating JSON definitions for missing custom components...\n')

  // Ensure directory exists
  const targetDir = path.join(rootDir, 'src/config/pages/components')
  await fs.mkdir(targetDir, { recursive: true })

  for (const component of missingComponents) {
    await createComponentJSON(component)
  }

  console.log(`\n✨ Created ${missingComponents.length} component JSON files!`)
}

main().catch(console.error)
