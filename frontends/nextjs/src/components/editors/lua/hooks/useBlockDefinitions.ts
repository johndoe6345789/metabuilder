import { useCallback, useMemo } from 'react'

import {
  BLOCK_DEFINITIONS,
  buildBlockDefinitionMap,
  groupBlockDefinitionsByCategory,
} from '../blocks'
import type { BlockCategory, BlockDefinition, LuaBlock, LuaBlockType } from '../types'
import {
  buildLuaFromBlocks as serializeBlocks,
  decodeBlocksMetadata as parseBlocksMetadata,
} from './luaBlockSerialization'

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(16).slice(2)}`

export function useBlockDefinitions() {
  const blockDefinitions = useMemo(() => BLOCK_DEFINITIONS, [])

  const blockDefinitionMap = useMemo(
    () => buildBlockDefinitionMap(blockDefinitions),
    [blockDefinitions]
  )

  const blocksByCategory = useMemo<Record<BlockCategory, BlockDefinition[]>>(
    () => groupBlockDefinitionsByCategory(blockDefinitions),
    [blockDefinitions]
  )

  const createBlock = useCallback(
    (type: LuaBlockType): LuaBlock => {
      const definition = blockDefinitionMap.get(type)
      if (!definition) {
        throw new Error(`Unknown block type: ${type}`)
      }

      const fields = definition.fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.name] = field.defaultValue
        return acc
      }, {})

      return {
        id: createBlockId(),
        type,
        fields,
        children: definition.hasChildren ? [] : undefined,
        elseChildren: definition.hasElseChildren ? [] : undefined,
      }
    },
    [blockDefinitionMap]
  )

  const cloneBlock = useCallback(
    (block: LuaBlock): LuaBlock => ({
      ...block,
      id: createBlockId(),
      fields: { ...block.fields },
      children: block.children ? block.children.map(cloneBlock) : undefined,
      elseChildren: block.elseChildren ? block.elseChildren.map(cloneBlock) : undefined,
    }),
    []
  )

  const buildLuaFromBlocks = useCallback((blocks: LuaBlock[]) => serializeBlocks(blocks), [])

  const decodeBlocksMetadata = useCallback((code: string) => parseBlocksMetadata(code), [])

  return {
    blockDefinitions,
    blockDefinitionMap,
    blocksByCategory,
    createBlock,
    cloneBlock,
    buildLuaFromBlocks,
    decodeBlocksMetadata,
  }
}
