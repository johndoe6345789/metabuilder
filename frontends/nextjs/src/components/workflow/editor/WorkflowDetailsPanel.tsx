import { Input, Label } from '@/components/ui'
import type { WorkflowDetailsPanelProps } from './types'

export const WorkflowDetailsPanel = ({ workflow, onUpdate }: WorkflowDetailsPanelProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="space-y-2">
      <Label>Workflow Name</Label>
      <Input
        value={workflow.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="My Workflow"
      />
    </div>
    <div className="space-y-2">
      <Label>Description</Label>
      <Input
        value={workflow.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="What this workflow does..."
      />
    </div>
  </div>
)
