/**
 * Dynamic Storybook Story Renderer
 * 
 * Renders Storybook stories directly from JSON definitions.
 * Used by Storybook to display stories without code generation.
 */

import React from 'react'
import type { StorybookDefinition, Story } from './storybook-json-loader'
import { loadJSONPackage } from '../../frontends/nextjs/src/lib/packages/json/functions/load-json-package'
import { JSONComponentRenderer } from '../../frontends/nextjs/src/components/JSONComponentRenderer'
import { join } from 'path'

interface DynamicStoryProps {
  packageName: string
  storyDef: StorybookDefinition
  story: Story
  packagesDir: string
}

/**
 * Render a single story from JSON definition
 */
export async function DynamicStory({
  packageName,
  storyDef,
  story,
  packagesDir
}: DynamicStoryProps) {
  // Load the package components
  const pkg = await loadJSONPackage(join(packagesDir, packageName))

  // Find the component to render
  const component = pkg.components?.find(
    c => c.id === story.render || c.name === story.render
  )

  if (!component) {
    return (
      <div style={{ padding: '1rem', border: '1px solid red', borderRadius: '4px' }}>
        <strong>Component not found:</strong> {story.render}
        <br />
        <small>Package: {packageName}</small>
      </div>
    )
  }

  // Merge story args with default context
  const props = {
    ...storyDef.defaultContext,
    ...story.args,
  }

  return (
    <JSONComponentRenderer
      component={component}
      props={props}
      allComponents={pkg.components}
    />
  )
}

/**
 * Create story metadata for Storybook
 */
export function createStoryMeta(storyDef: StorybookDefinition) {
  return {
    title: storyDef.category 
      ? `${storyDef.category}/${storyDef.title}`
      : storyDef.title,
    parameters: {
      ...storyDef.parameters,
      docs: {
        description: {
          component: storyDef.description
        }
      }
    },
    argTypes: storyDef.argTypes,
  }
}
