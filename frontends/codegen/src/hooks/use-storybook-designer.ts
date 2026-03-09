import { useState, useCallback } from 'react'
import { StorybookStory } from '@/types/project'
import { toast } from '@/components/ui/sonner'
import { llm } from '@/lib/llm-service'
import copy from '@/data/storybook-designer.json'

interface UseStorybookDesignerArgs {
  stories: StorybookStory[]
  onStoriesChange: (stories: StorybookStory[]) => void
}

const parseArgValue = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function useStorybookDesigner({ stories, onStoriesChange }: UseStorybookDesignerArgs) {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(stories[0]?.id || null)
  const [newArgKey, setNewArgKey] = useState('')
  const [newArgValue, setNewArgValue] = useState('')

  const selectedStory = stories.find(story => story.id === selectedStoryId) || null
  const categories = Array.from(new Set(stories.map(story => story.category)))

  const handleAddStory = useCallback(() => {
    const newStory: StorybookStory = {
      id: `story-${Date.now()}`,
      componentName: copy.defaults.componentName,
      storyName: copy.defaults.storyName,
      args: {},
      description: '',
      category: copy.defaults.category,
    }
    onStoriesChange([...stories, newStory])
    setSelectedStoryId(newStory.id)
  }, [stories, onStoriesChange])

  const handleDeleteStory = useCallback((storyId: string) => {
    onStoriesChange(stories.filter(story => story.id !== storyId))
    if (selectedStoryId === storyId) {
      const remaining = stories.filter(story => story.id !== storyId)
      setSelectedStoryId(remaining[0]?.id || null)
    }
  }, [stories, onStoriesChange, selectedStoryId])

  const handleUpdateStory = useCallback((storyId: string, updates: Partial<StorybookStory>) => {
    onStoriesChange(
      stories.map(story => story.id === storyId ? { ...story, ...updates } : story)
    )
  }, [stories, onStoriesChange])

  const handleGenerateWithAI = useCallback(async () => {
    const description = prompt(copy.ai.descriptionPrompt)
    if (!description) return

    try {
      toast.info(copy.ai.toastGenerating)
      const promptText = copy.ai.promptTemplate.replace('{description}', description)
      const response = await llm(promptText, 'claude-sonnet', true)
      const parsed = JSON.parse(response)
      onStoriesChange([...stories, parsed.story])
      setSelectedStoryId(parsed.story.id)
      toast.success(copy.ai.toastSuccess)
    } catch (error) {
      console.error(error)
      toast.error(copy.ai.toastError)
    }
  }, [stories, onStoriesChange])

  const handleSelectStory = useCallback((storyId: string) => {
    setSelectedStoryId(storyId)
  }, [])

  const handleAddArg = useCallback(() => {
    if (!newArgKey || !selectedStory) return

    handleUpdateStory(selectedStory.id, {
      args: { ...selectedStory.args, [newArgKey]: parseArgValue(newArgValue) },
    })
    setNewArgKey('')
    setNewArgValue('')
  }, [newArgKey, newArgValue, selectedStory, handleUpdateStory])

  const handleDeleteArg = useCallback((key: string) => {
    if (!selectedStory) return
    const { [key]: _, ...rest } = selectedStory.args
    handleUpdateStory(selectedStory.id, { args: rest })
  }, [selectedStory, handleUpdateStory])

  const handleUpdateArg = useCallback((key: string, value: string) => {
    if (!selectedStory) return
    handleUpdateStory(selectedStory.id, {
      args: { ...selectedStory.args, [key]: parseArgValue(value) },
    })
  }, [selectedStory, handleUpdateStory])

  const handleComponentNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedStory) handleUpdateStory(selectedStory.id, { componentName: event.target.value })
  }, [selectedStory, handleUpdateStory])

  const handleStoryNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedStory) handleUpdateStory(selectedStory.id, { storyName: event.target.value })
  }, [selectedStory, handleUpdateStory])

  const handleCategoryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedStory) handleUpdateStory(selectedStory.id, { category: event.target.value })
  }, [selectedStory, handleUpdateStory])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedStory) handleUpdateStory(selectedStory.id, { description: event.target.value })
  }, [selectedStory, handleUpdateStory])

  const handleNewArgKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewArgKey(event.target.value)
  }, [])

  const handleNewArgValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewArgValue(event.target.value)
  }, [])

  /** Pre-computed list items for the story list panel, grouped by category */
  const categoryGroups = categories.map(category => ({
    category,
    stories: stories.filter(story => story.category === category).map(story => ({
      ...story,
      isSelected: selectedStoryId === story.id,
      className: selectedStoryId === story.id
        ? 'p-3 rounded-md cursor-pointer flex items-start justify-between group bg-accent text-accent-foreground'
        : 'p-3 rounded-md cursor-pointer flex items-start justify-between group hover:bg-muted',
      onSelect: () => setSelectedStoryId(story.id),
      onDelete: (event: React.MouseEvent) => {
        event.stopPropagation()
        handleDeleteStory(story.id)
      },
    })),
  }))

  /** Pre-computed arg entries for the args editor */
  const argEntries = selectedStory
    ? Object.entries(selectedStory.args).map(([key, value]) => ({
        key,
        value,
        typeLabel: typeof value,
        stringValue: JSON.stringify(value),
        onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => handleUpdateArg(key, event.target.value),
        onDelete: () => handleDeleteArg(key),
      }))
    : []

  const hasNoStories = stories.length === 0
  const hasNoArgs = selectedStory ? Object.keys(selectedStory.args).length === 0 : true
  const isAddArgDisabled = !newArgKey

  return {
    // State
    selectedStoryId,
    selectedStory,
    categories,
    newArgKey,
    newArgValue,
    categoryGroups,
    argEntries,
    hasNoStories,
    hasNoArgs,
    isAddArgDisabled,

    // Handlers
    handleAddStory,
    handleDeleteStory,
    handleUpdateStory,
    handleGenerateWithAI,
    handleSelectStory,
    handleAddArg,
    handleDeleteArg,
    handleUpdateArg,
    handleComponentNameChange,
    handleStoryNameChange,
    handleCategoryChange,
    handleDescriptionChange,
    handleNewArgKeyChange,
    handleNewArgValueChange,

    // Copy text passthrough
    copy,
  }
}
