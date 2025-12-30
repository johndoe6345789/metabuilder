import { Button, Label } from '@/components/ui'
import { ArrowRight, Code, GitBranch, Lightning } from '@/fakemui/icons'

import type { WorkflowNodesPanelProps } from './types'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export const WorkflowNodesPanel = ({
  workflow,
  scripts,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
}: WorkflowNodesPanelProps) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <Label className="text-base">Nodes</Label>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onAddNode('trigger')}>
          <Lightning size={14} style={{ marginRight: 4 }} />
          Trigger
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('action')}>
          <ArrowRight size={14} style={{ marginRight: 4 }} />
          Action
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('condition')}>
          <GitBranch size={14} style={{ marginRight: 4 }} />
          Condition
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('lua')}>
          <Code size={14} style={{ marginRight: 4 }} />
          Lua
        </Button>
      </div>
    </div>

    <div className="space-y-3">
      {workflow.nodes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
          No nodes yet. Add nodes to build your workflow.
        </p>
      ) : (
        workflow.nodes.map((node, index) => (
          <WorkflowNodeCard
            key={node.id}
            node={node}
            index={index}
            totalNodes={workflow.nodes.length}
            scripts={scripts}
            onDeleteNode={onDeleteNode}
            onUpdateNode={onUpdateNode}
          />
        ))
      )}
    </div>
  </div>
)
