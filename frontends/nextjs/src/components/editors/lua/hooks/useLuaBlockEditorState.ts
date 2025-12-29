import type { LuaScript } from '@/lib/level-types'
import { useBlockDefinitions } from './useBlockDefinitions'
import { useLuaBlocksState } from './useLuaBlocksState'

interface UseLuaBlockEditorStateProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function useLuaBlockEditorState({ scripts, onScriptsChange }: UseLuaBlockEditorStateProps) {
  const blockDefinitionState = useBlockDefinitions()

  const luaBlockState = useLuaBlocksState({
    scripts,
    onScriptsChange,
    buildLuaFromBlocks: blockDefinitionState.buildLuaFromBlocks,
    createBlock: blockDefinitionState.createBlock,
    cloneBlock: blockDefinitionState.cloneBlock,
    decodeBlocksMetadata: blockDefinitionState.decodeBlocksMetadata,
  })

  return {
    ...blockDefinitionState,
    ...luaBlockState,
  }
}
