import { useState, useCallback } from 'react'
import { StorybookStory } from '@/types/project'
import { toast } from '@/components/ui/sonner'
import { llm } from '@/lib/llm-service'
import copy from '@/data/storybook-designer.json'
import {
  buildCategoryGroups,
  buildArgEntries,
} from './use-storybook-designer-helpers'
import {
  makeArgHandlers,
  makeFieldHandlers,
} from './use-storybook-designer-args'

interface UseStorybookDesignerArgs {
  stories: StorybookStory[]
  onStoriesChange: (stories: StorybookStory[]) => void
}

export function useStorybookDesigner(
  { stories, onStoriesChange }: UseStorybookDesignerArgs,
) {
  const [selectedStoryId, setSelectedStoryId] = useState<
    string | null
  >(stories[0]?.id || null)
  const [newArgKey, setNewArgKey] = useState('')
  const [newArgValue, setNewArgValue] = useState('')

  const selectedStory =
    stories.find((s) => s.id === selectedStoryId) || null
  const categories = Array.from(
    new Set(stories.map((s) => s.category)),
  )

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

  const handleDeleteStory = useCallback(
    (storyId: string) => {
      onStoriesChange(stories.filter((s) => s.id !== storyId))
      if (selectedStoryId === storyId) {
        const rem = stories.filter((s) => s.id !== storyId)
        setSelectedStoryId(rem[0]?.id || null)
      }
    },
    [stories, onStoriesChange, selectedStoryId],
  )

  const handleUpdateStory = useCallback(
    (storyId: string, updates: Partial<StorybookStory>) => {
      onStoriesChange(
        stories.map((s) =>
          s.id === storyId ? { ...s, ...updates } : s,
        ),
      )
    },
    [stories, onStoriesChange],
  )

  const handleGenerateWithAI = useCallback(async () => {
    const desc = prompt(copy.ai.descriptionPrompt)
    if (!desc) return
    try {
      toast.info(copy.ai.toastGenerating)
      const pt = copy.ai.promptTemplate.replace(
        '{description}', desc,
      )
      const response = await llm(pt, 'claude-sonnet', true)
      const parsed = JSON.parse(response)
      onStoriesChange([...stories, parsed.story])
      setSelectedStoryId(parsed.story.id)
      toast.success(copy.ai.toastSuccess)
    } catch (error) {
      console.error(error)
      toast.error(copy.ai.toastError)
    }
  }, [stories, onStoriesChange])

  const handleSelectStory = useCallback(
    (storyId: string) => { setSelectedStoryId(storyId) },
    [],
  )

  const argHandlers = makeArgHandlers(
    newArgKey, newArgValue, selectedStory,
    handleUpdateStory, setNewArgKey, setNewArgValue,
  )

  const fieldHandlers = makeFieldHandlers(
    selectedStory, handleUpdateStory,
    setNewArgKey, setNewArgValue,
  )

  return {
    selectedStoryId,
    selectedStory,
    categories,
    newArgKey,
    newArgValue,
    categoryGroups: buildCategoryGroups(
      categories, stories, selectedStoryId,
      setSelectedStoryId, handleDeleteStory,
    ),
    argEntries: buildArgEntries(
      selectedStory,
      argHandlers.handleUpdateArg,
      argHandlers.handleDeleteArg,
    ),
    hasNoStories: stories.length === 0,
    hasNoArgs: selectedStory
      ? Object.keys(selectedStory.args).length === 0
      : true,
    isAddArgDisabled: !newArgKey,
    handleAddStory,
    handleDeleteStory,
    handleUpdateStory,
    handleGenerateWithAI,
    handleSelectStory,
    ...argHandlers,
    ...fieldHandlers,
    copy,
  }
}
