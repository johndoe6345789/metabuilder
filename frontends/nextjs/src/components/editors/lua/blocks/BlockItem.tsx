import type { MouseEvent } from 'react'

import {
  ArrowDown as ArrowDownward,
  ArrowUp as ArrowUpward,
  Box,
  Copy as ContentCopy,
  IconButton,
  Tooltip,
  Trash as DeleteIcon,
  Typography,
} from '@/fakemui'

import styles from '../LuaBlocksEditor.module.scss'
import type { BlockDefinition, BlockSlot, LuaBlock } from '../types'
import { BlockFields } from './BlockFields'
import { BlockSection } from './BlockSection'

interface BlockItemProps {
  block: LuaBlock
  definition: BlockDefinition
  index: number
  total: number
  onRequestAddBlock: (
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void
  onDuplicateBlock: (blockId: string) => void
  onRemoveBlock: (blockId: string) => void
  onUpdateField: (blockId: string, fieldName: string, value: string) => void
  renderNestedList: (blocks?: LuaBlock[]) => JSX.Element
}

export const BlockItem = ({
  block,
  definition,
  index,
  total,
  onRequestAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onUpdateField,
  renderNestedList,
}: BlockItemProps) => (
  <Box className={styles.blockCard} data-category={definition.category}>
    <Box className={styles.blockHeader}>
      <Typography className={styles.blockTitle}>{definition.label}</Typography>
      <Box className={styles.blockActions}>
        <Tooltip title="Move up">
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveBlock(block.id, 'up')}
              disabled={index === 0}
              sx={{ color: 'rgba(255,255,255,0.85)' }}
            >
              <ArrowUpward fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Move down">
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveBlock(block.id, 'down')}
              disabled={index === total - 1}
              sx={{ color: 'rgba(255,255,255,0.85)' }}
            >
              <ArrowDownward fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Duplicate block">
          <IconButton
            size="small"
            onClick={() => onDuplicateBlock(block.id)}
            sx={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <ContentCopy fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete block">
          <IconButton
            size="small"
            onClick={() => onRemoveBlock(block.id)}
            sx={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

    <BlockFields block={block} definition={definition} onUpdateField={onUpdateField} />

    {definition.hasChildren && (
      <BlockSection
        title="Then"
        blocks={block.children}
        parentId={block.id}
        slot="children"
        onRequestAddBlock={onRequestAddBlock}
        renderNestedList={renderNestedList}
      />
    )}

    {definition.hasElseChildren && (
      <BlockSection
        title="Else"
        blocks={block.elseChildren}
        parentId={block.id}
        slot="elseChildren"
        onRequestAddBlock={onRequestAddBlock}
        renderNestedList={renderNestedList}
      />
    )}
  </Box>
)
