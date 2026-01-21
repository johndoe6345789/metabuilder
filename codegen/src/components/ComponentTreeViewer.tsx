import { useState } from 'react'
import { useComponentTreeLoader } from '@/hooks/use-component-tree-loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Cube,
  TreeStructure,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Package,
  Stack,
} from '@phosphor-icons/react'
import componentTreeCopy from '@/data/component-tree-viewer.json'
import { ComponentNode, ComponentTree } from '@/types/project'

type ComponentTreeCategory = 'molecule' | 'organism'

type ComponentTreeWithCategory = ComponentTree & {
  category?: ComponentTreeCategory
}

type ComponentTreeHeaderProps = {
  isLoaded: boolean
  isLoading: boolean
  totalTrees: number
  onReload: () => void
}

type ComponentTreeStatusProps = {
  error: Error | null
}

type ComponentTreeListProps = {
  trees: ComponentTreeWithCategory[]
  selectedTreeId: string | null
  onSelect: (id: string) => void
  variant: 'molecules' | 'organisms' | 'all'
}

type ComponentTreeDetailProps = {
  tree?: ComponentTree
}

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString()

const getCategoryLabel = (category?: ComponentTreeCategory) => {
  if (!category) {
    return ''
  }

  return componentTreeCopy.categories[category] ?? category
}

export function ComponentTreeViewer() {
  const {
    isLoaded,
    isLoading,
    error,
    moleculeTrees,
    organismTrees,
    allTrees,
    reloadFromJSON,
  } = useComponentTreeLoader()

  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null)

  const handleReload = async () => {
    try {
      await reloadFromJSON()
      toast.success(componentTreeCopy.toast.reloadSuccess)
    } catch (err) {
      toast.error(componentTreeCopy.toast.reloadError)
    }
  }

  const selectedTree = allTrees.find(tree => tree.id === selectedTreeId)

  return (
    <div className="h-full flex flex-col">
      <ComponentTreeHeader
        isLoaded={isLoaded}
        isLoading={isLoading}
        totalTrees={allTrees.length}
        onReload={handleReload}
      />
      <ComponentTreeStatus error={error} />

      <Tabs defaultValue="molecules" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3">
          <TabsTrigger value="molecules" className="gap-2">
            <Package size={16} />
            {componentTreeCopy.tabs.molecules}
            <Badge variant="secondary" className="ml-1">
              {moleculeTrees.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="organisms" className="gap-2">
            <Stack size={16} />
            {componentTreeCopy.tabs.organisms}
            <Badge variant="secondary" className="ml-1">
              {organismTrees.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Cube size={16} />
            {componentTreeCopy.tabs.all}
            <Badge variant="secondary" className="ml-1">
              {allTrees.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="molecules" className="flex-1 mt-4">
          <div className="grid grid-cols-2 gap-4 px-4">
            <ComponentTreeList
              trees={moleculeTrees}
              selectedTreeId={selectedTreeId}
              onSelect={setSelectedTreeId}
              variant="molecules"
            />
            <ComponentTreeDetails tree={selectedTree} />
          </div>
        </TabsContent>

        <TabsContent value="organisms" className="flex-1 mt-4">
          <div className="grid grid-cols-2 gap-4 px-4">
            <ComponentTreeList
              trees={organismTrees}
              selectedTreeId={selectedTreeId}
              onSelect={setSelectedTreeId}
              variant="organisms"
            />
            <ComponentTreeDetails tree={selectedTree} />
          </div>
        </TabsContent>

        <TabsContent value="all" className="flex-1 mt-4">
          <div className="grid grid-cols-2 gap-4 px-4">
            <ComponentTreeList
              trees={allTrees}
              selectedTreeId={selectedTreeId}
              onSelect={setSelectedTreeId}
              variant="all"
            />
            <ComponentTreeDetails tree={selectedTree} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ComponentTreeHeader({
  isLoaded,
  isLoading,
  totalTrees,
  onReload,
}: ComponentTreeHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <TreeStructure size={24} weight="duotone" className="text-primary" />
        <div>
          <h2 className="text-lg font-semibold">{componentTreeCopy.header.title}</h2>
          <p className="text-sm text-muted-foreground">
            {componentTreeCopy.header.subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoaded && (
          <Badge variant="outline" className="gap-1">
            <CheckCircle size={14} weight="fill" className="text-accent" />
            {totalTrees} {componentTreeCopy.header.loadedLabel}
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={onReload} disabled={isLoading}>
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          {componentTreeCopy.header.reloadLabel}
        </Button>
      </div>
    </div>
  )
}

function ComponentTreeStatus({ error }: ComponentTreeStatusProps) {
  if (!error) {
    return null
  }

  return (
    <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
      <Warning size={20} weight="fill" className="text-destructive mt-0.5" />
      <div>
        <p className="font-medium text-destructive">{componentTreeCopy.status.errorTitle}</p>
        <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
      </div>
    </div>
  )
}

function ComponentTreeList({
  trees,
  selectedTreeId,
  onSelect,
  variant,
}: ComponentTreeListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-3 pr-4">
        {trees.map(tree => {
          const categoryLabel = variant === 'all' ? getCategoryLabel(tree.category) : ''
          const treeIcon =
            variant === 'molecules'
              ? 'molecule'
              : variant === 'organisms'
              ? 'organism'
              : tree.category

          return (
            <Card
              key={tree.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                selectedTreeId === tree.id ? 'border-primary' : ''
              }`}
              onClick={() => onSelect(tree.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {treeIcon === 'molecule' ? (
                    <Package size={18} weight="duotone" className="text-primary" />
                  ) : (
                    <Stack size={18} weight="duotone" className="text-primary" />
                  )}
                  {tree.name}
                  {categoryLabel ? (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {categoryLabel}
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription className="text-xs">{tree.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {tree.rootNodes.length} {componentTreeCopy.labels.rootNodes}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>{formatDate(tree.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function ComponentTreeDetails({ tree }: ComponentTreeDetailProps) {
  if (!tree) {
    return (
      <div className="border-l pl-4">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <TreeStructure size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{componentTreeCopy.status.selectPrompt}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-l pl-4">
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="pr-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">{tree.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tree.description}</p>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">
                {tree.rootNodes.length} {componentTreeCopy.labels.rootNodes}
              </Badge>
              <Badge variant="outline">
                {componentTreeCopy.labels.id}: {tree.id}
              </Badge>
            </div>
            <Separator className="my-4" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-3">
              {componentTreeCopy.labels.structureTitle}
            </h4>
            {tree.rootNodes.map(node => (
              <ComponentTreeNode key={node.id} node={node} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

type ComponentTreeNodeProps = {
  node: ComponentNode
  depth?: number
}

function ComponentTreeNode({ node, depth = 0 }: ComponentTreeNodeProps) {
  return (
    <div className="space-y-2">
      <div
        className="p-2 rounded-md bg-muted/40 border text-xs"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">{node.name || node.type}</span>
          <Badge variant="secondary" className="text-xs">
            {node.type}
          </Badge>
        </div>
        {Object.keys(node.props).length > 0 && (
          <div className="text-muted-foreground mt-1">
            {componentTreeCopy.labels.props}: {Object.keys(node.props).length}
          </div>
        )}
      </div>
      {node.children.map(child => (
        <ComponentTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}
