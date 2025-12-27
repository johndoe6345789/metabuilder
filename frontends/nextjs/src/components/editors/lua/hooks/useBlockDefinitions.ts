import { useCallback, useMemo } from 'react'
import type { BlockCategory, BlockDefinition, LuaBlock, LuaBlockType } from '../types'

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

const createBlockId = () => `block_${Date.now()}_${Math.random().toString(16).slice(2)}`

const indent = (depth: number) => '  '.repeat(depth)

const renderBlocks = (blocks: LuaBlock[], depth: number, renderBlock: (block: LuaBlock, depth: number) => string) =>
  blocks
    .map((block) => renderBlock(block, depth))
    .filter(Boolean)
    .join('\n')

export function useBlockDefinitions() {
  const blockDefinitionMap = useMemo(
    () => new Map<LuaBlockType, BlockDefinition>(BLOCK_DEFINITIONS.map((definition) => [definition.type, definition])),
    []
  )

  const blocksByCategory = useMemo<Record<BlockCategory, BlockDefinition[]>>(() => {
    const initial: Record<BlockCategory, BlockDefinition[]> = {
      Basics: [],
      Logic: [],
      Loops: [],
      Data: [],
      Functions: [],
    }

    return BLOCK_DEFINITIONS.reduce((acc, definition) => {
      acc[definition.category] = [...(acc[definition.category] || []), definition]
      return acc
    }, initial)
  }, [])

  const createBlock = useCallback(
    (type: LuaBlockType): LuaBlock => {
      const definition = blockDefinitionMap.get(type)
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
    },
    [blockDefinitionMap]
  )

  const cloneBlock = useCallback(
    (block: LuaBlock): LuaBlock => ({
      ...block,
      id: createBlockId(),
      fields: { ...block.fields },
      children: block.children ? block.children.map(cloneBlock) : undefined,
      elseChildren: block.elseChildren ? block.elseChildren.map(cloneBlock) : undefined,
    }),
    []
  )

  const getFieldValue = useCallback((block: LuaBlock, fieldName: string, fallback: string) => {
    const value = block.fields[fieldName]
    if (value === undefined || value === null) return fallback
    const normalized = String(value).trim()
    return normalized.length > 0 ? normalized : fallback
  }, [])

  const renderChildBlocks = useCallback(
    (blocks: LuaBlock[] | undefined, depth: number, renderBlock: (block: LuaBlock, depth: number) => string) => {
      if (!blocks || blocks.length === 0) {
        return `${indent(depth)}-- add blocks here`
      }
      return renderBlocks(blocks, depth, renderBlock)
    },
    []
  )

  const buildLuaFromBlocks = useCallback(
    (blocks: LuaBlock[]) => {
      const renderBlock = (block: LuaBlock, depth: number): string => {
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
            const body = renderChildBlocks(block.children, depth + 1, renderBlock)
            return `${indent(depth)}if ${condition} then\n${body}\n${indent(depth)}end`
          }
          case 'if_else': {
            const condition = getFieldValue(block, 'condition', 'true')
            const thenBody = renderChildBlocks(block.children, depth + 1, renderBlock)
            const elseBody = renderChildBlocks(block.elseChildren, depth + 1, renderBlock)
            return `${indent(depth)}if ${condition} then\n${thenBody}\n${indent(depth)}else\n${elseBody}\n${indent(depth)}end`
          }
          case 'repeat': {
            const iterator = getFieldValue(block, 'iterator', 'i')
            const count = getFieldValue(block, 'count', '1')
            const body = renderChildBlocks(block.children, depth + 1, renderBlock)
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

      const metadata = `${BLOCKS_METADATA_PREFIX}${JSON.stringify({ version: 1, blocks })}`
      const body = renderBlocks(blocks, 0, renderBlock)
      if (!body.trim()) {
        return `${metadata}\n-- empty block workspace\n`
      }
      return `${metadata}\n${body}\n`
    },
    [getFieldValue, renderChildBlocks]
  )

  const decodeBlocksMetadata = useCallback((code: string): LuaBlock[] | null => {
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
  }, [])

  return {
    blockDefinitions: BLOCK_DEFINITIONS,
    blockDefinitionMap,
    blocksByCategory,
    createBlock,
    cloneBlock,
    buildLuaFromBlocks,
    decodeBlocksMetadata,
  }
}
