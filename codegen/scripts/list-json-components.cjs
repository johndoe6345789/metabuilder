#!/usr/bin/env node

/**
 * JSON Components List Script
 * 
 * Lists all components that can be rendered from JSON using the JSON UI system.
 * 
 * Usage:
 *   node scripts/list-json-components.cjs [--format=table|json] [--status=all|supported|planned]
 */

const fs = require('fs')
const path = require('path')

// Read the JSON components registry
const registryPath = path.join(process.cwd(), 'json-components-registry.json')

if (!fs.existsSync(registryPath)) {
  console.error('❌ Could not find json-components-registry.json')
  process.exit(1)
}

let registry
try {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
} catch (e) {
  console.error('❌ Failed to parse json-components-registry.json:', e.message)
  process.exit(1)
}

const format = process.argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'table'
const statusFilter = process.argv.find(arg => arg.startsWith('--status='))?.split('=')[1] || 'all'

// Filter components by status if requested
let componentsList = registry.components
if (statusFilter !== 'all') {
  componentsList = componentsList.filter(c => c.status === statusFilter)
}

if (format === 'json') {
  console.log(JSON.stringify(componentsList, null, 2))
  process.exit(0)
}

// Table format output
console.log('\n🧩 JSON-Compatible Components\n')
console.log('═══════════════════════════════════════════════════════════════════════════\n')
console.log(`These components can be rendered from JSON schemas using the JSON UI system.`)
if (statusFilter !== 'all') {
  console.log(`\nFiltered by status: ${statusFilter}`)
}
console.log()

// Group by category
const categories = ['layout', 'input', 'display', 'navigation', 'feedback', 'data', 'custom']
const categoryIcons = {
  layout: '📐',
  input: '⌨️ ',
  display: '🎨',
  navigation: '🧭',
  feedback: '💬',
  data: '📊',
  custom: '⚡'
}

categories.forEach(category => {
  const categoryComps = componentsList.filter(c => c.category === category)
  
  if (categoryComps.length === 0) return
  
  console.log(`\n${categoryIcons[category]} ${category.toUpperCase()}\n`)
  console.log('───────────────────────────────────────────────────────────────────────────')
  
  categoryComps.forEach(comp => {
    const children = comp.canHaveChildren ? '👶 Can have children' : '➖ No children'
    let statusIcon = comp.status === 'supported' ? '✅' : '📋'
    if (comp.status === 'json-compatible') statusIcon = '🔥'
    if (comp.status === 'maybe-json-compatible') statusIcon = '⚠️ '
    
    const source = comp.source ? ` [${comp.source}]` : ''
    
    console.log(`  ${statusIcon} ${comp.name} (${comp.type})${source}`)
    console.log(`    ${comp.description}`)
    console.log(`    ${children}`)
    if (comp.subComponents) {
      console.log(`    Sub-components: ${comp.subComponents.join(', ')}`)
    }
    if (comp.jsonCompatible !== undefined && !comp.jsonCompatible) {
      console.log(`    ⚠️  Not JSON-powered (${comp.jsonReason || 'complex state/logic'})`)
    }
    console.log('')
  })
})

console.log('═══════════════════════════════════════════════════════════════════════════')
console.log(`\nTotal Components: ${componentsList.length}`)

if (statusFilter === 'all') {
  const supported = componentsList.filter(c => c.status === 'supported').length
  const planned = componentsList.filter(c => c.status === 'planned').length
  const jsonCompatible = componentsList.filter(c => c.status === 'json-compatible').length
  const maybeCompatible = componentsList.filter(c => c.status === 'maybe-json-compatible').length
  const atoms = componentsList.filter(c => c.source === 'atoms').length
  const molecules = componentsList.filter(c => c.source === 'molecules').length
  const organisms = componentsList.filter(c => c.source === 'organisms').length
  const ui = componentsList.filter(c => c.source === 'ui').length
  
  console.log(`\nBy Status:`)
  console.log(`  ✅ Supported: ${supported}`)
  console.log(`  🔥 JSON-Compatible: ${jsonCompatible}`)
  console.log(`  ⚠️  Maybe JSON-Compatible: ${maybeCompatible}`)
  console.log(`  📋 Planned: ${planned}`)
  
  console.log(`\nBy Source:`)
  if (atoms > 0) console.log(`  🧱 Atoms: ${atoms}`)
  if (molecules > 0) console.log(`  🧪 Molecules: ${molecules}`)
  if (organisms > 0) console.log(`  🦠 Organisms: ${organisms}`)
  if (ui > 0) console.log(`  🎨 UI: ${ui}`)
}

console.log(`\nBy Category:`)
categories.forEach(cat => {
  const count = componentsList.filter(c => c.category === cat).length
  if (count > 0) {
    console.log(`  ${categoryIcons[cat]} ${cat}: ${count}`)
  }
})

console.log(`\nComponents with children support: ${componentsList.filter(c => c.canHaveChildren).length}`)

console.log('\n💡 Tips:')
console.log('  • Full registry in json-components-registry.json')
console.log('  • Component types defined in src/types/json-ui.ts')
console.log('  • Component registry in src/lib/json-ui/component-registry.tsx')
console.log('  • Component definitions in src/lib/component-definitions.ts')
console.log('  • Run with --format=json for JSON output')
console.log('  • Run with --status=supported to see only supported components')
console.log('  • Run with --status=planned to see only planned components')
console.log('')
