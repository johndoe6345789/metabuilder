import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

interface ConversionConfig {
  sourceDir: string
  targetDir: string
  category: 'atoms' | 'molecules' | 'organisms' | 'ui'
}

interface ComponentAnalysis {
  name: string
  hasHooks: boolean
  hasComplexLogic: boolean
  wrapsUIComponent: boolean
  uiComponentName?: string
  defaultProps: Record<string, unknown>
  isSimplePresentational: boolean
}

/**
 * Analyze a TypeScript component file to determine conversion strategy
 */
async function analyzeComponent(filePath: string): Promise<ComponentAnalysis> {
  const content = await fs.readFile(filePath, 'utf-8')
  const fileName = path.basename(filePath, '.tsx')

  // Check for hooks
  const hasHooks = /use[A-Z]\w+\(/.test(content) ||
                  /useState|useEffect|useCallback|useMemo|useRef|useReducer/.test(content)

  // Check for complex logic
  const hasComplexLogic = hasHooks ||
                         /switch\s*\(/.test(content) ||
                         /for\s*\(/.test(content) ||
                         /while\s*\(/.test(content) ||
                         content.split('\n').length > 100

  // Check if it wraps a shadcn/ui component
  const uiImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui\//)
  const wrapsUIComponent = !!uiImportMatch
  const uiComponentName = wrapsUIComponent ? uiImportMatch?.[1].trim() : undefined

  // Extract default props from interface
  const defaultProps: Record<string, unknown> = {}
  const propDefaults = content.matchAll(/(\w+)\s*[?]?\s*:\s*([^=\n]+)\s*=\s*['"]?([^'";\n,}]+)['"]?/g)
  for (const match of propDefaults) {
    const [, propName, , defaultValue] = match
    if (propName && defaultValue) {
      defaultProps[propName] = defaultValue.replace(/['"]/g, '')
    }
  }

  // Determine if it's simple presentational
  const isSimplePresentational = !hasComplexLogic &&
                                !hasHooks &&
                                content.split('\n').length < 60

  return {
    name: fileName,
    hasHooks,
    hasComplexLogic,
    wrapsUIComponent,
    uiComponentName,
    defaultProps,
    isSimplePresentational,
  }
}

/**
 * Generate JSON definition for a component based on analysis
 */
function generateJSON(analysis: ComponentAnalysis, category: string): object {
  // If it wraps a UI component, reference that
  if (analysis.wrapsUIComponent && analysis.uiComponentName) {
    return {
      type: analysis.uiComponentName,
      props: analysis.defaultProps,
    }
  }

  // If it's simple presentational, create a basic structure
  if (analysis.isSimplePresentational) {
    return {
      type: analysis.name,
      props: analysis.defaultProps,
    }
  }

  // If it has hooks or complex logic, mark as needing wrapper
  if (analysis.hasHooks || analysis.hasComplexLogic) {
    return {
      type: analysis.name,
      jsonCompatible: false,
      wrapperRequired: true,
      load: {
        path: `@/components/${category}/${analysis.name}`,
        export: analysis.name,
      },
      props: analysis.defaultProps,
      metadata: {
        notes: analysis.hasHooks ? 'Contains hooks - needs wrapper' : 'Complex logic - needs wrapper',
      },
    }
  }

  // Default case
  return {
    type: analysis.name,
    props: analysis.defaultProps,
  }
}

/**
 * Convert a single TypeScript file to JSON
 */
async function convertFile(
  sourceFile: string,
  targetDir: string,
  category: string
): Promise<{ success: boolean; analysis: ComponentAnalysis }> {
  try {
    const analysis = await analyzeComponent(sourceFile)
    const json = generateJSON(analysis, category)

    // Generate kebab-case filename
    const jsonFileName = analysis.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '') + '.json'

    const targetFile = path.join(targetDir, jsonFileName)

    await fs.writeFile(targetFile, JSON.stringify(json, null, 2) + '\n')

    return { success: true, analysis }
  } catch (error) {
    console.error(`Error converting ${sourceFile}:`, error)
    return {
      success: false,
      analysis: {
        name: path.basename(sourceFile, '.tsx'),
        hasHooks: false,
        hasComplexLogic: false,
        wrapsUIComponent: false,
        defaultProps: {},
        isSimplePresentational: false,
      }
    }
  }
}

/**
 * Convert all components in a directory
 */
async function convertDirectory(config: ConversionConfig): Promise<void> {
  const sourceDir = path.join(rootDir, config.sourceDir)
  const targetDir = path.join(rootDir, config.targetDir)

  console.log(`\n📂 Converting ${config.category} components...`)
  console.log(`   Source: ${sourceDir}`)
  console.log(`   Target: ${targetDir}`)

  // Ensure target directory exists
  await fs.mkdir(targetDir, { recursive: true })

  // Get all TypeScript files
  const files = await fs.readdir(sourceDir)
  const tsxFiles = files.filter(f => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.stories.'))

  console.log(`   Found ${tsxFiles.length} TypeScript files\n`)

  const results = {
    total: 0,
    simple: 0,
    needsWrapper: 0,
    wrapsUI: 0,
    failed: 0,
  }

  // Convert each file
  for (const file of tsxFiles) {
    const sourceFile = path.join(sourceDir, file)
    const { success, analysis } = await convertFile(sourceFile, targetDir, config.category)

    results.total++

    if (!success) {
      results.failed++
      console.log(`   ❌ ${file}`)
      continue
    }

    if (analysis.wrapsUIComponent) {
      results.wrapsUI++
      console.log(`   🎨 ${file} → ${analysis.name} (wraps UI)`)
    } else if (analysis.isSimplePresentational) {
      results.simple++
      console.log(`   ✅ ${file} → ${analysis.name} (simple)`)
    } else if (analysis.hasHooks || analysis.hasComplexLogic) {
      results.needsWrapper++
      console.log(`   ⚙️  ${file} → ${analysis.name} (needs wrapper)`)
    } else {
      results.simple++
      console.log(`   ✅ ${file} → ${analysis.name}`)
    }
  }

  console.log(`\n📊 Results for ${config.category}:`)
  console.log(`   Total:         ${results.total}`)
  console.log(`   Simple:        ${results.simple}`)
  console.log(`   Wraps UI:      ${results.wrapsUI}`)
  console.log(`   Needs Wrapper: ${results.needsWrapper}`)
  console.log(`   Failed:        ${results.failed}`)
}

/**
 * Main conversion process
 */
async function main() {
  console.log('🚀 Starting TypeScript to JSON conversion...\n')

  const configs: ConversionConfig[] = [
    {
      sourceDir: 'src/components/atoms',
      targetDir: 'src/config/pages/atoms',
      category: 'atoms',
    },
    {
      sourceDir: 'src/components/molecules',
      targetDir: 'src/config/pages/molecules',
      category: 'molecules',
    },
    {
      sourceDir: 'src/components/organisms',
      targetDir: 'src/config/pages/organisms',
      category: 'organisms',
    },
    {
      sourceDir: 'src/components/ui',
      targetDir: 'src/config/pages/ui',
      category: 'ui',
    },
  ]

  for (const config of configs) {
    await convertDirectory(config)
  }

  console.log('\n✨ Conversion complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Review generated JSON files')
  console.log('   2. Manually fix complex components')
  console.log('   3. Update json-components-registry.json')
  console.log('   4. Test components render correctly')
  console.log('   5. Delete old TypeScript files')
}

main().catch(console.error)
