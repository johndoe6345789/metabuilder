import { useEffect, useMemo, useState } from 'react'

import type { LuaScript } from '@/lib/level-types'

import type { LuaBlock, LuaBlockType } from '../types'
import { createLuaBlocksActions, type MenuTarget } from './useLuaBlocksState/actions'
import { selectActiveBlocks, selectSelectedScript } from './useLuaBlocksState/selectors'

interface UseLuaBlocksStateProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
  buildLuaFromBlocks: (blocks: LuaBlock[]) => string
  createBlock: (type: LuaBlockType) => LuaBlock
  cloneBlock: (block: LuaBlock) => LuaBlock
  decodeBlocksMetadata: (code: string) => LuaBlock[] | null
}

export function useLuaBlocksState({
  scripts,
  onScriptsChange,
  buildLuaFromBlocks,
  createBlock,
  cloneBlock,
  decodeBlocksMetadata,
}: UseLuaBlocksStateProps) {
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [blocksByScript, setBlocksByScript] = useState<Record<string, LuaBlock[]>>({})
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null)

  useEffect(() => {
    if (scripts.length === 0) {
      setSelectedScriptId(null)
      return
    }

    if (!selectedScriptId || !scripts.find(script => script.id === selectedScriptId)) {
      setSelectedScriptId(scripts[0].id)
    }
  }, [scripts, selectedScriptId])

  useEffect(() => {
    if (!selectedScriptId) return

    if (Object.prototype.hasOwnProperty.call(blocksByScript, selectedScriptId)) {
      return
    }

    const script = scripts.find(item => item.id === selectedScriptId)
    const parsedBlocks = script ? decodeBlocksMetadata(script.code) : null

    setBlocksByScript(prev => ({
      ...prev,
      [selectedScriptId]: parsedBlocks ?? [],
    }))
  }, [blocksByScript, decodeBlocksMetadata, scripts, selectedScriptId])

  const selectedScript = selectSelectedScript(scripts, selectedScriptId)
  const activeBlocks = selectActiveBlocks(blocksByScript, selectedScriptId)
  const generatedCode = useMemo(
    () => buildLuaFromBlocks(activeBlocks),
    [activeBlocks, buildLuaFromBlocks]
  )

  const actions = createLuaBlocksActions({
    scripts,
    selectedScript,
    selectedScriptId,
    generatedCode,
    menuTarget,
    buildLuaFromBlocks,
    createBlock,
    cloneBlock,
    decodeBlocksMetadata,
    onScriptsChange,
    setBlocksByScript,
    setMenuAnchor,
    setMenuTarget,
    setSelectedScriptId,
  })

  return {
    activeBlocks,
    generatedCode,
    menuAnchor,
    menuTarget,
    selectedScript,
    selectedScriptId,
    setSelectedScriptId,
    ...actions,
  }
}
