/**
 * JSON Storybook Story Loader
 * 
 * Directly loads and renders Storybook stories from JSON definitions without code generation.
 * Stories are interpreted at runtime from packages/*/storybook/stories.json
 * 
 * This is the meta/abstract approach - JSON itself defines renderable stories.
 */

import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
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
 * Discover all packages with Storybook story definitions
 */
export async function discoverStoryPackages(packagesDir: string): Promise<string[]> {
  const packages: string[] = []
  
  if (!existsSync(packagesDir)) {
    return packages
  }

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
 * Load story definition from package
 */
export async function loadStoryDefinition(
  packageName: string,
  packagesDir: string
): Promise<StorybookDefinition> {
  const storyPath = join(packagesDir, packageName, 'storybook', 'stories.json')
  const content = await readFile(storyPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Load all story definitions
 */
export async function loadAllStoryDefinitions(
  packagesDir: string
): Promise<Map<string, StorybookDefinition>> {
  const packages = await discoverStoryPackages(packagesDir)
  const definitions = new Map<string, StorybookDefinition>()

  for (const packageName of packages) {
    const storyDef = await loadStoryDefinition(packageName, packagesDir)
    definitions.set(packageName, storyDef)
  }

  return definitions
}

/**
 * Get story metadata for display
 */
export function getStoryMeta(storyDef: StorybookDefinition) {
  return {
    title: storyDef.category 
      ? `${storyDef.category}/${storyDef.title || storyDef.$schema}`
      : storyDef.title || storyDef.$schema,
    description: storyDef.description,
    parameters: storyDef.parameters,
    argTypes: storyDef.argTypes,
  }
}

/**
 * Find a story by name
 */
export function findStory(storyDef: StorybookDefinition, storyName: string): Story | undefined {
  return storyDef.stories.find(s => s.name === storyName)
}

/**
 * Get all stories from a definition
 */
export function getAllStories(storyDef: StorybookDefinition): Story[] {
  return storyDef.stories
}
