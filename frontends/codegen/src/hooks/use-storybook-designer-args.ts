import { StorybookStory } from '@/types/project'

const parseArgValue = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function makeArgHandlers(
  newArgKey: string,
  newArgValue: string,
  selectedStory: StorybookStory | null,
  handleUpdateStory: (
    id: string, updates: Partial<StorybookStory>,
  ) => void,
  setNewArgKey: (v: string) => void,
  setNewArgValue: (v: string) => void,
) {
  const handleUpdateArg = (key: string, value: string) => {
    if (!selectedStory) return
    handleUpdateStory(selectedStory.id, {
      args: {
        ...selectedStory.args,
        [key]: parseArgValue(value),
      },
    })
  }

  const handleDeleteArg = (key: string) => {
    if (!selectedStory) return
    const { [key]: _, ...rest } = selectedStory.args
    handleUpdateStory(selectedStory.id, { args: rest })
  }

  const handleAddArg = () => {
    if (!newArgKey || !selectedStory) return
    handleUpdateStory(selectedStory.id, {
      args: {
        ...selectedStory.args,
        [newArgKey]: parseArgValue(newArgValue),
      },
    })
    setNewArgKey('')
    setNewArgValue('')
  }

  const handleNewArgKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setNewArgKey(e.target.value)

  const handleNewArgValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setNewArgValue(e.target.value)

  return {
    handleUpdateArg,
    handleDeleteArg,
    handleAddArg,
    handleNewArgKeyChange,
    handleNewArgValueChange,
  }
}

export function makeFieldHandlers(
  selectedStory: StorybookStory | null,
  handleUpdateStory: (
    id: string, updates: Partial<StorybookStory>,
  ) => void,
  _setNewArgKey: (v: string) => void,
  _setNewArgValue: (v: string) => void,
) {
  const make = (field: keyof StorybookStory) => (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    if (selectedStory) {
      handleUpdateStory(selectedStory.id, {
        [field]: event.target.value,
      } as Partial<StorybookStory>)
    }
  }

  return {
    handleComponentNameChange: make('componentName'),
    handleStoryNameChange: make('storyName'),
    handleCategoryChange: make('category'),
    handleDescriptionChange: make('description'),
  }
}
