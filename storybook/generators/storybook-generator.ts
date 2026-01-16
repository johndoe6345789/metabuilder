/**
 * Storybook Story Generator
 * 
 * Generates Storybook .stories.tsx files from declarative JSON story definitions
 * in packages/*/storybook/stories.json
 * 
 * Usage:
 *   import { generateStorybookStories } from '@/lib/generators/storybook-generator'
 *   await generateStorybookStories('ui_home')
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

export interface StorybookDefinition {
  $schema: string
  featured?: boolean
  excludeFromDiscovery?: boolean
  category?: string
  title?: string
  description?: string
  stories: Story[]
  renders?: Record<string, RenderMetadata>
  defaultContext?: Record<string, unknown>
  contextVariants?: ContextVariant[]
  scripts?: {
    renderFunctions?: string[]
    ignoredScripts?: string[]
  }
  argTypes?: Record<string, unknown>
  parameters?: Record<string, unknown>
}

export interface Story {
  name: string
  render: string
  description?: string
  type?: string
  args?: Record<string, unknown>
  argTypes?: Record<string, unknown>
  parameters?: Record<string, unknown>
}

export interface RenderMetadata {
  description?: string
  featured?: boolean
}

export interface ContextVariant {
  name: string
  description?: string
  context: Record<string, unknown>
}

/**
 * Generate Storybook story file from JSON definition
 */
export async function generateStorybookStory(
  packageName: string,
  packagesDir: string,
  outputDir: string
): Promise<string> {
  // Read the story definition
  const storyDefPath = join(packagesDir, packageName, 'storybook', 'stories.json')
  
  if (!existsSync(storyDefPath)) {
    throw new Error(`No storybook stories found for package: ${packageName}`)
  }

  const storyDefContent = await readFile(storyDefPath, 'utf-8')
  const storyDef: StorybookDefinition = JSON.parse(storyDefContent)

  // Generate TypeScript code
  const code = generateStoryCode(storyDef, packageName)

  // Write to output directory
  const outputPath = join(outputDir, `${packageName}.stories.tsx`)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, code, 'utf-8')

  return outputPath
}

/**
 * Generate TypeScript code from story definition
 */
function generateStoryCode(storyDef: StorybookDefinition, packageName: string): string {
  const lines: string[] = []

  // Header
  lines.push(`/**`)
  lines.push(` * Auto-generated Storybook stories for ${packageName} package`)
  lines.push(` * Generated from: packages/${packageName}/storybook/stories.json`)
  lines.push(` * DO NOT EDIT - This file is auto-generated`)
  lines.push(` */`)
  lines.push(``)
  lines.push(`import type { Meta, StoryObj } from '@storybook/react'`)
  lines.push(`import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'`)
  lines.push(`import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'`)
  lines.push(`import { join } from 'path'`)
  lines.push(``)

  // Load package at build time
  lines.push(`// Load package components`)
  lines.push(`const packagesDir = join(process.cwd(), '../../packages')`)
  lines.push(`const pkg = await loadJSONPackage(join(packagesDir, '${packageName}'))`)
  lines.push(``)

  // Meta configuration
  lines.push(`const meta: Meta = {`)
  lines.push(`  title: '${storyDef.category ? storyDef.category + '/' : ''}${storyDef.title || packageName}',`)
  
  if (storyDef.description) {
    lines.push(`  parameters: {`)
    lines.push(`    docs: {`)
    lines.push(`      description: {`)
    lines.push(`        component: '${storyDef.description}'`)
    lines.push(`      }`)
    lines.push(`    },`)
    if (storyDef.parameters) {
      lines.push(`    ...${JSON.stringify(storyDef.parameters, null, 2).split('\n').join('\n    ')}`)
    }
    lines.push(`  },`)
  }

  if (storyDef.argTypes) {
    lines.push(`  argTypes: ${JSON.stringify(storyDef.argTypes, null, 2).split('\n').join('\n  ')},`)
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(`export default meta`)
  lines.push(`type Story = StoryObj<typeof meta>`)
  lines.push(``)

  // Generate individual stories
  storyDef.stories.forEach(story => {
    generateStory(story, storyDef, lines)
  })

  return lines.join('\n')
}

/**
 * Generate a single story
 */
function generateStory(story: Story, storyDef: StorybookDefinition, lines: string[]): void {
  const storyName = story.name.replace(/\s+/g, '')
  
  lines.push(`/**`)
  lines.push(` * ${story.description || story.name}`)
  lines.push(` */`)
  lines.push(`export const ${storyName}: Story = {`)
  lines.push(`  name: '${story.name}',`)
  
  // Render function
  lines.push(`  render: () => {`)
  lines.push(`    const component = pkg.components?.find(c => c.id === '${story.render}' || c.name === '${story.render}')`)
  lines.push(`    if (!component) {`)
  lines.push(`      return <div style={{ padding: '1rem', border: '1px solid red' }}>`)
  lines.push(`        Component '${story.render}' not found in package`)
  lines.push(`      </div>`)
  lines.push(`    }`)
  
  if (story.args) {
    lines.push(`    const args = ${JSON.stringify(story.args, null, 2).split('\n').join('\n    ')}`)
    lines.push(`    return <JSONComponentRenderer component={component} props={args} allComponents={pkg.components} />`)
  } else {
    lines.push(`    return <JSONComponentRenderer component={component} allComponents={pkg.components} />`)
  }
  
  lines.push(`  },`)

  // Args
  if (story.args) {
    lines.push(`  args: ${JSON.stringify(story.args, null, 2).split('\n').join('\n  ')},`)
  }

  // Parameters
  if (story.parameters) {
    lines.push(`  parameters: ${JSON.stringify(story.parameters, null, 2).split('\n').join('\n  ')},`)
  }

  lines.push(`}`)
  lines.push(``)
}

/**
 * Discover all packages with Storybook stories
 */
export async function discoverStorybookPackages(packagesDir: string): Promise<string[]> {
  const { readdir } = await import('fs/promises')
  const packages: string[] = []

  const packageDirs = await readdir(packagesDir, { withFileTypes: true })

  for (const dir of packageDirs) {
    if (dir.isDirectory()) {
      const storyPath = join(packagesDir, dir.name, 'storybook', 'stories.json')
      if (existsSync(storyPath)) {
        packages.push(dir.name)
      }
    }
  }

  return packages
}

/**
 * Generate stories for all packages
 */
export async function generateAllStorybookStories(
  packagesDir: string,
  outputDir: string
): Promise<string[]> {
  const packages = await discoverStorybookPackages(packagesDir)
  const generated: string[] = []

  for (const pkg of packages) {
    try {
      const path = await generateStorybookStory(pkg, packagesDir, outputDir)
      generated.push(path)
      console.log(`✓ Generated: ${path}`)
    } catch (error) {
      console.error(`✗ Failed to generate stories for ${pkg}:`, error)
    }
  }

  return generated
}
