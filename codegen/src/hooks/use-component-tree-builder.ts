import { useCallback, useMemo, useState } from 'react'
import { ComponentNode } from '@/types/project'
import { AIService } from '@/lib/ai-service'
import { toast } from 'sonner'
import componentTreeBuilderData from '@/data/component-tree-builder.json'
import {
  addChildNode,
  createComponentNode,
  deleteNodeFromTree,
  findNodeById,
  updateNodeInTree,
} from '@/components/component-tree-builder/tree-utils'

type ComponentTreeBuilderOptions = {
  components: ComponentNode[]
  onComponentsChange: (components: ComponentNode[]) => void
}

const { prompts } = componentTreeBuilderData

export function useComponentTreeBuilder({
  components,
  onComponentsChange,
}: ComponentTreeBuilderOptions) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const selectedNode = useMemo(
    () => (selectedNodeId ? findNodeById(components, selectedNodeId) : null),
    [components, selectedNodeId]
  )

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  const addRootComponent = useCallback(() => {
    const newNode = createComponentNode({
      name: `Component${components.length + 1}`,
    })
    onComponentsChange([...components, newNode])
    setSelectedNodeId(newNode.id)
  }, [components, onComponentsChange])

  const addChildComponent = useCallback(
    (parentId: string) => {
      const newNode = createComponentNode()
      onComponentsChange(addChildNode(components, parentId, newNode))
      setExpandedNodes(prevExpanded => new Set([...prevExpanded, parentId]))
      setSelectedNodeId(newNode.id)
    },
    [components, onComponentsChange]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      onComponentsChange(deleteNodeFromTree(components, nodeId))
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
      }
    },
    [components, onComponentsChange, selectedNodeId]
  )

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<ComponentNode>) => {
      onComponentsChange(updateNodeInTree(components, nodeId, updates))
    },
    [components, onComponentsChange]
  )

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prevExpanded => {
      const newExpanded = new Set(prevExpanded)
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId)
      } else {
        newExpanded.add(nodeId)
      }
      return newExpanded
    })
  }, [])

  const generateComponentWithAI = useCallback(async () => {
    const description = prompt(prompts.generateComponentDescription)
    if (!description) return

    try {
      toast.info('Generating component with AI...')
      const component = await AIService.generateComponent(description)

      if (component) {
        onComponentsChange([...components, component])
        setSelectedNodeId(component.id)
        setExpandedNodes(prevExpanded => new Set([...prevExpanded, component.id]))
        toast.success(`Component "${component.name}" created successfully!`)
      } else {
        toast.error('AI generation failed. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to generate component')
      console.error(error)
    }
  }, [components, onComponentsChange])

  return {
    selectedNode,
    selectedNodeId,
    expandedNodes,
    selectNode,
    addRootComponent,
    addChildComponent,
    deleteNode,
    updateNode,
    toggleExpand,
    generateComponentWithAI,
  }
}
