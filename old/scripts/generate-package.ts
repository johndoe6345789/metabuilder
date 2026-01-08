#!/usr/bin/env node
/**
 * Package Template Generator CLI
 * 
 * Usage:
 *   npx ts-node scripts/generate-package.ts <package_id> [options]
 * 
 * Examples:
 *   npx ts-node scripts/generate-package.ts my_package
 *   npx ts-node scripts/generate-package.ts my_forum --with-schema --entities ForumThread,ForumPost
 *   npx ts-node scripts/generate-package.ts my_widget --dependency --category ui
 */

import * as fs from 'fs'
import * as path from 'path'

interface PackageConfig {
  packageId: string
  name: string
  description: string
  author: string
  category: string
  minLevel: number
  primary: boolean
  withSchema: boolean
  withTests: boolean
  withComponents: boolean
  entities: string[]
  components: string[]
  dependencies: string[]
}

interface GeneratedFile {
  path: string
  content: string
}

const CATEGORIES = [
  'ui', 'editors', 'tools', 'social', 'media', 'gaming',
  'admin', 'config', 'core', 'demo', 'development', 'managers'
]

function parseArgs(args: string[]): { packageId: string; options: Partial<PackageConfig> } {
  const options: Partial<PackageConfig> = {
    category: 'ui',
    minLevel: 2,
    primary: true,
    withSchema: false,
    withTests: true,
    withComponents: false,
    entities: [],
    components: [],
    dependencies: []
  }

  let packageId = ''

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (!arg.startsWith('--') && !packageId) {
      packageId = arg
    } else if (arg === '--name') {
      options.name = args[++i]
    } else if (arg === '--description') {
      options.description = args[++i]
    } else if (arg === '--category') {
      options.category = args[++i]
    } else if (arg === '--min-level') {
      options.minLevel = parseInt(args[++i], 10)
    } else if (arg === '--primary') {
      options.primary = true
    } else if (arg === '--dependency') {
      options.primary = false
    } else if (arg === '--with-schema') {
      options.withSchema = true
    } else if (arg === '--entities') {
      options.entities = args[++i].split(',').map(e => e.trim())
    } else if (arg === '--with-components') {
      options.withComponents = true
    } else if (arg === '--components') {
      options.components = args[++i].split(',').map(c => c.trim())
    } else if (arg === '--deps') {
      options.dependencies = args[++i].split(',').map(d => d.trim())
    }
  }

  return { packageId, options }
}

function toPascalCase(str: string): string {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
}

