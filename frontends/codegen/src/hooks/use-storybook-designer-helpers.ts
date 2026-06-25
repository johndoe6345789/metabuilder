import { StorybookStory } from '@/types/project'

const SELECTED_CLASS =
  'p-3 rounded-md cursor-pointer flex items-start' +
  ' justify-between group bg-accent text-accent-foreground'
const DEFAULT_CLASS =
  'p-3 rounded-md cursor-pointer flex items-start' +
  ' justify-between group hover:bg-muted'

export function buildCategoryGroups(
  categories: string[],
  stories: StorybookStory[],
  selectedStoryId: string | null,
  setSelectedStoryId: (id: string) => void,
  handleDeleteStory: (id: string) => void,
) {
  return categories.map((category) => ({
    category,
    stories: stories
      .filter((story) => story.category === category)
      .map((story) => ({
        ...story,
        isSelected: selectedStoryId === story.id,
        className:
          selectedStoryId === story.id
            ? SELECTED_CLASS
            : DEFAULT_CLASS,
        onSelect: () => setSelectedStoryId(story.id),
        onDelete: (event: React.MouseEvent) => {
          event.stopPropagation()
          handleDeleteStory(story.id)
        },
      })),
  }))
}

export function buildArgEntries(
  selectedStory: StorybookStory | null,
  handleUpdateArg: (key: string, value: string) => void,
  handleDeleteArg: (key: string) => void,
) {
  if (!selectedStory) return []
  return Object.entries(selectedStory.args).map(
    ([key, value]) => ({
      key,
      value,
      typeLabel: typeof value,
      stringValue: JSON.stringify(value),
      onValueChange: (
        event: React.ChangeEvent<HTMLInputElement>,
      ) => handleUpdateArg(key, event.target.value),
      onDelete: () => handleDeleteArg(key),
    }),
  )
}
