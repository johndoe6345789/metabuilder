import type { ModelSchema } from './schema-types'

function makeNewModel(): ModelSchema {
  return {
    name: `model_${Date.now()}`,
    label: 'New Model',
    fields: [],
  }
}

export interface UseModelActionsArgs {
  models: ModelSchema[]
  selectedName: string | null
  setSelectedName: (name: string | null) => void
  saveModels: (next: ModelSchema[]) => Promise<void>
}

/** Add/delete/save operations on the model list, kept out of the
 *  component so it only owns what to render. */
export function useModelActions({
  models,
  selectedName,
  setSelectedName,
  saveModels,
}: UseModelActionsArgs) {
  function handleAdd() {
    const m = makeNewModel()
    void saveModels([...models, m])
    setSelectedName(m.name)
  }

  function handleDelete(name: string) {
    const next = models.filter(m => m.name !== name)
    void saveModels(next)
    if (selectedName === name) {
      // .at(0) is typed `T | undefined` under both tsconfig variants
      // (unlike `next[0]`, whose type depends on noUncheckedIndexedAccess).
      const first = next.at(0)
      setSelectedName(first !== undefined ? first.name : null)
    }
  }

  function handleSaveModel(updated: ModelSchema) {
    const next = models.map(m => (m.name === selectedName ? updated : m))
    void saveModels(next)
    setSelectedName(updated.name)
  }

  return { handleAdd, handleDelete, handleSaveModel }
}
