import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Tree, 
  Plus, 
  Trash, 
  GearSix, 
  ArrowsOutCardinal, 
  CaretDown, 
  CaretRight,
  Cursor
} from '@phosphor-icons/react'
import { Database, ComponentNode } from '@/lib/database'
import { componentCatalog } from '@/lib/component-catalog'
import { toast } from 'sonner'
import type { PageConfig } from '@/lib/level-types'
import { ComponentConfigDialog } from './ComponentConfigDialog'

interface TreeNodeProps {
  node: ComponentNode
  hierarchy: Record<string, ComponentNode>
  selectedNodeId: string | null
  expandedNodes: Set<string>
  onSelect: (nodeId: string) => void
  onToggle: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onConfig: (nodeId: string) => void
  onDragStart: (nodeId: string) => void
  onDragOver: (e: React.DragEvent, nodeId: string) => void
  onDrop: (e: React.DragEvent, targetNodeId: string) => void
  draggingNodeId: string | null
}

function TreeNode({
  node,
  hierarchy,
  selectedNodeId,
  expandedNodes,
  onSelect,
  onToggle,
  onDelete,
  onConfig,
  onDragStart,
  onDragOver,
  onDrop,
  draggingNodeId,
}: TreeNodeProps) {
  const hasChildren = node.childIds.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const isSelected = selectedNodeId === node.id
  const isDragging = draggingNodeId === node.id

  const componentDef = componentCatalog.find(c => c.type === node.type)

  return (
    <div className="select-none">
      <div
        draggable
        onDragStart={() => onDragStart(node.id)}
        onDragOver={(e) => onDragOver(e, node.id)}
        onDrop={(e) => onDrop(e, node.id)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
          hover:bg-accent transition-colors group
          ${isSelected ? 'bg-accent' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="hover:bg-secondary rounded p-0.5"
          >
            {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
          </button>
        ) : (
          <div className="w-[14px]" />
        )}
        
        <div className="text-muted-foreground">
          <Tree size={16} />
        </div>
        
        <span className="flex-1 text-sm font-medium">{node.type}</span>
        
        <Badge variant="outline" className="text-xs">
          {node.order}
        </Badge>
        
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onConfig(node.id)
            }}
          >
            <GearSix size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-border pl-2">
          {node.childIds
            .sort((a, b) => hierarchy[a].order - hierarchy[b].order)
            .map((childId) => (
              <TreeNode
                key={childId}
                node={hierarchy[childId]}
                hierarchy={hierarchy}
                selectedNodeId={selectedNodeId}
                expandedNodes={expandedNodes}
                onSelect={onSelect}
                onToggle={onToggle}
                onDelete={onDelete}
                onConfig={onConfig}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                draggingNodeId={draggingNodeId}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export function ComponentHierarchyEditor({ nerdMode = false }: { nerdMode?: boolean }) {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>('')
  const [hierarchy, setHierarchy] = useState<Record<string, ComponentNode>>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [configNodeId, setConfigNodeId] = useState<string | null>(null)

  useEffect(() => {
    loadPages()
    loadHierarchy()
  }, [])

  useEffect(() => {
    if (selectedPageId) {
      loadHierarchy()
    }
  }, [selectedPageId])

  const loadPages = async () => {
    const loadedPages = await Database.getPages()
    setPages(loadedPages)
    if (loadedPages.length > 0 && !selectedPageId) {
      setSelectedPageId(loadedPages[0].id)
    }
  }

  const loadHierarchy = async () => {
    const allHierarchy = await Database.getComponentHierarchy()
    setHierarchy(allHierarchy)
  }

  const getRootNodes = () => {
    return Object.values(hierarchy)
      .filter(node => node.pageId === selectedPageId && !node.parentId)
      .sort((a, b) => a.order - b.order)
  }

  const handleAddComponent = async (componentType: string, parentId?: string) => {
    if (!selectedPageId) {
      toast.error('Please select a page first')
      return
    }

    const componentDef = componentCatalog.find(c => c.type === componentType)
    if (!componentDef) return

    const newNode: ComponentNode = {
      id: `node_${Date.now()}`,
      type: componentType,
      parentId: parentId,
      childIds: [],
      order: parentId
        ? hierarchy[parentId]?.childIds.length || 0
        : getRootNodes().length,
      pageId: selectedPageId,
    }

    if (parentId && hierarchy[parentId]) {
      await Database.updateComponentNode(parentId, {
        childIds: [...hierarchy[parentId].childIds, newNode.id],
      })
    }

    await Database.addComponentNode(newNode)
    await loadHierarchy()
    setExpandedNodes(prev => new Set([...prev, parentId || '']))
    toast.success(`Added ${componentType}`)
  }

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm('Delete this component and all its children?')) return

    const node = hierarchy[nodeId]
    if (!node) return

    const deleteRecursive = async (id: string) => {
      const n = hierarchy[id]
      if (!n) return
      
      for (const childId of n.childIds) {
        await deleteRecursive(childId)
      }
      await Database.deleteComponentNode(id)
    }

    if (node.parentId && hierarchy[node.parentId]) {
      const parent = hierarchy[node.parentId]
      await Database.updateComponentNode(node.parentId, {
        childIds: parent.childIds.filter(id => id !== nodeId),
      })
    }

    await deleteRecursive(nodeId)
    await loadHierarchy()
    toast.success('Component deleted')
  }

  const handleToggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId)
  }

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggingNodeId || draggingNodeId === targetNodeId) {
      setDraggingNodeId(null)
      return
    }

    const draggedNode = hierarchy[draggingNodeId]
    const targetNode = hierarchy[targetNodeId]

    if (!draggedNode || !targetNode) {
      setDraggingNodeId(null)
      return
    }

    if (targetNode.childIds.includes(draggingNodeId)) {
      setDraggingNodeId(null)
      return
    }

    const componentDef = componentCatalog.find(c => c.type === targetNode.type)
    if (!componentDef?.allowsChildren) {
      toast.error(`${targetNode.type} cannot contain children`)
      setDraggingNodeId(null)
      return
    }

    if (draggedNode.parentId) {
      const oldParent = hierarchy[draggedNode.parentId]
      await Database.updateComponentNode(draggedNode.parentId, {
        childIds: oldParent.childIds.filter(id => id !== draggingNodeId),
      })
    }

    await Database.updateComponentNode(targetNodeId, {
      childIds: [...targetNode.childIds, draggingNodeId],
    })

    await Database.updateComponentNode(draggingNodeId, {
      parentId: targetNodeId,
      order: targetNode.childIds.length,
    })

    setDraggingNodeId(null)
    setExpandedNodes(prev => new Set([...prev, targetNodeId]))
    await loadHierarchy()
    toast.success('Component moved')
  }

  const handleExpandAll = () => {
    setExpandedNodes(new Set(Object.keys(hierarchy)))
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <div className="col-span-8 space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Component Hierarchy</CardTitle>
                <CardDescription>Drag and drop to reorganize components</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExpandAll}>
                  <ArrowsOutCardinal className="mr-2" />
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={handleCollapseAll}>
                  <ArrowsOutCardinal className="mr-2" />
                  Collapse All
                </Button>
              </div>
            </div>
            <div className="pt-4">
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title} ({page.path})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {selectedPageId ? (
                getRootNodes().length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Cursor size={48} className="mb-4" />
                    <p>No components yet. Add one from the catalog!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {getRootNodes().map((node) => (
                      <TreeNode
                        key={node.id}
                        node={node}
                        hierarchy={hierarchy}
                        selectedNodeId={selectedNodeId}
                        expandedNodes={expandedNodes}
                        onSelect={setSelectedNodeId}
                        onToggle={handleToggleNode}
                        onDelete={handleDeleteNode}
                        onConfig={setConfigNodeId}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        draggingNodeId={draggingNodeId}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Select a page to edit its component hierarchy</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-4 space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Component Catalog</CardTitle>
            <CardDescription>Add components to the selected node</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {['Layout', 'Input', 'Typography', 'Display', 'Feedback', 'Data'].map((category) => {
                  const categoryComponents = componentCatalog.filter(
                    (c) => c.category === category
                  )
                  if (categoryComponents.length === 0) return null

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-sm mb-2">{category}</h3>
                      <Separator className="mb-3" />
                      <div className="space-y-1">
                        {categoryComponents.map((component) => (
                          <button
                            key={component.type}
                            onClick={() =>
                              handleAddComponent(
                                component.type,
                                selectedNodeId || undefined
                              )
                            }
                            className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                          >
                            <div className="text-muted-foreground">
                              <Tree size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {component.label}
                              </div>
                              {component.allowsChildren && (
                                <div className="text-xs text-muted-foreground">
                                  Can contain children
                                </div>
                              )}
                            </div>
                            <Plus size={16} className="text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {configNodeId && hierarchy[configNodeId] && (
        <ComponentConfigDialog
          node={hierarchy[configNodeId]}
          isOpen={!!configNodeId}
          onClose={() => setConfigNodeId(null)}
          onSave={async () => {
            await loadHierarchy()
            setConfigNodeId(null)
          }}
          nerdMode={nerdMode}
        />
      )}
    </div>
  )
}
