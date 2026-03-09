import { StorybookStory } from '@/types/project'

export interface StorybookDesignerProps {
  stories: StorybookStory[]
  onStoriesChange: (stories: StorybookStory[]) => void
}
