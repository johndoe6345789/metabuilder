import type { MouseEvent } from 'react'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  ArrowDownward,
  ArrowUpward,
  ContentCopy,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import type { BlockDefinition, BlockSlot, LuaBlock } from '../types'
import styles from '../LuaBlocksEditor.module.scss'

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

interface BlockSectionProps {
  title: string
  blocks: LuaBlock[] | undefined
  parentId: string
  slot: BlockSlot
  onRequestAddBlock: (
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => void
  renderNestedList: (blocks?: LuaBlock[]) => JSX.Element
}

const BlockSection = ({
  title,
  blocks,
  parentId,
  slot,
  onRequestAddBlock,
  renderNestedList,
}: BlockSectionProps) => (
  <Box className={styles.blockSection}>
    <Box className={styles.blockSectionHeader}>
      <Typography className={styles.blockSectionTitle}>{title}</Typography>
      <Button
        size="small"
        variant="contained"
        onClick={(event) => onRequestAddBlock(event, { parentId, slot })}
        startIcon={<AddIcon fontSize="small" />}
      >
        Add block
      </Button>
    </Box>
    <Box className={styles.blockSectionBody}>
      {blocks && blocks.length > 0 ? (
        renderNestedList(blocks)
      ) : (
        <Box className={styles.blockEmpty}>Drop blocks here to build this section.</Box>
      )}
    </Box>
  </Box>
)

const BlockFields = ({
  block,
  definition,
  onUpdateField,
}: {
  block: LuaBlock
  definition: BlockDefinition
  onUpdateField: (blockId: string, fieldName: string, value: string) => void
}) => {
  if (definition.fields.length === 0) return null

  return (
    <Box className={styles.blockFields}>
      {definition.fields.map((field) => (
        <Box key={field.name}>
          <Typography className={styles.blockFieldLabel}>{field.label}</Typography>
          {field.type === 'select' ? (
            <TextField
              select
              size="small"
              value={block.fields[field.name]}
              onChange={(event) => onUpdateField(block.id, field.name, event.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: { backgroundColor: 'rgba(255,255,255,0.95)' },
              }}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              size="small"
              value={block.fields[field.name]}
              onChange={(event) => onUpdateField(block.id, field.name, event.target.value)}
              placeholder={field.placeholder}
              fullWidth
              variant="outlined"
              type={field.type === 'number' ? 'number' : 'text'}
              InputProps={{
                sx: { backgroundColor: 'rgba(255,255,255,0.95)' },
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  )
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
