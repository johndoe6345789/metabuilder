import { ArrowForward as ArrowRightIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Card, CardContent } from '@mui/material'

import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { LuaScript, WorkflowNode } from '@/lib/level-types'

import { NODE_TYPE_COLORS, NODE_TYPE_ICONS, NODE_TYPE_OPTIONS } from './constants'

interface WorkflowNodeCardProps {
  node: WorkflowNode
  index: number
  totalNodes: number
  scripts: LuaScript[]
  onDeleteNode: (nodeId: string) => void
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
}

const getNodeIcon = (type: WorkflowNode['type']) =>
  NODE_TYPE_ICONS[type] || <ArrowRightIcon fontSize="small" />
const getNodeColor = (type: WorkflowNode['type']) => NODE_TYPE_COLORS[type] || 'grey.500'

export const WorkflowNodeCard = ({
  node,
  index,
  totalNodes,
  scripts,
  onDeleteNode,
  onUpdateNode,
}: WorkflowNodeCardProps) => (
  <Card className="border-2">
    <CardContent className="pt-4">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg ${getNodeColor(node.type)} flex items-center justify-center text-white shrink-0`}
        >
          {getNodeIcon(node.type)}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Node Label</Label>
              <Input
                value={node.label}
                onChange={e => onUpdateNode(node.id, { label: e.target.value })}
                placeholder="Node name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Node Type</Label>
              <Select
                value={node.type}
                onValueChange={value =>
                  onUpdateNode(node.id, { type: value as WorkflowNode['type'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPE_OPTIONS.map(({ type, label }) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {node.type === 'lua' && scripts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Lua Script</Label>
              <Select
                value={node.config.scriptId || ''}
                onValueChange={value =>
                  onUpdateNode(node.id, {
                    config: { ...node.config, scriptId: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a script" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {node.type === 'condition' && (
            <div className="space-y-2">
              <Label className="text-xs">Condition Expression</Label>
              <Input
                value={node.config.condition || ''}
                onChange={e =>
                  onUpdateNode(node.id, {
                    config: { ...node.config, condition: e.target.value },
                  })
                }
                placeholder="data.value > 10"
                className="font-mono text-xs"
              />
            </div>
          )}

          {node.type === 'transform' && (
            <div className="space-y-2">
              <Label className="text-xs">Transform Expression</Label>
              <Input
                value={node.config.transform || ''}
                onChange={e =>
                  onUpdateNode(node.id, {
                    config: { ...node.config, transform: e.target.value },
                  })
                }
                placeholder="{ result: data.value * 2 }"
                className="font-mono text-xs"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {index + 1}
            </Badge>
            {index < totalNodes - 1 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRightIcon sx={{ fontSize: 12 }} />
                <span>Next</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDeleteNode(node.id)}>
          <DeleteIcon sx={{ fontSize: 16 }} />
        </Button>
      </div>
    </CardContent>
  </Card>
)
