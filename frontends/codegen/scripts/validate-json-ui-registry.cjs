#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const registryPath = path.join(process.cwd(), 'json-components-registry.json')
const schemaPath = path.join(process.cwd(), 'src', 'schemas', 'registry-validation.json')

if (!fs.existsSync(registryPath)) {
  console.error('❌ Could not find json-components-registry.json')
  process.exit(1)
}

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Could not find src/schemas/registry-validation.json')
  process.exit(1)
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))

const primitiveTypes = new Set([
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'aside',
  'nav',
])

const registryTypes = new Set()

for (const entry of registry.components || []) {
  if (entry.source === 'atoms' || entry.source === 'molecules') {
    const name = entry.export || entry.name || entry.type
    if (name) {
      registryTypes.add(name)
    }
  }
}

const schemaTypes = new Set()

const collectTypes = (components) => {
  if (!components) return
  if (Array.isArray(components)) {
    components.forEach(collectTypes)
    return
  }
  if (components.type) {
    schemaTypes.add(components.type)
  }
  if (components.children) {
    collectTypes(components.children)
  }
}

collectTypes(schema.components || [])

const missing = []
for (const type of schemaTypes) {
  if (!primitiveTypes.has(type) && !registryTypes.has(type)) {
    missing.push(type)
  }
}

if (missing.length) {
  console.error(`❌ Missing registry entries for: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('✅ JSON UI registry validation passed for primitives and atom/molecule components.')
