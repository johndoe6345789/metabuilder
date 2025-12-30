import { Box, Menu, MenuItem, Typography } from '@/fakemui'

import styles from '../LuaBlocksEditor.module.scss'
import type { BlockDefinition } from '../types'

interface BlockMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  blocks: BlockDefinition[]
  onSelect: (type: BlockDefinition['type']) => void
}

export const BlockMenu = ({ anchorEl, open, onClose, blocks, onSelect }: BlockMenuProps) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose} PaperProps={{ sx: { minWidth: 280 } }}>
    {blocks.map(definition => (
      <MenuItem key={definition.type} onClick={() => onSelect(definition.type)}>
        <Box className={styles.menuSwatch} data-category={definition.category} sx={{ mr: 1 }} />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {definition.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {definition.description}
          </Typography>
        </Box>
      </MenuItem>
    ))}
  </Menu>
)
