import {
  Tabs,
  Tab,
  TabPanel,
} from '@metabuilder/fakemui/navigation'
import {
  Cube,
  Package,
  Stack,
} from '@metabuilder/fakemui/icons'
import componentTreeCopy from '@/data/component-tree-viewer.json'
import { ComponentTree } from '@/types/project'
import { useComponentTreeViewer } from '../hooks/useComponentTreeViewer'
import { ComponentTreeHeader } from './ComponentTreeHeader'
import { ComponentTreeStatus } from './ComponentTreeStatus'
import { ComponentTreeList } from './ComponentTreeList'
import { ComponentTreeDetails } from './ComponentTreeDetails'

type ComponentTreeCategory = 'molecule' | 'organism'
type ComponentTreeWithCategory = ComponentTree & {
  category?: ComponentTreeCategory
}

function TreeTabContent({
  trees,
  selectedTreeId,
  onSelect,
  variant,
  selectedTree,
}: {
  trees: ComponentTreeWithCategory[]
  selectedTreeId: string | null
  onSelect: (id: string) => void
  variant: 'molecules' | 'organisms' | 'all'
  selectedTree?: ComponentTree
}) {
  return (
    <div>
      <ComponentTreeList
        trees={trees}
        selectedTreeId={selectedTreeId}
        onSelect={onSelect}
        variant={variant}
      />
      <ComponentTreeDetails tree={selectedTree} />
    </div>
  )
}

export function ComponentTreeViewer() {
  const {
    isLoaded,
    isLoading,
    error,
    moleculeTrees,
    organismTrees,
    allTrees,
    selectedTreeId,
    setSelectedTreeId,
    activeTab,
    setActiveTab,
    handleReload,
    selectedTree,
  } = useComponentTreeViewer()

  return (
    <div>
      <ComponentTreeHeader
        isLoaded={isLoaded}
        isLoading={isLoading}
        totalTrees={allTrees.length}
        onReload={handleReload}
      />
      <ComponentTreeStatus error={error} />

      <Tabs
        value={activeTab}
        onChange={(_e: any, v: any) =>
          setActiveTab(v)
        }
      >
        <Tab
          value={0}
          label={componentTreeCopy.tabs.molecules}
          icon={<Package size={16} />}
        />
        <Tab
          value={1}
          label={
            componentTreeCopy.tabs.organisms
          }
          icon={<Stack size={16} />}
        />
        <Tab
          value={2}
          label={componentTreeCopy.tabs.all}
          icon={<Cube size={16} />}
        />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <TreeTabContent
          trees={moleculeTrees}
          selectedTreeId={selectedTreeId}
          onSelect={setSelectedTreeId}
          variant="molecules"
          selectedTree={selectedTree}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <TreeTabContent
          trees={organismTrees}
          selectedTreeId={selectedTreeId}
          onSelect={setSelectedTreeId}
          variant="organisms"
          selectedTree={selectedTree}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TreeTabContent
          trees={allTrees}
          selectedTreeId={selectedTreeId}
          onSelect={setSelectedTreeId}
          variant="all"
          selectedTree={selectedTree}
        />
      </TabPanel>
    </div>
  )
}
