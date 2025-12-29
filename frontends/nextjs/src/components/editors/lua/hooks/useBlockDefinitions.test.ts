import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBlockDefinitions } from './useBlockDefinitions'
import {
  BLOCKS_METADATA_PREFIX,
  buildLuaFromBlocks,
  decodeBlocksMetadata,
} from './luaBlockSerialization'
import type { LuaBlock } from '../types'

describe('useBlockDefinitions', () => {
  it('aggregates block metadata by category', () => {
    const { result } = renderHook(() => useBlockDefinitions())

    expect(result.current.blockDefinitions).toHaveLength(8)
    expect(result.current.blocksByCategory.Basics.map(block => block.type)).toEqual(
      expect.arrayContaining(['log', 'return', 'comment'])
    )
    expect(result.current.blocksByCategory.Data.map(block => block.type)).toEqual(['set_variable'])
    expect(result.current.blocksByCategory.Logic.map(block => block.type)).toEqual(
      expect.arrayContaining(['if', 'if_else'])
    )
    expect(result.current.blocksByCategory.Loops.map(block => block.type)).toEqual(['repeat'])
    expect(result.current.blocksByCategory.Functions.map(block => block.type)).toEqual(['call'])
  })
})

describe('lua block serialization', () => {
  const sampleBlocks: LuaBlock[] = [
    {
      id: 'if-block',
      type: 'if_else',
      fields: { condition: 'context.data.count > 5' },
      children: [
        {
          id: 'log-then',
          type: 'log',
          fields: { message: '"High count"' },
        },
      ],
      elseChildren: [
        {
          id: 'reset-count',
          type: 'set_variable',
          fields: { scope: 'local', name: 'count', value: '0' },
        },
      ],
    },
  ]

  it('serializes Lua with metadata header', () => {
    const lua = buildLuaFromBlocks(sampleBlocks)

    expect(lua.startsWith(BLOCKS_METADATA_PREFIX)).toBe(true)
    expect(lua).toContain('if context.data.count > 5 then')
    expect(lua).toContain('log("High count")')
    expect(lua).toContain('local count = 0')
  })

  it('round-trips block metadata through serialization', () => {
    const lua = buildLuaFromBlocks(sampleBlocks)
    const parsed = decodeBlocksMetadata(lua)

    expect(parsed).toEqual(sampleBlocks)
  })

  it('returns null when metadata is missing', () => {
    expect(decodeBlocksMetadata('-- some lua code without metadata')).toBeNull()
  })
})
