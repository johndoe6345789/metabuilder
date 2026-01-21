#!/usr/bin/env node

/**
 * Page List Script
 * 
 * Lists all pages defined in pages.json with their configuration.
 * 
 * Usage:
 *   node scripts/list-pages.js [--format=table|json]
 */

const fs = require('fs')
const path = require('path')

const pagesJsonPath = path.join(process.cwd(), 'src', 'config', 'pages.json')

if (!fs.existsSync(pagesJsonPath)) {
  console.error('❌ Could not find src/config/pages.json')
  process.exit(1)
}

const pagesConfig = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'))
const format = process.argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'table'

if (format === 'json') {
  console.log(JSON.stringify(pagesConfig.pages, null, 2))
  process.exit(0)
}

console.log('\n📋 CodeForge Pages Configuration\n')
console.log('═══════════════════════════════════════════════════════════════════════════\n')

const sortedPages = [...pagesConfig.pages].sort((a, b) => a.order - b.order)

sortedPages.forEach((page, index) => {
  const enabled = page.enabled ? '✅' : '❌'
  const hasToggle = page.toggleKey ? `🎚️  ${page.toggleKey}` : '➖'
  const hasShortcut = page.shortcut ? `⌨️  ${page.shortcut}` : '➖'
  
  console.log(`${String(index + 1).padStart(2, '0')}. ${page.title}`)
  console.log(`    ID:        ${page.id}`)
  console.log(`    Component: ${page.component}`)
  console.log(`    Icon:      ${page.icon}`)
  console.log(`    Enabled:   ${enabled}`)
  console.log(`    Toggle:    ${hasToggle}`)
  console.log(`    Shortcut:  ${hasShortcut}`)
  console.log(`    Order:     ${page.order}`)
  if (page.requiresResizable) {
    console.log(`    Layout:    Resizable Split-Pane`)
  }
  console.log('')
})

console.log('═══════════════════════════════════════════════════════════════════════════')
console.log(`\nTotal Pages: ${pagesConfig.pages.length}`)
console.log(`Enabled: ${pagesConfig.pages.filter(p => p.enabled).length}`)
console.log(`With Shortcuts: ${pagesConfig.pages.filter(p => p.shortcut).length}`)
console.log(`With Feature Toggles: ${pagesConfig.pages.filter(p => p.toggleKey).length}`)
console.log('')

const shortcuts = sortedPages
  .filter(p => p.shortcut && p.enabled)
  .map(p => `  ${p.shortcut.padEnd(12)} → ${p.title}`)

if (shortcuts.length > 0) {
  console.log('\n⌨️  Keyboard Shortcuts\n')
  console.log('───────────────────────────────────────────────────────────────────────────')
  shortcuts.forEach(s => console.log(s))
  console.log('')
}

const featureToggles = sortedPages
  .filter(p => p.toggleKey && p.enabled)
  .map(p => `  ${p.toggleKey.padEnd(20)} → ${p.title}`)

if (featureToggles.length > 0) {
  console.log('\n🎚️  Feature Toggles\n')
  console.log('───────────────────────────────────────────────────────────────────────────')
  featureToggles.forEach(t => console.log(t))
  console.log('')
}

console.log('\n💡 Tips:')
console.log('  • Edit src/config/pages.json to add/modify pages')
console.log('  • Run with --format=json for JSON output')
console.log('  • See DECLARATIVE_SYSTEM.md for full documentation')
console.log('')
