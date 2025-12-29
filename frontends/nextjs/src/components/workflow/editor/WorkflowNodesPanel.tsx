import {
  AccountTree as GitBranchIcon,
  ArrowForward as ArrowRightIcon,
  Code as CodeIcon,
  FlashOn as LightningIcon,
} from '@mui/icons-material'

import { Button, Label } from '@/components/ui'

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
          <LightningIcon sx={{ fontSize: 14, mr: 1 }} />
          Trigger
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('action')}>
          <ArrowRightIcon sx={{ fontSize: 14, mr: 1 }} />
          Action
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('condition')}>
          <GitBranchIcon sx={{ fontSize: 14, mr: 1 }} />
          Condition
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNode('lua')}>
          <CodeIcon sx={{ fontSize: 14, mr: 1 }} />
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
