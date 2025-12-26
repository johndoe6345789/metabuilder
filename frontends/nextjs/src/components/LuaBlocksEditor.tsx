import { useEffect, useMemo, useState } from 'react'
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
  Menu,
  MenuItem,
  Paper,
  Stack,
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
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'
import type { LuaScript } from '@/lib/level-types'
import styles from './LuaBlocksEditor.module.scss'

type LuaBlockType =
  | 'log'
  | 'set_variable'
  | 'if'
  | 'if_else'
  | 'repeat'
  | 'return'
  | 'call'
  | 'comment'

type BlockSlot = 'root' | 'children' | 'elseChildren'

type BlockCategory = 'Basics' | 'Logic' | 'Loops' | 'Data' | 'Functions'

type BlockFieldType = 'text' | 'number' | 'select'

interface BlockFieldDefinition {
  name: string
  label: string
  placeholder?: string
  type?: BlockFieldType
  defaultValue: string
  options?: Array<{ label: string; value: string }>
}

interface BlockDefinition {
  type: LuaBlockType
  label: string
  description: string
  category: BlockCategory
  fields: BlockFieldDefinition[]
  hasChildren?: boolean
  hasElseChildren?: boolean
}

interface LuaBlock {
  id: string
  type: LuaBlockType
  fields: Record<string, string>
  children?: LuaBlock[]
  elseChildren?: LuaBlock[]
}

const BLOCKS_METADATA_PREFIX = '--@blocks '

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'log',
    label: 'Log message',
    description: 'Send a message to the Lua console',
    category: 'Basics',
    fields: [
      {
        name: 'message',
        label: 'Message',
        placeholder: '"Hello from Lua"',
        type: 'text',
        defaultValue: '"Hello from Lua"',
      },
    ],
  },
  {
    type: 'set_variable',
    label: 'Set variable',
    description: 'Create or update a variable',
    category: 'Data',
    fields: [
      {
        name: 'scope',
        label: 'Scope',
        type: 'select',
        defaultValue: 'local',
        options: [
          { label: 'local', value: 'local' },
          { label: 'global', value: 'global' },
        ],
      },
      {
        name: 'name',
        label: 'Variable name',
        placeholder: 'count',
        type: 'text',
        defaultValue: 'count',
      },
      {
        name: 'value',
        label: 'Value',
        placeholder: '0',
        type: 'text',
        defaultValue: '0',
      },
    ],
  },
  {
    type: 'if',
    label: 'If',
    description: 'Run blocks when a condition is true',
    category: 'Logic',
    fields: [
      {
        name: 'condition',
        label: 'Condition',
        placeholder: 'context.data.isActive',
        type: 'text',
        defaultValue: 'context.data.isActive',
      },
    ],
    hasChildren: true,
  },
  {
    type: 'if_else',
    label: 'If / Else',
    description: 'Branch execution with else fallback',
    category: 'Logic',
    fields: [
      {
        name: 'condition',
        label: 'Condition',
        placeholder: 'context.data.count > 5',
        type: 'text',
        defaultValue: 'context.data.count > 5',
      },
    ],
    hasChildren: true,
    hasElseChildren: true,
  },
  {
    type: 'repeat',
    label: 'Repeat loop',
    description: 'Run nested blocks multiple times',
    category: 'Loops',
    fields: [
      {
        name: 'iterator',
        label: 'Iterator',
        placeholder: 'i',
        type: 'text',
        defaultValue: 'i',
      },
      {
        name: 'count',
        label: 'Times',
        placeholder: '3',
        type: 'number',
        defaultValue: '3',
      },
    ],
    hasChildren: true,
  },
  {
    type: 'call',
    label: 'Call function',
    description: 'Invoke a Lua function',
    category: 'Functions',
    fields: [
      {
        name: 'function',
        label: 'Function name',
        placeholder: 'my_function',
        type: 'text',
        defaultValue: 'my_function',
      },
      {
        name: 'args',
        label: 'Arguments',
        placeholder: 'context.data',
        type: 'text',
        defaultValue: 'context.data',
      },
    ],
  },
  {
    type: 'return',
    label: 'Return',
    description: 'Return a value from the script',
    category: 'Basics',
    fields: [
      {
        name: 'value',
        label: 'Value',
        placeholder: 'true',
        type: 'text',
        defaultValue: 'true',
      },
    ],
  },
  {
    type: 'comment',
    label: 'Comment',
    description: 'Add a comment to explain a step',
    category: 'Basics',
    fields: [
      {
        name: 'text',
        label: 'Comment',
        placeholder: 'Explain what happens here',
        type: 'text',
        defaultValue: 'Explain what happens here',
      },
    ],
  },
]

