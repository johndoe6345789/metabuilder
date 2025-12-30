import type { MouseEvent } from 'react'

import { Box } from '@/fakemui'

import styles from '../LuaBlocksEditor.module.scss'
import type { BlockDefinition, BlockSlot, LuaBlock, LuaBlockType } from '../types'
import { BlockItem } from './BlockItem'

interface BlockListProps {
  blocks: LuaBlock[]
  blockDefinitionMap: Map<LuaBlockType, BlockDefinition>
  onRequestAddBlock: (
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void
  onDuplicateBlock: (blockId: string) => void
  onRemoveBlock: (blockId: string) => void
  onUpdateField: (blockId: string, fieldName: string, value: string) => void
}

export const BlockList = ({
  blocks,
  blockDefinitionMap,
  onRequestAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onUpdateField,
}: BlockListProps) => {
  const renderNestedList = (childBlocks?: LuaBlock[]) => (
    <BlockList
      blocks={childBlocks ?? []}
      blockDefinitionMap={blockDefinitionMap}
      onRequestAddBlock={onRequestAddBlock}
      onMoveBlock={onMoveBlock}
      onDuplicateBlock={onDuplicateBlock}
      onRemoveBlock={onRemoveBlock}
      onUpdateField={onUpdateField}
    />
  )

  return (
    <Box className={styles.blockStack}>
      {blocks.map((block, index) => {
        const definition = blockDefinitionMap.get(block.type)
        if (!definition) return null

        return (
          <BlockItem
            key={block.id}
            block={block}
            definition={definition}
            index={index}
            total={blocks.length}
            onRequestAddBlock={onRequestAddBlock}
            onMoveBlock={onMoveBlock}
            onDuplicateBlock={onDuplicateBlock}
            onRemoveBlock={onRemoveBlock}
            onUpdateField={onUpdateField}
            renderNestedList={renderNestedList}
          />
        )
      })}
    </Box>
  )
}
