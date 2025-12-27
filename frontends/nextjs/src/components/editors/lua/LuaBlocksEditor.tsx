import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  ContentCopy,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import type { LuaScript } from '@/lib/level-types'
import { BlockList } from './blocks/BlockList'
import { BlockMenu } from './blocks/BlockMenu'
import { useBlockDefinitions } from './hooks/useBlockDefinitions'
import { useLuaBlocksState } from './hooks/useLuaBlocksState'
import styles from './LuaBlocksEditor.module.scss'

interface LuaBlocksEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaBlocksEditor({ scripts, onScriptsChange }: LuaBlocksEditorProps) {
  const {
    blockDefinitions,
    blockDefinitionMap,
    blocksByCategory,
    createBlock,
    cloneBlock,
    buildLuaFromBlocks,
    decodeBlocksMetadata,
  } = useBlockDefinitions()

  const {
    activeBlocks,
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
  } = useLuaBlocksState({
    scripts,
    onScriptsChange,
    buildLuaFromBlocks,
    createBlock,
    cloneBlock,
    decodeBlocksMetadata,
  })

  const renderBlockLibrary = () => (
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
                {blocks.map((block) => (
                  <Paper
                    key={block.type}
                    className={styles.libraryBlock}
                    data-category={block.category}
                    onClick={() => handleAddBlock(block.type, { parentId: null, slot: 'root' })}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography className={styles.libraryBlockTitle}>{block.label}</Typography>
                        <Typography className={styles.libraryBlockDesc}>{block.description}</Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
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
  )

  const renderWorkspace = () => (
    <Card>
      <CardHeader
        title="Block workspace"
        subheader="Stack blocks to generate Lua code"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(event) => handleRequestAddBlock(event, { parentId: null, slot: 'root' })}
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
                onChange={(event) => handleUpdateScript({ name: event.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={selectedScript.description || ''}
                onChange={(event) => handleUpdateScript({ description: event.target.value })}
                fullWidth
              />
            </Stack>
            <Box className={styles.workspaceSurface}>
              {activeBlocks.length > 0 ? (
                <BlockList
                  blocks={activeBlocks}
                  blockDefinitionMap={blockDefinitionMap}
                  onRequestAddBlock={handleRequestAddBlock}
                  onMoveBlock={handleMoveBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onRemoveBlock={handleRemoveBlock}
                  onUpdateField={handleUpdateField}
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

  const renderScriptList = () => (
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
            {scripts.map((script) => (
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
                    onClick={(event) => {
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
  )

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
          {renderScriptList()}
          {renderBlockLibrary()}
        </Stack>

        <Stack spacing={3}>
          {renderWorkspace()}

          <Card>
            <CardHeader
              title="Lua preview"
              subheader="Generated code from your blocks"
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Reload blocks from script">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleReloadFromCode}
                        disabled={!selectedScript}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Copy code">
                    <span>
                      <IconButton size="small" onClick={handleCopyCode} disabled={!selectedScript}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon fontSize="small" />}
                    onClick={handleApplyCode}
                    disabled={!selectedScript}
                  >
                    Apply to script
                  </Button>
                </Stack>
              }
            />
            <CardContent>
              <Box className={styles.codePreview}>
                <pre>{generatedCode}</pre>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <BlockMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        blocks={blockDefinitions}
        onSelect={(type) => handleAddBlock(type)}
      />
    </Box>
  )
}
