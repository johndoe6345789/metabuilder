import { describe, expect, it, vi } from 'vitest'
import { useModelActions } from './use-model-actions'
import type { ModelSchema } from './schema-types'

const models: ModelSchema[] = [
  { name: 'user', label: 'User', fields: [] },
  { name: 'post', label: 'Post', fields: [] },
]

function setup(overrides?: Partial<Parameters<typeof useModelActions>[0]>) {
  const setSelectedName = vi.fn()
  const saveModels = vi.fn().mockResolvedValue(undefined)
  // useModelActions calls no React hooks itself -- it's a plain factory
  // of closures, safe to call from this non-component test helper.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const actions = useModelActions({
    models,
    selectedName: 'user',
    setSelectedName,
    saveModels,
    ...overrides,
  })
  return { actions, setSelectedName, saveModels }
}

describe('useModelActions', () => {
  it('handleAdd appends a new model and selects it', () => {
    const { actions, setSelectedName, saveModels } = setup()

    actions.handleAdd()

    expect(saveModels).toHaveBeenCalledWith([
      ...models,
      expect.objectContaining({ label: 'New Model', fields: [] }),
    ])
    expect(setSelectedName).toHaveBeenCalledWith(
      expect.stringMatching(/^model_/)
    )
  })

  it('handleDelete removes the named model', () => {
    const { actions, saveModels } = setup({ selectedName: 'post' })

    actions.handleDelete('user')

    expect(saveModels).toHaveBeenCalledWith([
      { name: 'post', label: 'Post', fields: [] },
    ])
  })

  it('handleDelete reselects the first remaining model when the selected one is deleted', () => {
    const { actions, setSelectedName } = setup({ selectedName: 'user' })

    actions.handleDelete('user')

    expect(setSelectedName).toHaveBeenCalledWith('post')
  })

  it('handleDelete selects null when the last model is deleted', () => {
    const { actions, setSelectedName } = setup({
      models: [{ name: 'user', label: 'User', fields: [] }],
      selectedName: 'user',
    })

    actions.handleDelete('user')

    expect(setSelectedName).toHaveBeenCalledWith(null)
  })

  it('handleDelete leaves selection alone when deleting an unselected model', () => {
    const { actions, setSelectedName } = setup({ selectedName: 'user' })

    actions.handleDelete('post')

    expect(setSelectedName).not.toHaveBeenCalled()
  })

  it('handleSaveModel replaces the selected model and reselects by its new name', () => {
    const { actions, saveModels, setSelectedName } = setup({
      selectedName: 'user',
    })
    const updated = { name: 'account', label: 'Account', fields: [] }

    actions.handleSaveModel(updated)

    expect(saveModels).toHaveBeenCalledWith([
      updated,
      { name: 'post', label: 'Post', fields: [] },
    ])
    expect(setSelectedName).toHaveBeenCalledWith('account')
  })
})