function toDisplayName(packageId: string): string {
  return packageId.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function generateMetadata(config: PackageConfig): string {
  const prefix = config.packageId.replace(/_/g, '.')
  
  const permissions: Record<string, { minLevel: number; description: string }> = {
    [`${prefix}.view`]: {
      minLevel: config.minLevel,
      description: `View ${config.name}`
    }
  }

  if (config.primary) {
    permissions[`${prefix}.edit`] = {
      minLevel: config.minLevel,
      description: `Edit ${config.name} content`
    }
  }

  if (config.withSchema && config.entities.length > 0) {
    for (const entity of config.entities) {
      const entityLower = entity.toLowerCase()
      permissions[`${prefix}.${entityLower}.create`] = {
        minLevel: config.minLevel,
        description: `Create ${entity}`
      }
      permissions[`${prefix}.${entityLower}.update`] = {
        minLevel: config.minLevel,
        description: `Update ${entity}`
      }
      permissions[`${prefix}.${entityLower}.delete`] = {
        minLevel: Math.min(config.minLevel + 1, 6),
        description: `Delete ${entity}`
      }
    }
  }

  const metadata = {
    packageId: config.packageId,
    name: config.name,
    version: '1.0.0',
    description: config.description,
    icon: 'static_content/icon.svg',
    author: config.author,
    category: config.category,
    primary: config.primary,
    dependencies: config.dependencies,
    devDependencies: ['testing'],
    exports: {
      components: config.components,
      scripts: ['lifecycle']
    },
    tests: {
      scripts: ['tests/metadata.test.json']
    },
    minLevel: config.minLevel,
    ...(config.withSchema && config.entities.length > 0 ? {
      schema: {
        entities: config.entities,
        path: 'schema/entities.yaml'
      }
    } : {}),
    permissions
  }

  return JSON.stringify(metadata, null, 2)
}

function generateMetadataTestJson(config: PackageConfig): string {
  const tests = {
    $schema: 'https://metabuilder.dev/schemas/tests.schema.json',
    schemaVersion: '2.0.0',
    package: config.packageId,
    description: `Metadata validation tests for ${config.name}`,
    testSuites: [
      {
        id: 'metadata_validation',
        name: `${config.name} Metadata`,
        description: 'Verify package metadata integrity',
        tests: [
          {
            id: 'package-id',
            name: 'packageId matches',
            act: {
              type: 'function_call',
              target: 'getPackageMetadata',
              input: config.packageId
            },
            assert: {
              expectations: [
                {
                  type: 'equals',
                  actual: 'result.packageId',
                  expected: config.packageId,
                  description: 'packageId comes from directory name'
                }
              ]
            }
          },
          {
            id: 'icon-exists',
            name: 'Icon exists',
            act: {
              type: 'function_call',
              target: 'checkFileExists',
              input: `${config.packageId}/static_content/icon.svg`
            },
            assert: {
              expectations: [
                {
                  type: 'truthy',
                  actual: 'result',
                  description: 'Icon file is present'
                }
              ]
            }
          },
          {
            id: 'metadata-schema',
            name: 'package.json validates',
            act: {
              type: 'function_call',
              target: 'validateAgainstSchema',
              input: {
                file: `${config.packageId}/package.json`,
                schema: 'https://metabuilder.dev/schemas/package-metadata.schema.json'
              }
            },
            assert: {
              expectations: [
                {
                  type: 'truthy',
                  actual: 'result.valid',
                  description: 'package.json conforms to metadata schema'
                }
              ]
            }
          }
        ]
      }
    ]
  }

  return JSON.stringify(tests, null, 2)
}

function generateSchemaYaml(config: PackageConfig): string {
  if (!config.entities.length) return '# No entities defined\n'

  const lines = [
    `# ${config.name} Entity Definitions`,
    '# Auto-generated by package template generator',
    ''
  ]

  for (const entity of config.entities) {
    const prefixedEntity = `Pkg_${toPascalCase(config.packageId)}_${entity}`
    lines.push(`${prefixedEntity}:`)
    lines.push(`  description: "${entity} entity for ${config.name}"`)
    lines.push('  fields:')
    lines.push('    id:')
    lines.push('      type: string')
    lines.push('      primary: true')
    lines.push('    tenantId:')
    lines.push('      type: string')
    lines.push('      required: true')
    lines.push('      index: true')
    lines.push('    createdAt:')
    lines.push('      type: datetime')
    lines.push('      default: now')
    lines.push('    updatedAt:')
    lines.push('      type: datetime')
    lines.push('      onUpdate: now')
    lines.push('    # Entity-specific fields - customize as needed')
    lines.push('    name:')
    lines.push('      type: string')
    lines.push('      required: true')
    lines.push('    description:')
    lines.push('      type: text')
    lines.push('      required: false')
    lines.push('    status:')
    lines.push('      type: string')
    lines.push('      default: active')
    lines.push('')
  }

  return lines.join('\n')
}

function generateComponentsJson(config: PackageConfig): string {
  const components = config.components.map(name => ({
    id: `${config.packageId}_${name.toLowerCase()}`,
    type: 'container',
    name,
    description: `${name} component for ${config.name}`,
    props: {},
    layout: { type: 'flex', props: { direction: 'column', gap: 2 } },
    bindings: {}
  }))
  return JSON.stringify(components, null, 2)
}

function generateLayoutJson(config: PackageConfig): string {
  const layout = {
    id: `${config.packageId}_layout`,
    name: `${config.name} Layout`,
    type: 'page',
    props: { title: config.name, minLevel: config.minLevel },
    children: [
      {
        id: `${config.packageId}_header`,
        type: 'container',
        props: { variant: 'header' },
        children: [
          { id: `${config.packageId}_title`, type: 'text', props: { variant: 'h1', content: config.name } },
          { id: `${config.packageId}_description`, type: 'text', props: { variant: 'body1', content: config.description } }
        ]
      },
      {
        id: `${config.packageId}_content`,
        type: 'container',
        props: { variant: 'main' },
        children: [
          { id: `${config.packageId}_placeholder`, type: 'text', props: { content: 'Add your components here' } }
        ]
      }
    ]
  }
  return JSON.stringify(layout, null, 2)
}

function generateIconSvg(config: PackageConfig): string {
  const letter = config.name.charAt(0).toUpperCase()
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor" stroke="none">${letter}</text>
</svg>`
}

function generateReadme(config: PackageConfig): string {
  const lines = [
    `# ${config.name}`,
    '',
    config.description,
    '',
    '## Installation',
    '',
    'This package is part of the MetaBuilder platform and is installed automatically.',
    '',
    '## Access Level',
    '',
    `Minimum level required: **${config.minLevel}**`,
    '',
    config.primary
      ? 'This is a **primary package** that can own routes.'
      : 'This is a **dependency package** that provides shared functionality.',
    ''
  ]

  if (config.withSchema && config.entities.length > 0) {
    lines.push('## Entities')
    lines.push('')
    for (const entity of config.entities) {
      lines.push(`- ${entity}`)
    }
    lines.push('')
  }

  if (config.components.length > 0) {
    lines.push('## Components')
    lines.push('')
    for (const comp of config.components) {
      lines.push(`- \`${comp}\``)
    }
    lines.push('')
  }

  lines.push('## Development')
  lines.push('')
  lines.push('```bash')
  lines.push('# Run tests')
  lines.push(`npm run test:package ${config.packageId}`)
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

function generateIndexTs(config: PackageConfig): string {
  return `// ${config.name} package exports
// Auto-generated by package template generator

import metadata from './metadata.json'
import components from './components.json'
import layout from './layout.json'

export const packageSeed = {
  metadata,
  components,
  layout,
}

export default packageSeed
`
}

function generate(config: PackageConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []

  // Core files
  files.push({ path: 'seed/metadata.json', content: generateMetadata(config) })
  files.push({ path: 'seed/components.json', content: generateComponentsJson(config) })
  files.push({ path: 'seed/layout.json', content: generateLayoutJson(config) })
  // Note: functions.json removed - script_schema.json requires full implementations with function bodies,
  // not just metadata declarations. Use properly named script files (e.g., automation.json, lifecycle.json)
  files.push({ path: 'seed/index.ts', content: generateIndexTs(config) })

  // Schema files
  if (config.withSchema && config.entities.length > 0) {
    files.push({ path: 'seed/schema/entities.yaml', content: generateSchemaYaml(config) })
  }

  // Test files
  if (config.withTests) {
    files.push({ path: 'seed/tests/metadata.test.json', content: generateMetadataTestJson(config) })
  }

  // Static content
  files.push({ path: 'static_content/icon.svg', content: generateIconSvg(config) })
  files.push({ path: 'README.md', content: generateReadme(config) })

  return files
}

function writeFiles(packagePath: string, files: GeneratedFile[]): void {
  for (const file of files) {
    const fullPath = path.join(packagePath, file.path)
    const dir = path.dirname(fullPath)
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(fullPath, file.content)
    console.log(`  Created: ${file.path}`)
  }
}

function printHelp(): void {
  console.log(`
Package Template Generator
==========================

Usage: npx ts-node scripts/generate-package.ts <package_id> [options]

Options:
  --name <name>           Display name (default: derived from package_id)
  --description <desc>    Package description
  --category <cat>        Package category (default: ui)
  --min-level <n>         Minimum access level 0-6 (default: 2)
  --primary               Package can own routes (default)
  --dependency            Package is dependency-only
  --with-schema           Include database schema scaffolding
  --entities <e1,e2>      Entity names for schema (comma-separated, PascalCase)
  --with-components       Include component scaffolding
  --components <c1,c2>    Component names (comma-separated, PascalCase)
  --deps <d1,d2>          Package dependencies (comma-separated)

Categories: ${CATEGORIES.join(', ')}

Examples:
  npx ts-node scripts/generate-package.ts my_package
  npx ts-node scripts/generate-package.ts my_forum --with-schema --entities ForumThread,ForumPost
  npx ts-node scripts/generate-package.ts my_widget --dependency --category ui
  npx ts-node scripts/generate-package.ts my_dashboard --with-components --components StatCard,Chart
`)
}

// Main
const args = process.argv.slice(2)

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp()
  process.exit(0)
}

