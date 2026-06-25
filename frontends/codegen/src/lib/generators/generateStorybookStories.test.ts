import { describe, expect, it } from 'vitest'
import { generateStorybookStories } from './generateStorybookStories'
import type { StorybookStory } from '@/types/project'

describe('generateStorybookStories', () => {
  it('returns empty object for empty stories array', () => {
    const result = generateStorybookStories([])
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('generates a stories file for a component', () => {
    const stories: StorybookStory[] = [
      {
        id: 's1',
        componentName: 'Button',
        storyName: 'Default',
        args: { label: 'Click me' },
        description: '',
        category: 'atoms',
      },
    ]
    const result = generateStorybookStories(stories)
    expect(result['src/stories/Button.stories.tsx']).toBeDefined()
    const code = result['src/stories/Button.stories.tsx']
    expect(code).toContain("import { Button } from '@/components/Button'")
    expect(code).toContain("title: 'atoms/Button'")
    expect(code).toContain('component: Button')
    expect(code).toContain("tags: ['autodocs']")
  })

  it('generates story export with args', () => {
    const stories: StorybookStory[] = [
      {
        id: 's1',
        componentName: 'Badge',
        storyName: 'Primary Badge',
        args: { color: 'primary', count: 5 },
        description: '',
        category: 'atoms',
      },
    ]
    const result = generateStorybookStories(stories)
    const code = result['src/stories/Badge.stories.tsx']
    expect(code).toContain('PrimaryBadge: Story')
    expect(code).toContain("'color': 'primary'")
  })

  it('groups multiple stories for the same component into one file', () => {
    const stories: StorybookStory[] = [
      {
        id: 's1',
        componentName: 'Card',
        storyName: 'Default',
        args: {},
        description: '',
        category: 'molecules',
      },
      {
        id: 's2',
        componentName: 'Card',
        storyName: 'Selected',
        args: { selected: true },
        description: '',
        category: 'molecules',
      },
    ]
    const result = generateStorybookStories(stories)
    expect(Object.keys(result)).toHaveLength(1)
    const code = result['src/stories/Card.stories.tsx']
    expect(code).toContain('Default: Story')
    expect(code).toContain('Selected: Story')
  })

  it('creates separate files for different components', () => {
    const stories: StorybookStory[] = [
      {
        id: 's1',
        componentName: 'Alpha',
        storyName: 'Default',
        args: {},
        description: '',
        category: 'atoms',
      },
      {
        id: 's2',
        componentName: 'Beta',
        storyName: 'Default',
        args: {},
        description: '',
        category: 'atoms',
      },
    ]
    const result = generateStorybookStories(stories)
    expect(result['src/stories/Alpha.stories.tsx']).toBeDefined()
    expect(result['src/stories/Beta.stories.tsx']).toBeDefined()
  })

  it('strips spaces from story names for export identifier', () => {
    const stories: StorybookStory[] = [
      {
        id: 's1',
        componentName: 'Btn',
        storyName: 'With Icon And Label',
        args: {},
        description: '',
        category: 'atoms',
      },
    ]
    const result = generateStorybookStories(stories)
    const code = result['src/stories/Btn.stories.tsx']
    expect(code).toContain('WithIconAndLabel: Story')
  })
})
