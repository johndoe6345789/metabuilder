/// <reference path="../global.d.ts" />

import { useState } from 'react'
import { StorybookStory } from '@/types/project'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash, BookOpen, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import copy from '@/data/storybook-designer.json'

interface StorybookDesignerProps {
  stories: StorybookStory[]
  onStoriesChange: (stories: StorybookStory[]) => void
}

interface StoryListPanelProps {
  stories: StorybookStory[]
  categories: string[]
  selectedStoryId: string | null
  onSelectStory: (storyId: string) => void
  onAddStory: () => void
  onGenerateWithAI: () => void
  onDeleteStory: (storyId: string) => void
}

interface StoryDetailsEditorProps {
  selectedStory: StorybookStory
  onUpdateStory: (storyId: string, updates: Partial<StorybookStory>) => void
}

interface StoryArgsEditorProps {
  selectedStory: StorybookStory
  onUpdateStory: (storyId: string, updates: Partial<StorybookStory>) => void
}

const parseArgValue = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const StoryListPanel = ({
  stories,
  categories,
  selectedStoryId,
  onSelectStory,
  onAddStory,
  onGenerateWithAI,
  onDeleteStory
}: StoryListPanelProps) => (
  <div className="w-80 border-r border-border bg-card">
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h2 className="font-semibold text-sm">{copy.list.title}</h2>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={onGenerateWithAI}>
          <Sparkle size={14} weight="duotone" />
        </Button>
        <Button size="sm" onClick={onAddStory}>
          <Plus size={14} />
        </Button>
      </div>
    </div>
    <ScrollArea className="h-[calc(100vh-200px)]">
      {categories.map(category => (
        <div key={category} className="mb-4">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
            {category}
          </div>
          <div className="px-2 space-y-1">
            {stories.filter(story => story.category === category).map(story => (
              <div
                key={story.id}
                className={`p-3 rounded-md cursor-pointer flex items-start justify-between group ${
                  selectedStoryId === story.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => onSelectStory(story.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{story.componentName}</div>
                  <div className="text-xs text-muted-foreground truncate">{story.storyName}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={event => {
                    event.stopPropagation()
                    onDeleteStory(story.id)
                  }}
                >
                  <Trash size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {stories.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {copy.list.empty}
        </div>
      )}
    </ScrollArea>
  </div>
)

const StoryDetailsEditor = ({ selectedStory, onUpdateStory }: StoryDetailsEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{copy.editor.detailsTitle}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="component-name">{copy.editor.componentNameLabel}</Label>
          <Input
            id="component-name"
            value={selectedStory.componentName}
            onChange={event => onUpdateStory(selectedStory.id, { componentName: event.target.value })}
            placeholder={copy.editor.componentNamePlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="story-name">{copy.editor.storyNameLabel}</Label>
          <Input
            id="story-name"
            value={selectedStory.storyName}
            onChange={event => onUpdateStory(selectedStory.id, { storyName: event.target.value })}
            placeholder={copy.editor.storyNamePlaceholder}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">{copy.editor.categoryLabel}</Label>
        <Input
          id="category"
          value={selectedStory.category}
          onChange={event => onUpdateStory(selectedStory.id, { category: event.target.value })}
          placeholder={copy.editor.categoryPlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{copy.editor.descriptionLabel}</Label>
        <Textarea
          id="description"
          value={selectedStory.description}
          onChange={event => onUpdateStory(selectedStory.id, { description: event.target.value })}
          placeholder={copy.editor.descriptionPlaceholder}
        />
      </div>
    </CardContent>
  </Card>
)

const StoryArgsEditor = ({ selectedStory, onUpdateStory }: StoryArgsEditorProps) => {
  const [newArgKey, setNewArgKey] = useState('')
  const [newArgValue, setNewArgValue] = useState('')

  const handleAddArg = () => {
    if (!newArgKey) return

    onUpdateStory(selectedStory.id, {
      args: { ...selectedStory.args, [newArgKey]: parseArgValue(newArgValue) }
    })
    setNewArgKey('')
    setNewArgValue('')
  }

  const handleDeleteArg = (key: string) => {
    const { [key]: _, ...rest } = selectedStory.args
    onUpdateStory(selectedStory.id, { args: rest })
  }

  const handleUpdateArg = (key: string, value: string) => {
    onUpdateStory(selectedStory.id, {
      args: { ...selectedStory.args, [key]: parseArgValue(value) }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{copy.args.title}</CardTitle>
            <CardDescription>{copy.args.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={copy.args.argNamePlaceholder}
            value={newArgKey}
            onChange={event => setNewArgKey(event.target.value)}
          />
          <Input
            placeholder={copy.args.argValuePlaceholder}
            value={newArgValue}
            onChange={event => setNewArgValue(event.target.value)}
          />
          <Button onClick={handleAddArg} disabled={!newArgKey}>
            <Plus size={14} />
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {Object.entries(selectedStory.args).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="font-mono text-xs">{key}</Label>
                        <Badge variant="outline">{typeof value}</Badge>
                      </div>
                      <Input
                        value={JSON.stringify(value)}
                        onChange={event => handleUpdateArg(key, event.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteArg(key)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {Object.keys(selectedStory.args).length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {copy.args.empty}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

const EmptyStoryState = ({ onAddStory }: { onAddStory: () => void }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-medium mb-2">{copy.emptyState.title}</p>
      <p className="text-sm text-muted-foreground mb-4">{copy.emptyState.subtitle}</p>
      <Button onClick={onAddStory}>
        <Plus size={16} className="mr-2" />
        {copy.emptyState.button}
      </Button>
    </div>
  </div>
)

export function StorybookDesigner({ stories, onStoriesChange }: StorybookDesignerProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(stories[0]?.id || null)

  const selectedStory = stories.find(story => story.id === selectedStoryId)
  const categories = Array.from(new Set(stories.map(story => story.category)))

  const handleAddStory = () => {
    const newStory: StorybookStory = {
      id: `story-${Date.now()}`,
      componentName: copy.defaults.componentName,
      storyName: copy.defaults.storyName,
      args: {},
      description: '',
      category: copy.defaults.category
    }
    onStoriesChange([...stories, newStory])
    setSelectedStoryId(newStory.id)
  }

  const handleDeleteStory = (storyId: string) => {
    onStoriesChange(stories.filter(story => story.id !== storyId))
    if (selectedStoryId === storyId) {
      const remaining = stories.filter(story => story.id !== storyId)
      setSelectedStoryId(remaining[0]?.id || null)
    }
  }

  const handleUpdateStory = (storyId: string, updates: Partial<StorybookStory>) => {
    onStoriesChange(
      stories.map(story => story.id === storyId ? { ...story, ...updates } : story)
    )
  }

  const handleGenerateWithAI = async () => {
    const description = prompt(copy.ai.descriptionPrompt)
    if (!description) return

    try {
      toast.info(copy.ai.toastGenerating)
      const promptText = copy.ai.promptTemplate.replace('{description}', description)
      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      onStoriesChange([...stories, parsed.story])
      setSelectedStoryId(parsed.story.id)
      toast.success(copy.ai.toastSuccess)
    } catch (error) {
      console.error(error)
      toast.error(copy.ai.toastError)
    }
  }

  return (
    <div className="h-full flex">
      <StoryListPanel
        stories={stories}
        categories={categories}
        selectedStoryId={selectedStoryId}
        onSelectStory={setSelectedStoryId}
        onAddStory={handleAddStory}
        onGenerateWithAI={handleGenerateWithAI}
        onDeleteStory={handleDeleteStory}
      />

      <div className="flex-1 p-6">
        {selectedStory ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{copy.editor.title}</h2>
              <Button variant="outline">
                <BookOpen size={16} className="mr-2" weight="fill" />
                {copy.editor.previewButton}
              </Button>
            </div>

            <StoryDetailsEditor selectedStory={selectedStory} onUpdateStory={handleUpdateStory} />
            <StoryArgsEditor selectedStory={selectedStory} onUpdateStory={handleUpdateStory} />
          </div>
        ) : (
          <EmptyStoryState onAddStory={handleAddStory} />
        )}
      </div>
    </div>
  )
}
