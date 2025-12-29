import { ArrowsOutCardinal, Plus, Tree } from '@phosphor-icons/react'
import { useCallback, useId, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { componentCatalog } from '@/lib/components/component-catalog'
import { type ComponentNode, Database } from '@/lib/database'

import { ComponentConfigDialog } from './ComponentConfigDialog'
import { selectRootNodes } from './ComponentHierarchyEditor/selectors'
import { HierarchyTree } from './ComponentHierarchyEditor/Tree'
import { useHierarchyData } from './modules/useHierarchyData'
import { useHierarchyDragDrop } from './modules/useHierarchyDragDrop'

export function ComponentHierarchyEditor({ nerdMode = false }: { nerdMode?: boolean }) {
  const { pages, selectedPageId, setSelectedPageId, hierarchy, loadHierarchy } = useHierarchyData()
  const {
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    draggingNodeId,
    handleToggleNode,
    handleExpandAll,
    handleCollapseAll,
    handleDragStart,
    handleDragOver,
    handleDrop,
    expandNode,
  } = useHierarchyDragDrop({ hierarchy, loadHierarchy })
  const [configNodeId, setConfigNodeId] = useState<string | null>(null)
  const componentIdPrefix = useId()

  const rootNodes = useMemo(
    () => selectRootNodes(hierarchy, selectedPageId),
    [hierarchy, selectedPageId]
  )

  const handleAddComponent = useCallback(
    async (componentType: string, parentId?: string) => {
      if (!selectedPageId) {
        toast.error('Please select a page first')
        return
      }

      const componentDef = componentCatalog.find(c => c.type === componentType)
      if (!componentDef) return

      const newNode: ComponentNode = {
        id: `node_${componentIdPrefix}_${Object.keys(hierarchy).length}`,
        type: componentType,
        parentId: parentId,
        childIds: [],
        order: parentId ? hierarchy[parentId]?.childIds.length || 0 : rootNodes.length,
        pageId: selectedPageId,
      }

      if (parentId && hierarchy[parentId]) {
        await Database.updateComponentNode(parentId, {
          childIds: [...hierarchy[parentId].childIds, newNode.id],
        })
      }

      await Database.addComponentNode(newNode)
      await loadHierarchy()
      expandNode(parentId)
      toast.success(`Added ${componentType}`)
    },
    [componentIdPrefix, expandNode, hierarchy, loadHierarchy, rootNodes.length, selectedPageId]
  )

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
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
    },
    [hierarchy, loadHierarchy]
  )

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
                  {pages.map(page => (
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
                <HierarchyTree
                  rootNodes={rootNodes}
                  hierarchy={hierarchy}
                  selectedNodeId={selectedNodeId}
                  expandedNodes={expandedNodes}
                  draggingNodeId={draggingNodeId}
                  onSelect={setSelectedNodeId}
                  onToggle={handleToggleNode}
                  onDelete={handleDeleteNode}
                  onConfig={setConfigNodeId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
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
                {['Layout', 'Input', 'Typography', 'Display', 'Feedback', 'Data'].map(category => {
                  const categoryComponents = componentCatalog.filter(c => c.category === category)
                  if (categoryComponents.length === 0) return null

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-sm mb-2">{category}</h3>
                      <Separator className="mb-3" />
                      <div className="space-y-1">
                        {categoryComponents.map(component => (
                          <button
                            key={component.type}
                            onClick={() =>
                              handleAddComponent(component.type, selectedNodeId || undefined)
                            }
                            className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                          >
                            <div className="text-muted-foreground">
                              <Tree size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{component.label}</div>
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
