const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const registryPath = path.join(rootDir, 'json-components-registry.json')
const definitionsPath = path.join(rootDir, 'src/lib/component-definitions.json')
const componentTypesPath = path.join(rootDir, 'src/types/json-ui-component-types.ts')
const uiRegistryPath = path.join(rootDir, 'src/lib/json-ui/component-registry.ts')
const atomIndexPath = path.join(rootDir, 'src/components/atoms/index.ts')
const moleculeIndexPath = path.join(rootDir, 'src/components/molecules/index.ts')

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const readText = (filePath) => fs.readFileSync(filePath, 'utf8')

const registryData = readJson(registryPath)
const supportedComponents = (registryData.components ?? []).filter(
  (component) => component.status === 'supported'
)

const componentDefinitions = readJson(definitionsPath)
const definitionTypes = new Set(componentDefinitions.map((def) => def.type))

const componentTypesContent = readText(componentTypesPath)
const componentTypeSet = new Set()
const componentTypeRegex = /"([^"]+)"/g
let match
while ((match = componentTypeRegex.exec(componentTypesContent)) !== null) {
  componentTypeSet.add(match[1])
}

const extractObjectLiteral = (content, marker) => {
  const markerIndex = content.indexOf(marker)
  if (markerIndex === -1) {
    throw new Error(`Unable to locate ${marker} in component registry file`)
  }
  const braceStart = content.indexOf('{', markerIndex)
  if (braceStart === -1) {
    throw new Error(`Unable to locate opening brace for ${marker}`)
  }
  let depth = 0
  for (let i = braceStart; i < content.length; i += 1) {
    const char = content[i]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      return content.slice(braceStart, i + 1)
    }
  }
  throw new Error(`Unable to locate closing brace for ${marker}`)
}

const extractKeysFromObjectLiteral = (literal) => {
  const body = literal.trim().replace(/^\{/, '').replace(/\}$/, '')
  const entries = body
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  const keys = new Set()

  entries.forEach((entry) => {
    if (entry.startsWith('...')) {
      return
    }
    const [keyPart] = entry.split(':')
    const key = keyPart.trim()
    if (key) {
      keys.add(key)
    }
  })

  return keys
}

const uiRegistryContent = readText(uiRegistryPath)
const primitiveKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(uiRegistryContent, 'export const primitiveComponents')
)
const shadcnKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(uiRegistryContent, 'export const shadcnComponents')
)
const wrapperKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(uiRegistryContent, 'export const jsonWrapperComponents')
)
const iconKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(uiRegistryContent, 'export const iconComponents')
)

const extractExports = (content) => {
  const exportsSet = new Set()
  const exportRegex = /export\s+\{([^}]+)\}\s+from/g
  let exportMatch
  while ((exportMatch = exportRegex.exec(content)) !== null) {
    const names = exportMatch[1]
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
    names.forEach((name) => {
      const [exportName] = name.split(/\s+as\s+/)
      if (exportName) {
        exportsSet.add(exportName.trim())
      }
    })
  }
  return exportsSet
}

const atomExports = extractExports(readText(atomIndexPath))
const moleculeExports = extractExports(readText(moleculeIndexPath))

const uiRegistryKeys = new Set([
  ...primitiveKeys,
  ...shadcnKeys,
  ...wrapperKeys,
  ...iconKeys,
  ...atomExports,
  ...moleculeExports,
])

const missingInTypes = []
const missingInDefinitions = []
const missingInRegistry = []

supportedComponents.forEach((component) => {
  const typeName = component.type ?? component.name ?? component.export
  const registryName = component.export ?? component.name ?? component.type

  if (!typeName) {
    return
  }

  if (!componentTypeSet.has(typeName)) {
    missingInTypes.push(typeName)
  }

  if (!definitionTypes.has(typeName)) {
    missingInDefinitions.push(typeName)
  }

  const source = component.source ?? 'unknown'
  let registryHasComponent = uiRegistryKeys.has(registryName)

  if (source === 'atoms') {
    registryHasComponent = atomExports.has(registryName)
  }
  if (source === 'molecules') {
    registryHasComponent = moleculeExports.has(registryName)
  }
  if (source === 'ui') {
    registryHasComponent = shadcnKeys.has(registryName)
  }

  if (!registryHasComponent) {
    missingInRegistry.push(`${registryName} (${source})`)
  }
})

const unique = (list) => Array.from(new Set(list)).sort()

const errors = []
if (missingInTypes.length > 0) {
  errors.push(`Missing in ComponentType union: ${unique(missingInTypes).join(', ')}`)
}
if (missingInDefinitions.length > 0) {
  errors.push(`Missing in component definitions: ${unique(missingInDefinitions).join(', ')}`)
}
if (missingInRegistry.length > 0) {
  errors.push(`Missing in UI registry mapping: ${unique(missingInRegistry).join(', ')}`)
}

if (errors.length > 0) {
  console.error('Supported component validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Supported component validation passed.')
