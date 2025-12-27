import type { BlockDefinition } from '../types'
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

export { buildBlockDefinitionMap, groupBlockDefinitionsByCategory } from './grouping'
