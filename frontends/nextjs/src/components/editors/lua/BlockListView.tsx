import type { MouseEvent } from 'react'
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { LuaScript } from '@/lib/level-types'
import type { BlockDefinition, BlockSlot, LuaBlock, LuaBlockType } from './types'
import { BlockList } from './blocks/BlockList'
import styles from './LuaBlocksEditor.module.scss'

interface BlockListViewProps {
  activeBlocks: LuaBlock[]
  blockDefinitionMap: Map<LuaBlockType, BlockDefinition>
  onRequestAddBlock: (
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void
  onDuplicateBlock: (blockId: string) => void
  onRemoveBlock: (blockId: string) => void
  onUpdateField: (blockId: string, fieldName: string, value: string) => void
  onUpdateScript: (updates: Partial<LuaScript>) => void
  selectedScript: LuaScript | null
}

export function BlockListView({
  activeBlocks,
  blockDefinitionMap,
  onRequestAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onUpdateField,
  onUpdateScript,
  selectedScript,
}: BlockListViewProps) {
  return (
    <Card>
      <CardHeader
        title="Block workspace"
        subheader="Stack blocks to generate Lua code"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(event) => onRequestAddBlock(event, { parentId: null, slot: 'root' })}
            disabled={!selectedScript}
          >
            Add block
          </Button>
        }
      />
      <CardContent>
        {!selectedScript ? (
          <Typography variant="body2" color="text.secondary">
            Select a script to start building blocks.
          </Typography>
        ) : (
          <Stack spacing={3}>
            <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
              <TextField
                label="Script name"
                value={selectedScript.name}
                onChange={(event) => onUpdateScript({ name: event.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={selectedScript.description || ''}
                onChange={(event) => onUpdateScript({ description: event.target.value })}
                fullWidth
              />
            </Stack>
            <Box className={styles.workspaceSurface}>
              {activeBlocks.length > 0 ? (
                <BlockList
                  blocks={activeBlocks}
                  blockDefinitionMap={blockDefinitionMap}
                  onRequestAddBlock={onRequestAddBlock}
                  onMoveBlock={onMoveBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onRemoveBlock={onRemoveBlock}
                  onUpdateField={onUpdateField}
                />
              ) : (
                <Box className={styles.blockEmpty}>Add a block to start building Lua logic.</Box>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Blocks are saved in the script as metadata, so you can reload them later.
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
