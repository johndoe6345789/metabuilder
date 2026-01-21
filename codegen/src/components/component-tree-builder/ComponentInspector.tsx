import { ComponentNode } from '@/types/project'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash, Tree } from '@phosphor-icons/react'

interface ComponentInspectorProps {
  selectedNode: ComponentNode | null
  muiComponents: string[]
  onDelete: (nodeId: string) => void
  onUpdate: (nodeId: string, updates: Partial<ComponentNode>) => void
  onAddChild: (parentId: string) => void
}

export function ComponentInspector({
  selectedNode,
  muiComponents,
  onDelete,
  onUpdate,
  onAddChild,
}: ComponentInspectorProps) {
  return (
    <Card className="flex-1 p-6">
      {selectedNode ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Component Properties</h4>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(selectedNode.id)}
            >
              <Trash size={16} />
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Component Name</Label>
              <Input
                value={selectedNode.name}
                onChange={(event) =>
                  onUpdate(selectedNode.id, { name: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Component Type</Label>
              <Select
                value={selectedNode.type}
                onValueChange={(value) =>
                  onUpdate(selectedNode.id, { type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {muiComponents.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Props (JSON)</Label>
              <Textarea
                value={JSON.stringify(selectedNode.props, null, 2)}
                onChange={(event) => {
                  try {
                    const props = JSON.parse(event.target.value)
                    onUpdate(selectedNode.id, { props })
                  } catch (err) {
                    // Invalid JSON while typing - ignore
                  }
                }}
                className="font-mono text-sm h-64"
                placeholder='{"variant": "contained", "color": "primary"}'
              />
            </div>

            <Button onClick={() => onAddChild(selectedNode.id)}>
              <Plus size={16} className="mr-2" />
              Add Child Component
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Tree size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a component to edit properties</p>
          </div>
        </div>
      )}
    </Card>
  )
}
