import { ArrowsOutCardinal, Cursor } from '@phosphor-icons/react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { CatalogList } from './CatalogList'
import { ConfigDialogLauncher } from './ConfigDialogLauncher'
import { TreeNode } from './TreeNode'
import { useHierarchyDragDrop } from './hooks/useHierarchyDragDrop'
import { useHierarchyState } from './hooks/useHierarchyState'

type ComponentHierarchyEditorProps = {
  nerdMode?: boolean
}

export function ComponentHierarchyEditor({ nerdMode = false }: ComponentHierarchyEditorProps) {
  const {
    pages,
    selectedPageId,
    setSelectedPageId,
    hierarchy,
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    setExpandedNodes,
    configNodeId,
    openConfig,
    loadHierarchy,
    getRootNodes,
    toggleNode,
    expandAll,
    collapseAll,
    handleAddComponent,
    handleDeleteNode,
  } = useHierarchyState()

  const { draggingNodeId, handleDragStart, handleDragOver, handleDrop } = useHierarchyDragDrop({
    hierarchy,
    setExpandedNodes,
    loadHierarchy,
  })

  const rootNodes = getRootNodes()

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
                <Button variant="outline" size="sm" onClick={expandAll}>
                  <ArrowsOutCardinal className="mr-2" />
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
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
                rootNodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Cursor size={48} className="mb-4" />
                    <p>No components yet. Add one from the catalog!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {rootNodes.map((node) => (
                      <TreeNode
                        key={node.id}
                        node={node}
                        hierarchy={hierarchy}
                        selectedNodeId={selectedNodeId}
                        expandedNodes={expandedNodes}
                        onSelect={setSelectedNodeId}
                        onToggle={toggleNode}
                        onDelete={handleDeleteNode}
                        onConfig={openConfig}
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
            <CatalogList selectedNodeId={selectedNodeId} onAdd={handleAddComponent} />
          </CardContent>
        </Card>
      </div>

      <ConfigDialogLauncher
        configNodeId={configNodeId}
        hierarchy={hierarchy}
        nerdMode={nerdMode}
        onClose={() => openConfig(null)}
        onSaved={loadHierarchy}
      />
    </div>
  )
}
