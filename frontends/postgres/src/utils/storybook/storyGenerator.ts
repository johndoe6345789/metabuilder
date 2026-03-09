import type { Meta, StoryObj } from '@storybook/react';
import { getAllStorybookStories, getStorybookStoriesForComponent, StorybookStory } from '@/utils/featureConfig';

/**
 * Generate Storybook meta configuration from features.json
 */
export function generateMeta<T>(
  component: T,
  componentName: string,
  customMeta?: Partial<Meta<T>>
): Meta<T> {
  const stories = getStorybookStoriesForComponent(componentName);
  const defaultStory = stories.default;

  return {
    title: `Components/${componentName}`,
    component: component as any,
    parameters: {
      layout: 'centered',
      ...defaultStory?.parameters,
    },
    tags: ['autodocs'],
    ...customMeta,
  };
}

/**
 * Generate a single story from features.json story definition
 * 
 * Note: Play functions cannot be stored directly in JSON due to serialization limitations.
 * For interactive stories that need play functions:
 * 1. Define the story structure in features.json (args, parameters)
 * 2. Add play functions manually in the .stories.tsx file after generation
 * 
 * Example:
 * ```typescript
 * export const Interactive: Story = {
 *   ...generateStory(storyConfig),
 *   play: async ({ canvasElement }) => {
 *     // Your play function here
 *   }
 * };
 * ```
 */
export function generateStory<T>(
  storyConfig: StorybookStory
): StoryObj<T> {
  return {
    name: storyConfig.name,
    args: storyConfig.args || {},
    parameters: storyConfig.parameters,
  };
}

/**
 * Generate all stories for a component from features.json
 */
export function generateStories<T>(componentName: string): Record<string, StoryObj<T>> {
  const stories = getStorybookStoriesForComponent(componentName);
  const result: Record<string, StoryObj<T>> = {};

  for (const [key, storyConfig] of Object.entries(stories)) {
    result[key] = generateStory<T>(storyConfig);
  }

  return result;
}

/**
 * Get all available story configurations
 */
export function listStorybookComponents(): string[] {
  return Object.keys(getAllStorybookStories());
}

/**
 * Helper to create mock handlers for stories
 */
export function createMockHandlers(handlerNames: string[]): Record<string, () => void> {
  const handlers: Record<string, () => void> = {};
  
  for (const name of handlerNames) {
    handlers[name] = () => {
      console.log(`Mock handler called: ${name}`);
    };
  }
  
  return handlers;
}
