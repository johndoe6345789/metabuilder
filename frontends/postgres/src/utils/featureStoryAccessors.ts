/**
 * Playwright playbook and Storybook story accessors.
 */

import featuresConfig from '@/config/features.json';
import type {
  FeaturesConfig,
  PlaywrightPlaybook,
  StorybookStory,
} from './featureTypes';

const config = featuresConfig as FeaturesConfig;

export function getPlaywrightPlaybook(
  playbookName: string,
): PlaywrightPlaybook | undefined {
  return config.playwrightPlaybooks?.[playbookName];
}

export function getAllPlaywrightPlaybooks(): Record<
  string, PlaywrightPlaybook
> {
  return config.playwrightPlaybooks || {};
}

export function getPlaywrightPlaybooksByTag(
  tag: string,
): PlaywrightPlaybook[] {
  return Object.values(getAllPlaywrightPlaybooks()).filter(
    p => p.tags?.includes(tag),
  );
}

export function getStorybookStory(
  componentName: string,
  storyName: string,
): StorybookStory | undefined {
  return config.storybookStories?.[componentName]?.[storyName];
}

export function getAllStorybookStories(): Record<
  string, Record<string, StorybookStory>
> {
  return config.storybookStories || {};
}

export function getStorybookStoriesForComponent(
  componentName: string,
): Record<string, StorybookStory> {
  return config.storybookStories?.[componentName] || {};
}
