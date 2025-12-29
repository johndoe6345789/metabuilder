import type { BlockCategory, BlockDefinition } from '../types'

const createCategoryIndex = (): Record<BlockCategory, BlockDefinition[]> => ({
  Basics: [],
  Logic: [],
  Loops: [],
  Data: [],
  Functions: [],
})

export const groupBlockDefinitionsByCategory = (definitions: BlockDefinition[]) => {
  const categories = createCategoryIndex()
  definitions.forEach(definition => {
    categories[definition.category].push(definition)
  })
  return categories
}

export const buildBlockDefinitionMap = (definitions: BlockDefinition[]) =>
  new Map(definitions.map(definition => [definition.type, definition]))
