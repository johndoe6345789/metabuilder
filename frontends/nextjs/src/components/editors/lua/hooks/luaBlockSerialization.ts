import type { LuaBlock } from '../types'

export const BLOCKS_METADATA_PREFIX = '--@blocks '

const indent = (depth: number) => '  '.repeat(depth)

const getFieldValue = (block: LuaBlock, fieldName: string, fallback: string) => {
  const value = block.fields[fieldName]
  if (value === undefined || value === null) return fallback
  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : fallback
}

const renderBlocks = (blocks: LuaBlock[], depth: number, renderBlock: (block: LuaBlock, depth: number) => string) =>
  blocks
    .map((block) => renderBlock(block, depth))
    .filter(Boolean)
    .join('\n')

const renderChildBlocks = (
  blocks: LuaBlock[] | undefined,
  depth: number,
  renderBlock: (block: LuaBlock, depth: number) => string
) => {
  if (!blocks || blocks.length === 0) {
    return `${indent(depth)}-- add blocks here`
  }
  return renderBlocks(blocks, depth, renderBlock)
}

export const buildLuaFromBlocks = (blocks: LuaBlock[]) => {
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
}

export const decodeBlocksMetadata = (code: string): LuaBlock[] | null => {
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
