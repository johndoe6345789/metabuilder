'use client'

import type { TreeNode } from './builder-registry'
import { walk } from './component-tree-utils'

export function getSelectedTreeNode(
  tree: TreeNode,
  selectedId: string
): TreeNode {
  let found = tree
  walk(tree, node => {
    if (node.id === selectedId) found = node
  })
  return found
}
