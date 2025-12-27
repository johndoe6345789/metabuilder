import type { BlockSlot, LuaBlock } from '../../types'

export const addBlockToTree = (
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

export const updateBlockInTree = (
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

export const removeBlockFromTree = (blocks: LuaBlock[], blockId: string): LuaBlock[] =>
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

export const moveBlockInTree = (blocks: LuaBlock[], blockId: string, direction: 'up' | 'down'): LuaBlock[] => {
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
