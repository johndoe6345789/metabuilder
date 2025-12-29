import type { MouseEvent } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { BlockSlot, LuaBlock } from '../types'
import styles from '../LuaBlocksEditor.module.scss'

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

export const BlockSection = ({
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