const { packageId, options } = parseArgs(args)

if (!packageId) {
  console.error('Error: package_id is required')
  process.exit(1)
}

if (!/^[a-z][a-z0-9_]*$/.test(packageId)) {
  console.error('Error: package_id must be lowercase with underscores, starting with a letter')
  process.exit(1)
}

if (options.category && !CATEGORIES.includes(options.category)) {
  console.error(`Error: Invalid category. Must be one of: ${CATEGORIES.join(', ')}`)
  process.exit(1)
}

const config: PackageConfig = {
  packageId,
  name: options.name || toDisplayName(packageId),
  description: options.description || `${toDisplayName(packageId)} package for MetaBuilder`,
  author: 'MetaBuilder',
  category: options.category || 'ui',
  minLevel: options.minLevel ?? 2,
  primary: options.primary ?? true,
  withSchema: options.withSchema || false,
  withTests: options.withTests ?? true,
  withComponents: options.withComponents || false,
  entities: options.entities || [],
  components: options.components || [],
  dependencies: options.dependencies || []
}

const packagesDir = path.join(process.cwd(), 'packages')
const packagePath = path.join(packagesDir, packageId)

if (fs.existsSync(packagePath)) {
  console.error(`Error: Package directory already exists: ${packagePath}`)
  process.exit(1)
}

console.log(`\nGenerating package: ${config.name}`)
console.log(`  Location: ${packagePath}`)
console.log(`  Category: ${config.category}`)
console.log(`  Level: ${config.minLevel}`)
console.log(`  Type: ${config.primary ? 'Primary' : 'Dependency'}`)
if (config.withSchema) console.log(`  Entities: ${config.entities.join(', ')}`)
if (config.components.length) console.log(`  Components: ${config.components.join(', ')}`)
console.log('')

const files = generate(config)
writeFiles(packagePath, files)

console.log(`\n✅ Package '${packageId}' created successfully!`)
console.log(`\nNext steps:`)
console.log(`  1. Review generated files in packages/${packageId}/`)
console.log(`  2. Add package-specific logic to seed/scripts/`)
console.log(`  3. Update components.json with your component definitions`)
console.log(`  4. Run tests: npm run test:package ${packageId}`)
