import { Box, MenuItem, TextField, Typography } from '@/fakemui'

import styles from '../LuaBlocksEditor.module.scss'
import type { BlockDefinition, LuaBlock } from '../types'

interface BlockFieldsProps {
  block: LuaBlock
  definition: BlockDefinition
  onUpdateField: (blockId: string, fieldName: string, value: string) => void
}

export const BlockFields = ({ block, definition, onUpdateField }: BlockFieldsProps) => {
  if (definition.fields.length === 0) return null

  return (
    <Box className={styles.blockFields}>
      {definition.fields.map(field => (
        <Box key={field.name}>
          <Typography className={styles.blockFieldLabel}>{field.label}</Typography>
          {field.type === 'select' ? (
            <TextField
              select
              size="small"
              value={block.fields[field.name]}
              onChange={event => onUpdateField(block.id, field.name, event.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: { backgroundColor: 'rgba(255,255,255,0.95)' },
              }}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              size="small"
              value={block.fields[field.name]}
              onChange={event => onUpdateField(block.id, field.name, event.target.value)}
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
