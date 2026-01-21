import { ComponentNode } from '@/types/project'
import componentTreeBuilderData from '@/data/component-tree-builder.json'
import { ComponentInspector } from '@/components/component-tree-builder/ComponentInspector'
import { ComponentTreeToolbar } from '@/components/component-tree-builder/ComponentTreeToolbar'
import { ComponentTreeView } from '@/components/component-tree-builder/ComponentTreeView'
import { useComponentTreeBuilder } from '@/hooks/use-component-tree-builder'

interface ComponentTreeBuilderProps {
  components: ComponentNode[]
  onComponentsChange: (components: ComponentNode[]) => void
}

const { muiComponents } = componentTreeBuilderData

export function ComponentTreeBuilder({
  components,
  onComponentsChange,
}: ComponentTreeBuilderProps) {
  const {
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
  } = useComponentTreeBuilder({ components, onComponentsChange })

  return (
    <div className="h-full flex gap-4 p-6">
      <div className="w-80 flex flex-col gap-4">
        <ComponentTreeToolbar
          onGenerate={generateComponentWithAI}
          onAddRoot={addRootComponent}
        />
        <ComponentTreeView
          nodes={components}
          selectedNodeId={selectedNodeId}
          expandedNodes={expandedNodes}
          onSelectNode={selectNode}
          onToggleExpand={toggleExpand}
        />
      </div>
      <ComponentInspector
        selectedNode={selectedNode}
        muiComponents={muiComponents}
        onDelete={deleteNode}
        onUpdate={updateNode}
        onAddChild={addChildComponent}
      />
    </div>
  )
}