const BLOCK_DEFINITION_MAP = new Map<LuaBlockType, BlockDefinition>(
  BLOCK_DEFINITIONS.map((definition) => [definition.type, definition])
)

const BLOCKS_BY_CATEGORY = BLOCK_DEFINITIONS.reduce<Record<BlockCategory, BlockDefinition[]>>(
  (acc, definition) => {
    acc[definition.category] = [...(acc[definition.category] || []), definition]
    return acc
  },
  {
    Basics: [],
    Logic: [],
    Loops: [],
    Data: [],
    Functions: [],
  }
)

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(16).slice(2)}`

const createBlock = (type: LuaBlockType): LuaBlock => {
  const definition = BLOCK_DEFINITION_MAP.get(type)
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
}

const cloneBlock = (block: LuaBlock): LuaBlock => ({
  ...block,
  id: createBlockId(),
  fields: { ...block.fields },
  children: block.children ? block.children.map(cloneBlock) : undefined,
  elseChildren: block.elseChildren ? block.elseChildren.map(cloneBlock) : undefined,
})

const encodeBlocksMetadata = (blocks: LuaBlock[]) =>
  `${BLOCKS_METADATA_PREFIX}${JSON.stringify({ version: 1, blocks })}`

const decodeBlocksMetadata = (code: string): LuaBlock[] | null => {
  const metadataLine = code
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith(BLOCKS_METADATA_PREFIX))

  if (!metadataLine) return null

  const json = metadataLine.slice(BLOCKS_METADATA_PREFIX.length)
  try {
    const parsed = JSON.parse(json)
    if (!parsed || !Array.isArray(parsed.blocks)) return null
    return parsed.blocks as LuaBlock[]
  } catch {
    return null
  }
}

const indent = (depth: number) => '  '.repeat(depth)

const getFieldValue = (block: LuaBlock, fieldName: string, fallback: string) => {
  const value = block.fields[fieldName]
  if (value === undefined || value === null) return fallback
  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : fallback
}

const renderChildBlocks = (blocks: LuaBlock[] | undefined, depth: number) => {
  if (!blocks || blocks.length === 0) {
    return `${indent(depth)}-- add blocks here`
  }
  return renderBlocks(blocks, depth)
}

const renderBlock = (block: LuaBlock, depth: number) => {
  switch (block.type) {
    case 'log': {
      const message = getFieldValue(block, 'message', '""')
      return `${indent(depth)}log(${message})`
    }
    case 'set_variable': {
      const scope = getFieldValue(block, 'scope', 'local')
      const name = getFieldValue(block, 'name', 'value')
      const value = getFieldValue(block, 'value', 'nil')
      const keyword = scope === 'local' ? 'local ' : ''
      return `${indent(depth)}${keyword}${name} = ${value}`
    }
    case 'if': {
      const condition = getFieldValue(block, 'condition', 'true')
      const body = renderChildBlocks(block.children, depth + 1)
      return `${indent(depth)}if ${condition} then\n${body}\n${indent(depth)}end`
    }
    case 'if_else': {
      const condition = getFieldValue(block, 'condition', 'true')
      const thenBody = renderChildBlocks(block.children, depth + 1)
      const elseBody = renderChildBlocks(block.elseChildren, depth + 1)
      return `${indent(depth)}if ${condition} then\n${thenBody}\n${indent(depth)}else\n${elseBody}\n${indent(depth)}end`
    }
    case 'repeat': {
      const iterator = getFieldValue(block, 'iterator', 'i')
      const count = getFieldValue(block, 'count', '1')
      const body = renderChildBlocks(block.children, depth + 1)
      return `${indent(depth)}for ${iterator} = 1, ${count} do\n${body}\n${indent(depth)}end`
    }
    case 'return': {
      const value = getFieldValue(block, 'value', 'nil')
      return `${indent(depth)}return ${value}`
    }
    case 'call': {
      const functionName = getFieldValue(block, 'function', 'my_function')
      const args = getFieldValue(block, 'args', '')
      const argsSection = args ? args : ''
      return `${indent(depth)}${functionName}(${argsSection})`
    }
    case 'comment': {
      const text = getFieldValue(block, 'text', '')
      return `${indent(depth)}-- ${text}`
    }
    default:
      return ''
  }
}

const renderBlocks = (blocks: LuaBlock[], depth: number) =>
  blocks.map((block) => renderBlock(block, depth)).filter(Boolean).join('\n')

const buildLuaFromBlocks = (blocks: LuaBlock[]) => {
  const metadata = encodeBlocksMetadata(blocks)
  const body = renderBlocks(blocks, 0)
  if (!body.trim()) {
    return `${metadata}\n-- empty block workspace\n`
  }
  return `${metadata}\n${body}\n`
}

const addBlockToTree = (
  blocks: LuaBlock[],
  parentId: string | null,
  slot: BlockSlot,
  newBlock: LuaBlock
): LuaBlock[] => {
  if (slot === 'root' || !parentId) {
    return [...blocks, newBlock]
  }

  return blocks.map((block) => {
    if (block.id === parentId) {
      const current = slot === 'children' ? block.children ?? [] : block.elseChildren ?? []
      const updated = [...current, newBlock]
      if (slot === 'children') {
        return { ...block, children: updated }
      }
      return { ...block, elseChildren: updated }
    }

    const children = block.children
      ? addBlockToTree(block.children, parentId, slot, newBlock)
      : block.children
    const elseChildren = block.elseChildren
      ? addBlockToTree(block.elseChildren, parentId, slot, newBlock)
      : block.elseChildren

    if (children !== block.children || elseChildren !== block.elseChildren) {
      return { ...block, children, elseChildren }
    }

    return block
  })
}

const updateBlockInTree = (
  blocks: LuaBlock[],
  blockId: string,
  updater: (block: LuaBlock) => LuaBlock
): LuaBlock[] =>
  blocks.map((block) => {
    if (block.id === blockId) {
      return updater(block)
    }

    const children = block.children ? updateBlockInTree(block.children, blockId, updater) : block.children
    const elseChildren = block.elseChildren
      ? updateBlockInTree(block.elseChildren, blockId, updater)
      : block.elseChildren

    if (children !== block.children || elseChildren !== block.elseChildren) {
      return { ...block, children, elseChildren }
    }

    return block
  })

const removeBlockFromTree = (blocks: LuaBlock[], blockId: string): LuaBlock[] =>
  blocks
    .filter((block) => block.id !== blockId)
    .map((block) => {
      const children = block.children ? removeBlockFromTree(block.children, blockId) : block.children
      const elseChildren = block.elseChildren
        ? removeBlockFromTree(block.elseChildren, blockId)
        : block.elseChildren

      if (children !== block.children || elseChildren !== block.elseChildren) {
        return { ...block, children, elseChildren }
      }

      return block
    })

const moveBlockInTree = (blocks: LuaBlock[], blockId: string, direction: 'up' | 'down'): LuaBlock[] => {
  const index = blocks.findIndex((block) => block.id === blockId)
  if (index !== -1) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= blocks.length) return blocks

    const updated = [...blocks]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    return updated
  }

  return blocks.map((block) => {
    const children = block.children ? moveBlockInTree(block.children, blockId, direction) : block.children
    const elseChildren = block.elseChildren
      ? moveBlockInTree(block.elseChildren, blockId, direction)
      : block.elseChildren

    if (children !== block.children || elseChildren !== block.elseChildren) {
      return { ...block, children, elseChildren }
    }

    return block
  })
}

interface LuaBlocksEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaBlocksEditor({ scripts, onScriptsChange }: LuaBlocksEditorProps) {
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [blocksByScript, setBlocksByScript] = useState<Record<string, LuaBlock[]>>({})
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuTarget, setMenuTarget] = useState<{ parentId: string | null; slot: BlockSlot } | null>(
    null
  )

  useEffect(() => {
    if (scripts.length === 0) {
      setSelectedScriptId(null)
      return
    }

    if (!selectedScriptId || !scripts.find((script) => script.id === selectedScriptId)) {
      setSelectedScriptId(scripts[0].id)
    }
  }, [scripts, selectedScriptId])

  useEffect(() => {
    if (!selectedScriptId) return

    if (Object.prototype.hasOwnProperty.call(blocksByScript, selectedScriptId)) {
      return
    }

    const script = scripts.find((item) => item.id === selectedScriptId)
    const parsedBlocks = script ? decodeBlocksMetadata(script.code) : null

    setBlocksByScript((prev) => ({
      ...prev,
      [selectedScriptId]: parsedBlocks ?? [],
    }))
  }, [blocksByScript, scripts, selectedScriptId])

  const selectedScript = scripts.find((script) => script.id === selectedScriptId) || null
  const activeBlocks = selectedScriptId ? blocksByScript[selectedScriptId] || [] : []
  const generatedCode = useMemo(() => buildLuaFromBlocks(activeBlocks), [activeBlocks])

  const handleAddScript = () => {
    const starterBlocks = [createBlock('log')]
    const newScript: LuaScript = {
      id: `lua_${Date.now()}`,
      name: 'Block Script',
      description: 'Built with Lua blocks',
      code: buildLuaFromBlocks(starterBlocks),
      parameters: [],
    }

    onScriptsChange([...scripts, newScript])
    setBlocksByScript((prev) => ({ ...prev, [newScript.id]: starterBlocks }))
    setSelectedScriptId(newScript.id)
    toast.success('Block script created')
  }

  const handleDeleteScript = (scriptId: string) => {
    const remaining = scripts.filter((script) => script.id !== scriptId)
    onScriptsChange(remaining)

    setBlocksByScript((prev) => {
      const { [scriptId]: _, ...rest } = prev
      return rest
    })

    if (selectedScriptId === scriptId) {
      setSelectedScriptId(remaining.length > 0 ? remaining[0].id : null)
    }

    toast.success('Script deleted')
  }

  const handleUpdateScript = (updates: Partial<LuaScript>) => {
    if (!selectedScript) return
    onScriptsChange(
      scripts.map((script) => (script.id === selectedScript.id ? { ...script, ...updates } : script))
    )
  }

  const handleApplyCode = () => {
    if (!selectedScript) return
    handleUpdateScript({ code: generatedCode })
    toast.success('Lua code updated from blocks')
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      toast.success('Lua code copied to clipboard')
    } catch (error) {
      toast.error('Unable to copy code')
    }
  }

  const handleReloadFromCode = () => {
    if (!selectedScript) return
    const parsed = decodeBlocksMetadata(selectedScript.code)
    if (!parsed) {
      toast.warning('No block metadata found in this script')
      return
    }
    setBlocksByScript((prev) => ({ ...prev, [selectedScript.id]: parsed }))
    toast.success('Blocks loaded from script')
  }

  const handleRequestAddBlock = (
    event: React.MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => {
    setMenuAnchor(event.currentTarget)
    setMenuTarget(target)
  }

  const handleAddBlock = (type: LuaBlockType) => {
    if (!selectedScriptId || !menuTarget) return

    const newBlock = createBlock(type)
    setBlocksByScript((prev) => ({
      ...prev,
      [selectedScriptId]: addBlockToTree(prev[selectedScriptId] || [], menuTarget.parentId, menuTarget.slot, newBlock),
    }))

    setMenuAnchor(null)
    setMenuTarget(null)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setMenuTarget(null)
  }

  const handleUpdateField = (blockId: string, fieldName: string, value: string) => {
    if (!selectedScriptId) return
    setBlocksByScript((prev) => ({
      ...prev,
      [selectedScriptId]: updateBlockInTree(prev[selectedScriptId] || [], blockId, (block) => ({
        ...block,
        fields: {
          ...block.fields,
          [fieldName]: value,
        },
      })),
    }))
  }

  const handleRemoveBlock = (blockId: string) => {
    if (!selectedScriptId) return
    setBlocksByScript((prev) => ({
      ...prev,
      [selectedScriptId]: removeBlockFromTree(prev[selectedScriptId] || [], blockId),
    }))
  }

  const handleDuplicateBlock = (blockId: string) => {
    if (!selectedScriptId) return

    setBlocksByScript((prev) => {
      const blocks = prev[selectedScriptId] || []
      let duplicated: LuaBlock | null = null

      const updated = updateBlockInTree(blocks, blockId, (block) => {
        duplicated = cloneBlock(block)
        return block
      })

      if (!duplicated) return prev

      return {
        ...prev,
        [selectedScriptId]: addBlockToTree(updated, null, 'root', duplicated),
      }
    })
  }

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!selectedScriptId) return
    setBlocksByScript((prev) => ({
      ...prev,
      [selectedScriptId]: moveBlockInTree(prev[selectedScriptId] || [], blockId, direction),
    }))
  }

  const renderBlockFields = (block: LuaBlock) => {
    const definition = BLOCK_DEFINITION_MAP.get(block.type)
    if (!definition || definition.fields.length === 0) return null

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
                onChange={(event) => handleUpdateField(block.id, field.name, event.target.value)}
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
                onChange={(event) => handleUpdateField(block.id, field.name, event.target.value)}
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

  const renderBlockSection = (
    title: string,
    blocks: LuaBlock[] | undefined,
    parentId: string | null,
    slot: BlockSlot
  ) => (
    <Box className={styles.blockSection}>
      <Box className={styles.blockSectionHeader}>
        <Typography className={styles.blockSectionTitle}>{title}</Typography>
        <Button
          size="small"
          variant="contained"
          onClick={(event) => handleRequestAddBlock(event, { parentId, slot })}
          startIcon={<AddIcon fontSize="small" />}
        >
          Add block
        </Button>
      </Box>
      <Box className={styles.blockSectionBody}>
        {blocks && blocks.length > 0 ? (
          blocks.map((child, index) => renderBlockCard(child, index, blocks.length))
        ) : (
          <Box className={styles.blockEmpty}>Drop blocks here to build this section.</Box>
        )}
      </Box>
    </Box>
  )

  const renderBlockCard = (block: LuaBlock, index: number, total: number) => {
    const definition = BLOCK_DEFINITION_MAP.get(block.type)
    if (!definition) return null

    return (
      <Box key={block.id} className={styles.blockCard} data-category={definition.category}>
        <Box className={styles.blockHeader}>
          <Typography className={styles.blockTitle}>{definition.label}</Typography>
          <Box className={styles.blockActions}>
            <Tooltip title="Move up">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleMoveBlock(block.id, 'up')}
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
                  onClick={() => handleMoveBlock(block.id, 'down')}
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
                onClick={() => handleDuplicateBlock(block.id)}
                sx={{ color: 'rgba(255,255,255,0.85)' }}
              >
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete block">
              <IconButton
                size="small"
                onClick={() => handleRemoveBlock(block.id)}
                sx={{ color: 'rgba(255,255,255,0.85)' }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {renderBlockFields(block)}
        {definition.hasChildren && renderBlockSection('Then', block.children, block.id, 'children')}
        {definition.hasElseChildren &&
          renderBlockSection('Else', block.elseChildren, block.id, 'elseChildren')}
      </Box>
    )
  }

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
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddScript}
                >
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

          <Card>
            <CardHeader title="Block library" subheader="Click a block to add it" />
            <CardContent>
              <Stack spacing={2}>
                {Object.entries(BLOCKS_BY_CATEGORY).map(([category, blocks]) => (
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
                          onClick={(event) =>
                            handleRequestAddBlock(event, { parentId: null, slot: 'root' })
                          }
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
                                handleRequestAddBlock(event, { parentId: null, slot: 'root' })
                                handleAddBlock(block.type)
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
                      <Box className={styles.blockStack}>
                        {activeBlocks.map((block, index) =>
                          renderBlockCard(block, index, activeBlocks.length)
                        )}
                      </Box>
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { minWidth: 280 } }}
      >
        {BLOCK_DEFINITIONS.map((definition) => (
          <MenuItem key={definition.type} onClick={() => handleAddBlock(definition.type)}>
            <Box
              className={styles.menuSwatch}
              data-category={definition.category}
              sx={{ mr: 1 }}
            />
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
    </Box>
  )
}
