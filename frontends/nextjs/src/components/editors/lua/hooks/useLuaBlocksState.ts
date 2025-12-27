import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { toast } from 'sonner'
import type { LuaScript } from '@/lib/level-types'
import type { BlockSlot, LuaBlock, LuaBlockType } from '../types'

interface UseLuaBlocksStateProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
  buildLuaFromBlocks: (blocks: LuaBlock[]) => string
  createBlock: (type: LuaBlockType) => LuaBlock
  cloneBlock: (block: LuaBlock) => LuaBlock
  decodeBlocksMetadata: (code: string) => LuaBlock[] | null
}

interface MenuTarget {
  parentId: string | null
  slot: BlockSlot
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

    const children = block.children ? addBlockToTree(block.children, parentId, slot, newBlock) : block.children
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
  }, [blocksByScript, decodeBlocksMetadata, scripts, selectedScriptId])

  const selectedScript = scripts.find((script) => script.id === selectedScriptId) || null
  const activeBlocks = selectedScriptId ? blocksByScript[selectedScriptId] || [] : []
  const generatedCode = useMemo(() => buildLuaFromBlocks(activeBlocks), [activeBlocks, buildLuaFromBlocks])

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
    event: MouseEvent<HTMLElement>,
    target: { parentId: string | null; slot: BlockSlot }
  ) => {
    setMenuAnchor(event.currentTarget)
    setMenuTarget(target)
  }

  const handleAddBlock = (type: LuaBlockType, target?: { parentId: string | null; slot: BlockSlot }) => {
    const resolvedTarget = target ?? menuTarget
    if (!selectedScriptId || !resolvedTarget) return

    const newBlock = createBlock(type)
    setBlocksByScript((prev) => ({
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

  return {
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
    menuTarget,
    selectedScript,
    selectedScriptId,
    setSelectedScriptId,
  }
}
