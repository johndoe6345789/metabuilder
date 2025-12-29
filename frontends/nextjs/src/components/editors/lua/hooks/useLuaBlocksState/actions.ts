import type { Dispatch, MouseEvent, SetStateAction } from 'react'
import { toast } from 'sonner'

import type { LuaScript } from '@/lib/level-types'

import type { BlockSlot, LuaBlock, LuaBlockType } from '../../types'
import { addBlockToTree, moveBlockInTree, removeBlockFromTree, updateBlockInTree } from './storage'

export interface MenuTarget {
  parentId: string | null
  slot: BlockSlot
}

interface LuaBlocksActionConfig {
  scripts: LuaScript[]
  selectedScript: LuaScript | null
  selectedScriptId: string | null
  generatedCode: string
  menuTarget: MenuTarget | null
  buildLuaFromBlocks: (blocks: LuaBlock[]) => string
  createBlock: (type: LuaBlockType) => LuaBlock
  cloneBlock: (block: LuaBlock) => LuaBlock
  decodeBlocksMetadata: (code: string) => LuaBlock[] | null
  onScriptsChange: (scripts: LuaScript[]) => void
  setBlocksByScript: Dispatch<SetStateAction<Record<string, LuaBlock[]>>>
  setMenuAnchor: Dispatch<SetStateAction<HTMLElement | null>>
  setMenuTarget: Dispatch<SetStateAction<MenuTarget | null>>
  setSelectedScriptId: Dispatch<SetStateAction<string | null>>
}

export const createLuaBlocksActions = ({
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
}: LuaBlocksActionConfig) => {
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
    setBlocksByScript(prev => ({ ...prev, [newScript.id]: starterBlocks }))
    setSelectedScriptId(newScript.id)
    toast.success('Block script created')
  }

  const handleDeleteScript = (scriptId: string) => {
    const remaining = scripts.filter(script => script.id !== scriptId)
    onScriptsChange(remaining)

    setBlocksByScript(prev => {
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
      scripts.map(script => (script.id === selectedScript.id ? { ...script, ...updates } : script))
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
    setBlocksByScript(prev => ({ ...prev, [selectedScript.id]: parsed }))
    toast.success('Blocks loaded from script')
  }

  const handleRequestAddBlock = (
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => {
    setMenuAnchor(event.currentTarget)
    setMenuTarget(target)
  }

  const handleAddBlock = (type: LuaBlockType, target?: MenuTarget) => {
    const resolvedTarget = target ?? menuTarget
    if (!selectedScriptId || !resolvedTarget) return

    const newBlock = createBlock(type)
    setBlocksByScript(prev => ({
      ...prev,
      [selectedScriptId]: addBlockToTree(
        prev[selectedScriptId] || [],
        resolvedTarget.parentId,
        resolvedTarget.slot,
        newBlock
      ),
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
    setBlocksByScript(prev => ({
      ...prev,
      [selectedScriptId]: updateBlockInTree(prev[selectedScriptId] || [], blockId, block => ({
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
    setBlocksByScript(prev => ({
      ...prev,
      [selectedScriptId]: removeBlockFromTree(prev[selectedScriptId] || [], blockId),
    }))
  }

  const handleDuplicateBlock = (blockId: string) => {
    if (!selectedScriptId) return

    setBlocksByScript(prev => {
      const blocks = prev[selectedScriptId] || []
      let duplicated: LuaBlock | null = null

      const updated = updateBlockInTree(blocks, blockId, block => {
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
    setBlocksByScript(prev => ({
      ...prev,
      [selectedScriptId]: moveBlockInTree(prev[selectedScriptId] || [], blockId, direction),
    }))
  }

  return {
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
  }
}
