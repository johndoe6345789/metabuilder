import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Components we restored (the ones we want to potentially convert to JSON)
const restoredComponents = {
  ui: ['accordion', 'alert', 'aspect-ratio', 'avatar', 'badge', 'button', 'card',
       'checkbox', 'collapsible', 'dialog', 'hover-card', 'input', 'label',
       'popover', 'progress', 'radio-group', 'resizable', 'scroll-area',
       'separator', 'skeleton', 'sheet', 'switch', 'tabs', 'textarea', 'toggle', 'tooltip'],
  molecules: ['DataSourceCard', 'EditorToolbar', 'EmptyEditorState', 'MonacoEditorPanel', 'SearchBar'],
  organisms: ['EmptyCanvasState', 'PageHeader', 'SchemaEditorCanvas', 'SchemaEditorPropertiesPanel',
              'SchemaEditorSidebar', 'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions'],
  atoms: ['Input'],
}

interface ComponentAnalysis {
  name: string
  category: string
  pureJSONEligible: boolean
  reasons: string[]
  complexity: 'simple' | 'medium' | 'complex'
  hasHooks: boolean
  hasConditionalLogic: boolean
  hasHelperFunctions: boolean
  hasComplexProps: boolean
  importsCustomComponents: boolean
  onlyImportsUIorAtoms: boolean
}

async function analyzeComponent(category: string, component: string): Promise<ComponentAnalysis> {
  const tsFile = path.join(rootDir, `src/components/${category}/${component}.tsx`)
  const content = await fs.readFile(tsFile, 'utf-8')

  const hasHooks = /useState|useEffect|useCallback|useMemo|useReducer|useRef|useContext/.test(content)
  const hasConditionalLogic = /\?|if\s*\(|switch\s*\(/.test(content)
  const hasHelperFunctions = /(?:const|function)\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(content) && /return\s+\(/.test(content.split('return (')[0] || '')
  const hasComplexProps = /\.\w+\s*\?/.test(content) || /Object\./.test(content) || /Array\./.test(content)

  // Check imports
  const importLines = content.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || []
  const importsCustomComponents = importLines.some(line =>
    /@\/components\/(molecules|organisms)/.test(line)
  )
  const onlyImportsUIorAtoms = importLines.every(line => {
    if (!line.includes('@/components/')) return true
    return /@\/components\/(ui|atoms)/.test(line)
  })

  const reasons: string[] = []
  if (hasHooks) reasons.push('Has React hooks')
  if (hasHelperFunctions) reasons.push('Has helper functions')
  if (hasComplexProps) reasons.push('Has complex prop access')
  if (importsCustomComponents) reasons.push('Imports molecules/organisms')
  if (!onlyImportsUIorAtoms && !importsCustomComponents) reasons.push('Imports non-UI components')

  // Determine if eligible for pure JSON
  const pureJSONEligible = !hasHooks && !hasHelperFunctions && !hasComplexProps && onlyImportsUIorAtoms

  // Complexity scoring
  let complexity: 'simple' | 'medium' | 'complex' = 'simple'
  if (hasHooks || hasHelperFunctions || hasComplexProps) {
    complexity = 'complex'
  } else if (hasConditionalLogic || importsCustomComponents) {
    complexity = 'medium'
  }

  return {
    name: component,
    category,
    pureJSONEligible,
    reasons,
    complexity,
    hasHooks,
    hasConditionalLogic,
    hasHelperFunctions,
    hasComplexProps,
    importsCustomComponents,
    onlyImportsUIorAtoms,
  }
}

async function main() {
  console.log('🔍 Analyzing restored components for pure JSON eligibility...\\n')

  const eligible: ComponentAnalysis[] = []
  const ineligible: ComponentAnalysis[] = []

  for (const [category, components] of Object.entries(restoredComponents)) {
    for (const component of components) {
      try {
        const analysis = await analyzeComponent(category, component)
        if (analysis.pureJSONEligible) {
          eligible.push(analysis)
        } else {
          ineligible.push(analysis)
        }
      } catch (e) {
        console.log(`⚠️  ${component} - Could not analyze: ${e}`)
      }
    }
  }

  console.log(`\\n✅ ELIGIBLE FOR PURE JSON (${eligible.length} components)\\n`)
  for (const comp of eligible) {
    console.log(`   ${comp.name} (${comp.category})`)
    console.log(`      Complexity: ${comp.complexity}`)
    console.log(`      Conditional: ${comp.hasConditionalLogic ? 'Yes' : 'No'}`)
  }

  console.log(`\\n❌ MUST STAY TYPESCRIPT (${ineligible.length} components)\\n`)
  for (const comp of ineligible) {
    console.log(`   ${comp.name} (${comp.category})`)
    console.log(`      Complexity: ${comp.complexity}`)
    console.log(`      Reasons: ${comp.reasons.join(', ')}`)
  }

  console.log(`\\n📊 Summary:`)
  console.log(`   Eligible for JSON: ${eligible.length}`)
  console.log(`   Must stay TypeScript: ${ineligible.length}`)
  console.log(`   Conversion rate: ${Math.round(eligible.length / (eligible.length + ineligible.length) * 100)}%`)
}

main().catch(console.error)
