import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { UIComponentSchema } from '../src/lib/json-ui/schema'

interface ComponentDefinitionProp {
  name: string
  type: 'string' | 'number' | 'boolean'
  options?: Array<string | number | boolean>
}

interface ComponentDefinition {
  type: string
  props?: ComponentDefinitionProp[]
}

interface ComponentNode {
  component: Record<string, unknown>
  path: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const componentDefinitionsPath = path.join(rootDir, 'src/lib/component-definitions.json')
const componentRegistryPath = path.join(rootDir, 'src/lib/json-ui/component-registry.ts')
const jsonRegistryPath = path.join(rootDir, 'json-components-registry.json')

const readJson = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const readText = (filePath: string) => fs.readFileSync(filePath, 'utf8')

const componentDefinitions = readJson(componentDefinitionsPath) as ComponentDefinition[]
const componentDefinitionMap = new Map(componentDefinitions.map((def) => [def.type, def]))

const jsonRegistry = readJson(jsonRegistryPath) as {
  components?: Array<{ type?: string; name?: string; export?: string }>
}

const extractObjectLiteral = (content: string, marker: string) => {
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

const extractKeysFromObjectLiteral = (literal: string) => {
  const body = literal.trim().replace(/^\{/, '').replace(/\}$/, '')
  const entries = body
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  const keys = new Set<string>()

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

const componentRegistryContent = readText(componentRegistryPath)
const primitiveKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(componentRegistryContent, 'export const primitiveComponents')
)
const shadcnKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(componentRegistryContent, 'export const shadcnComponents')
)
const wrapperKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(componentRegistryContent, 'export const jsonWrapperComponents')
)
const iconKeys = extractKeysFromObjectLiteral(
  extractObjectLiteral(componentRegistryContent, 'export const iconComponents')
)

const registryTypes = new Set<string>(
  (jsonRegistry.components ?? [])
    .map((entry) => entry.type ?? entry.name ?? entry.export)
    .filter((value): value is string => Boolean(value))
)

const validComponentTypes = new Set<string>([
  ...primitiveKeys,
  ...shadcnKeys,
  ...wrapperKeys,
  ...iconKeys,
  ...componentDefinitions.map((def) => def.type),
  ...registryTypes,
])

const schemaRoots = [
  path.join(rootDir, 'src/config'),
  path.join(rootDir, 'src/data'),
]

const collectJsonFiles = (dir: string, files: string[] = []) => {
  if (!fs.existsSync(dir)) {
    return files
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, files)
      return
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath)
    }
  })
  return files
}

const isComponentNode = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (typeof candidate.id !== 'string' || typeof candidate.type !== 'string') {
    return false
  }
  return (
    'props' in candidate ||
    'children' in candidate ||
    'className' in candidate ||
    'bindings' in candidate ||
    'events' in candidate ||
    'dataBinding' in candidate ||
    'style' in candidate
  )
}

const findComponents = (value: unknown, currentPath: string): ComponentNode[] => {
  const components: ComponentNode[] = []
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      components.push(...findComponents(item, `${currentPath}[${index}]`))
    })
    return components
  }
  if (!value || typeof value !== 'object') {
    return components
  }

  const candidate = value as Record<string, unknown>
  if (isComponentNode(candidate)) {
    components.push({ component: candidate, path: currentPath })
  }

  Object.entries(candidate).forEach(([key, child]) => {
    const nextPath = currentPath ? `${currentPath}.${key}` : key
    components.push(...findComponents(child, nextPath))
  })

  return components
}

const isTemplateBinding = (value: unknown) =>
  typeof value === 'string' && value.includes('{{') && value.includes('}}')

const validateProps = (
  component: Record<string, unknown>,
  filePath: string,
  componentPath: string,
  errors: string[]
) => {
  const definition = componentDefinitionMap.get(component.type as string)
  const props = component.props

  if (!definition || !definition.props || !props || typeof props !== 'object') {
    return
  }

  const propDefinitions = new Map(definition.props.map((prop) => [prop.name, prop]))

  Object.entries(props as Record<string, unknown>).forEach(([propName, propValue]) => {
    const propDefinition = propDefinitions.get(propName)
    if (!propDefinition) {
      errors.push(
        `${filePath} -> ${componentPath}: Unknown prop "${propName}" for component type "${component.type}"`
      )
      return
    }

    const expectedType = propDefinition.type
    const actualType = Array.isArray(propValue) ? 'array' : typeof propValue

    if (
      expectedType === 'string' &&
      actualType !== 'string' &&
      propValue !== undefined
    ) {
      errors.push(
        `${filePath} -> ${componentPath}: Prop "${propName}" expected string but got ${actualType}`
      )
      return
    }

    if (
      expectedType === 'number' &&
      actualType !== 'number' &&
      !isTemplateBinding(propValue)
    ) {
      errors.push(
        `${filePath} -> ${componentPath}: Prop "${propName}" expected number but got ${actualType}`
      )
      return
    }

    if (
      expectedType === 'boolean' &&
      actualType !== 'boolean' &&
      !isTemplateBinding(propValue)
    ) {
      errors.push(
        `${filePath} -> ${componentPath}: Prop "${propName}" expected boolean but got ${actualType}`
      )
      return
    }

    if (propDefinition.options && propValue !== undefined) {
      if (!propDefinition.options.includes(propValue as string | number | boolean)) {
        errors.push(
          `${filePath} -> ${componentPath}: Prop "${propName}" value must be one of ${propDefinition.options.join(', ')}`
        )
      }
    }
  })
}

const validateComponentsInFile = (filePath: string, errors: string[]) => {
  let parsed: unknown
  try {
    parsed = readJson(filePath)
  } catch (error) {
    errors.push(`${filePath}: Unable to parse JSON - ${(error as Error).message}`)
    return
  }

  const components = findComponents(parsed, 'root')
  if (components.length === 0) {
    return
  }

  components.forEach(({ component, path: componentPath }) => {
    const parseResult = UIComponentSchema.safeParse(component)
    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')
      errors.push(
        `${filePath} -> ${componentPath}: Schema validation failed\n${issueMessages}`
      )
    }

    if (!validComponentTypes.has(component.type as string)) {
      errors.push(
        `${filePath} -> ${componentPath}: Unknown component type "${component.type}"`
      )
    }

    validateProps(component, filePath, componentPath, errors)
  })
}

const jsonFiles = schemaRoots.flatMap((dir) => collectJsonFiles(dir))
const errors: string[] = []

jsonFiles.forEach((filePath) => validateComponentsInFile(filePath, errors))

if (errors.length > 0) {
  console.error('JSON schema validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('JSON schema validation passed.')
