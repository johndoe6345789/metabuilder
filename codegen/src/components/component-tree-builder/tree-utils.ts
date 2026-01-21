import { ComponentNode } from '@/types/project'

export const createComponentNode = (
  overrides: Partial<ComponentNode> = {}
): ComponentNode => ({
  id: `node-${Date.now()}`,
  type: 'Box',
  name: 'NewComponent',
  props: {},
  children: [],
  ...overrides,
})

export const findNodeById = (
  nodes: ComponentNode[],
  id: string
): ComponentNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(node.children, id)
    if (found) return found
  }
  return null
}

export const addChildNode = (
  nodes: ComponentNode[],
  parentId: string,
  childNode: ComponentNode
): ComponentNode[] =>
  nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, childNode] }
    }
    return { ...node, children: addChildNode(node.children, parentId, childNode) }
  })

export const deleteNodeFromTree = (
  nodes: ComponentNode[],
  nodeId: string
): ComponentNode[] =>
  nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({ ...node, children: deleteNodeFromTree(node.children, nodeId) }))

export const updateNodeInTree = (
  nodes: ComponentNode[],
  nodeId: string,
  updates: Partial<ComponentNode>
): ComponentNode[] =>
  nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, ...updates }
    }
    return { ...node, children: updateNodeInTree(node.children, nodeId, updates) }
  })
