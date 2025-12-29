import type { BlockCategory, BlockDefinition } from '../types'

export const groupBlockDefinitionsByCategory = (definitions: BlockDefinition[]) => {
  const categories: Record<BlockCategory, BlockDefinition[]> = {
    Basics: [],
    Logic: [],
    Loops: [],
    Data: [],
    Functions: [],
  }

  definitions.forEach((definition) => {
    categories[definition.category].push(definition)
  })
  return categories
}

export const buildBlockDefinitionMap = (definitions: BlockDefinition[]) =>
  new Map(definitions.map((definition) => [definition.type, definition]))
