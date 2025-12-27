import type { BlockCategory, BlockDefinition } from '../types'
import { basicBlocks } from './basics'
import { dataBlocks } from './data'
import { functionBlocks } from './functions'
import { logicBlocks } from './logic'
import { loopBlocks } from './loops'

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  ...basicBlocks,
  ...logicBlocks,
  ...loopBlocks,
  ...dataBlocks,
  ...functionBlocks,
]

const createCategoryIndex = (): Record<BlockCategory, BlockDefinition[]> => ({
  Basics: [],
  Logic: [],
  Loops: [],
  Data: [],
  Functions: [],
})

export const groupBlockDefinitionsByCategory = (definitions: BlockDefinition[]) => {
  const categories = createCategoryIndex()
  definitions.forEach((definition) => {
    categories[definition.category].push(definition)
  })
  return categories
}

export const buildBlockDefinitionMap = (definitions: BlockDefinition[]) =>
  new Map(definitions.map((definition) => [definition.type, definition]))
