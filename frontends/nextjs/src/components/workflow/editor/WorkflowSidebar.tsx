import { Badge, Button } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import type { WorkflowSidebarProps } from './types'

export const WorkflowSidebar = ({
  workflows,
  selectedWorkflowId,
  onSelectWorkflow,
  onAddWorkflow,
  onDeleteWorkflow,
}: WorkflowSidebarProps) => (
  <Card className="md:col-span-1">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Workflows</div>
        <Button size="sm" onClick={onAddWorkflow}>
          <AddIcon sx={{ fontSize: 16 }} />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Automation workflows</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {workflows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No workflows yet. Create one to start.
          </p>
        ) : (
          workflows.map(workflow => (
            <div
              key={workflow.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedWorkflowId === workflow.id
                  ? 'bg-accent border-accent-foreground'
                  : 'hover:bg-muted border-border'
              }`}
              onClick={() => onSelectWorkflow(workflow.id)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{workflow.name}</div>
                <div className="text-xs text-muted-foreground">{workflow.nodes.length} nodes</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={workflow.enabled ? 'default' : 'secondary'} className="text-xs">
                  {workflow.enabled ? 'On' : 'Off'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    onDeleteWorkflow(workflow.id)
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
)
