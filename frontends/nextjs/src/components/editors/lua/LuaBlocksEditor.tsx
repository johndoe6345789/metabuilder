import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

import type { LuaScript } from '@/lib/level-types'

import { BlockListView } from './BlockListView'
import { BlockMenu } from './blocks/BlockMenu'
import { CodePreview } from './CodePreview'
import { useLuaBlockEditorState } from './hooks/useLuaBlockEditorState'
import styles from './LuaBlocksEditor.module.scss'

interface LuaBlocksEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaBlocksEditor({ scripts, onScriptsChange }: LuaBlocksEditorProps) {
  const {
    activeBlocks,
    blockDefinitionMap,
    blockDefinitions,
    blocksByCategory,
    generatedCode,
    handleAddBlock,
    handleAddScript,
    handleApplyCode,
    handleCloseMenu,
    handleCopyCode,
    handleDeleteScript,
    handleDuplicateBlock,
    handleMoveBlock,
    handleReloadFromCode,
    handleRemoveBlock,
    handleRequestAddBlock,
    handleUpdateField,
    handleUpdateScript,
    menuAnchor,
    selectedScript,
    selectedScriptId,
    setSelectedScriptId,
  } = useLuaBlockEditorState({ scripts, onScriptsChange })

  return (
    <Box className={styles.root}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <Card>
            <CardHeader
              title="Lua block scripts"
              subheader="Create scripts using Scratch-style blocks"
            />
            <CardContent>
              <Stack spacing={2}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddScript}>
                  New block script
                </Button>
                <Divider />
                <List disablePadding>
                  {scripts.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No scripts yet. Create a block script to begin.
                    </Typography>
                  )}
                  {scripts.map(script => (
                    <ListItemButton
                      key={script.id}
                      selected={script.id === selectedScriptId}
                      onClick={() => setSelectedScriptId(script.id)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        alignItems: 'flex-start',
                      }}
                    >
                      <ListItemText
                        primary={script.name}
                        secondary={script.description || 'No description'}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Tooltip title="Delete script">
                        <IconButton
                          size="small"
                          onClick={event => {
                            event.stopPropagation()
                            handleDeleteScript(script.id)
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Block library" subheader="Click a block to add it" />
            <CardContent>
              <Stack spacing={2}>
                {Object.entries(blocksByCategory).map(([category, blocks]) => (
                  <Box key={category}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {category}
                    </Typography>
                    <Stack spacing={1}>
                      {blocks.map(block => (
                        <Paper
                          key={block.type}
                          className={styles.libraryBlock}
                          data-category={block.category}
                          onClick={() =>
                            handleAddBlock(block.type, { parentId: null, slot: 'root' })
                          }
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                              <Typography className={styles.libraryBlockTitle}>
                                {block.label}
                              </Typography>
                              <Typography className={styles.libraryBlockDesc}>
                                {block.description}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={event => {
                                event.stopPropagation()
                                handleAddBlock(block.type, { parentId: null, slot: 'root' })
                              }}
                            >
                              Add
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={3}>
          <BlockListView
            activeBlocks={activeBlocks}
            blockDefinitionMap={blockDefinitionMap}
            onRequestAddBlock={handleRequestAddBlock}
            onMoveBlock={handleMoveBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onRemoveBlock={handleRemoveBlock}
            onUpdateField={handleUpdateField}
            onUpdateScript={handleUpdateScript}
            selectedScript={selectedScript}
          />

          <CodePreview
            generatedCode={generatedCode}
            onApplyCode={handleApplyCode}
            onCopyCode={handleCopyCode}
            onReloadFromCode={handleReloadFromCode}
            selectedScript={selectedScript}
          />
        </Stack>
      </Box>

      <BlockMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        blocks={blockDefinitions}
        onSelect={type => handleAddBlock(type)}
      />
    </Box>
  )
}
