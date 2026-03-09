import { useState } from 'react'
import { useComponentTreeLoader } from '@/hooks/use-component-tree-loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Tabs, Tab, TabPanel } from '@metabuilder/fakemui/navigation'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/sonner'
import {
  Cube,
  TreeStructure,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Package,
  Stack,
} from '@metabuilder/fakemui/icons'
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
  const [activeTab, setActiveTab] = useState(0)

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
    <div>
      <ComponentTreeHeader
        isLoaded={isLoaded}
        isLoading={isLoading}
        totalTrees={allTrees.length}
        onReload={handleReload}
      />
      <ComponentTreeStatus error={error} />

      <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)}>
        <Tab value={0} label={componentTreeCopy.tabs.molecules} icon={<Package size={16} />} />
        <Tab value={1} label={componentTreeCopy.tabs.organisms} icon={<Stack size={16} />} />
        <Tab value={2} label={componentTreeCopy.tabs.all} icon={<Cube size={16} />} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <div>
          <ComponentTreeList
            trees={moleculeTrees}
            selectedTreeId={selectedTreeId}
            onSelect={setSelectedTreeId}
            variant="molecules"
          />
          <ComponentTreeDetails tree={selectedTree} />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <div>
          <ComponentTreeList
            trees={organismTrees}
            selectedTreeId={selectedTreeId}
            onSelect={setSelectedTreeId}
            variant="organisms"
          />
          <ComponentTreeDetails tree={selectedTree} />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <div>
          <ComponentTreeList
            trees={allTrees}
            selectedTreeId={selectedTreeId}
            onSelect={setSelectedTreeId}
            variant="all"
          />
          <ComponentTreeDetails tree={selectedTree} />
        </div>
      </TabPanel>
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
    <div>
      <div>
        <TreeStructure size={24} weight="duotone" />
        <div>
          <h2>{componentTreeCopy.header.title}</h2>
          <p>
            {componentTreeCopy.header.subtitle}
          </p>
        </div>
      </div>
      <div>
        {isLoaded && (
          <Badge variant="outline">
            <CheckCircle size={14} weight="fill" />
            {totalTrees} {componentTreeCopy.header.loadedLabel}
          </Badge>
        )}
        <Button variant="outlined" size="small" onClick={onReload} disabled={isLoading}>
          <ArrowsClockwise size={16} />
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
    <div>
      <Warning size={20} weight="fill" />
      <div>
        <p>{componentTreeCopy.status.errorTitle}</p>
        <p>{error.message}</p>
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
    <ScrollArea>
      <div>
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
              onClick={() => onSelect(tree.id)}
            >
              <CardHeader>
                <CardTitle>
                  {treeIcon === 'molecule' ? (
                    <Package size={18} weight="duotone" />
                  ) : (
                    <Stack size={18} weight="duotone" />
                  )}
                  {tree.name}
                  {categoryLabel ? (
                    <Badge variant="outline">
                      {categoryLabel}
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{tree.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <span>
                    {tree.rootNodes.length} {componentTreeCopy.labels.rootNodes}
                  </span>
                  <Separator orientation="vertical" />
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
      <div>
        <div>
          <TreeStructure size={48} weight="duotone" />
          <p>{componentTreeCopy.status.selectPrompt}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ScrollArea>
        <div>
          <div>
            <h3>{tree.name}</h3>
            <p>{tree.description}</p>
            <div>
              <Badge variant="outline">
                {tree.rootNodes.length} {componentTreeCopy.labels.rootNodes}
              </Badge>
              <Badge variant="outline">
                {componentTreeCopy.labels.id}: {tree.id}
              </Badge>
            </div>
            <Separator />
          </div>

          <div>
            <h4>
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
    <div>
      <div
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div>
          <span>{node.name || node.type}</span>
          <Badge variant="secondary">
            {node.type}
          </Badge>
        </div>
        {Object.keys(node.props).length > 0 && (
          <div>
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
