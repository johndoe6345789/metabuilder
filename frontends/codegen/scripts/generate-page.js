#!/usr/bin/env node

/**
 * Page Generator Script
 * 
 * Generates boilerplate code for adding a new page to CodeForge.
 * 
 * Usage:
 *   node scripts/generate-page.js MyNewDesigner "My New Designer" "Sparkle"
 * 
 * This will create:
 *   - Component file
 *   - JSON configuration snippet
 *   - Props mapping snippet
 *   - ComponentMap entry snippet
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)

if (args.length < 3) {
  console.error('Usage: node scripts/generate-page.js <ComponentName> <Title> <Icon> [toggleKey] [shortcut]')
  console.error('Example: node scripts/generate-page.js MyNewDesigner "My New Designer" "Sparkle" "myNewFeature" "ctrl+shift+n"')
  process.exit(1)
}

const [componentName, title, icon, toggleKey, shortcut] = args

const kebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const pageId = kebabCase(componentName)

const componentTemplate = `export function ${componentName}() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">${title}</h1>
            <p className="text-muted-foreground mt-2">
              Add your description here
            </p>
          </div>

          <div className="border border-border rounded-lg p-6">
            <p className="text-center text-muted-foreground">
              Start building your ${title.toLowerCase()} here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
`

const nextOrder = 21

const pageConfigSnippet = `{
  "id": "${pageId}",
  "title": "${title}",
  "icon": "${icon}",
  "component": "${componentName}",
  "enabled": true,${toggleKey ? `\n  "toggleKey": "${toggleKey}",` : ''}${shortcut ? `\n  "shortcut": "${shortcut}",` : ''}
  "order": ${nextOrder}
}`

const componentMapSnippet = `  ${componentName}: lazy(() => import('@/components/${componentName}').then(m => ({ default: m.${componentName} }))),`

const propsMapSnippet = `      '${componentName}': {
        // Add your props here
      },`

const featureToggleSnippet = toggleKey ? `  ${toggleKey}: boolean` : null

console.log('\n🎨 CodeForge Page Generator\n')
console.log('═══════════════════════════════════════\n')

console.log('📁 Component file will be created at:')
console.log(`   src/components/${componentName}.tsx\n`)

console.log('📝 Component code:')
console.log('───────────────────────────────────────')
console.log(componentTemplate)
console.log('───────────────────────────────────────\n')

console.log('⚙️  Add this to src/config/pages.json:')
console.log('───────────────────────────────────────')
console.log(pageConfigSnippet)
console.log('───────────────────────────────────────\n')

console.log('🗺️  Add this to componentMap in src/App.tsx:')
console.log('───────────────────────────────────────')
console.log(componentMapSnippet)
console.log('───────────────────────────────────────\n')

console.log('🔧 Add this to getPropsForComponent in src/App.tsx:')
console.log('───────────────────────────────────────')
console.log(propsMapSnippet)
console.log('───────────────────────────────────────\n')

if (featureToggleSnippet) {
  console.log('🎚️  Add this to FeatureToggles in src/types/project.ts:')
  console.log('───────────────────────────────────────')
  console.log(featureToggleSnippet)
  console.log('───────────────────────────────────────\n')
}

console.log('✅ Next Steps:')
console.log('   1. Create the component file')
console.log('   2. Add configuration to pages.json')
console.log('   3. Add component to componentMap')
console.log('   4. (Optional) Add props mapping')
if (featureToggleSnippet) {
  console.log('   5. Add feature toggle type and default value')
}
console.log('\n')

const componentPath = path.join(process.cwd(), 'src', 'components', `${componentName}.tsx`)

if (fs.existsSync(componentPath)) {
  console.log(`⚠️  Warning: ${componentPath} already exists. Skipping file creation.`)
} else {
  const createFile = process.argv.includes('--create')
  
  if (createFile) {
    fs.writeFileSync(componentPath, componentTemplate, 'utf8')
    console.log(`✅ Created ${componentPath}`)
  } else {
    console.log('💡 Run with --create flag to automatically create the component file')
  }
}

console.log('\n')
