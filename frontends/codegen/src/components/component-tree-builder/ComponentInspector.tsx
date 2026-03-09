import { ComponentNode } from '@/types/project'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Button, IconButton } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Plus, Trash, Tree } from '@metabuilder/fakemui/icons'

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
    <Card>
      {selectedNode ? (
        <div>
          <div>
            <h4>Component Properties</h4>
            <IconButton
              onClick={() => onDelete(selectedNode.id)}
            >
              <Trash size={16} />
            </IconButton>
          </div>

          <div>
            <div>
              <Label>Component Name</Label>
              <Input
                value={selectedNode.name}
                onChange={(event) =>
                  onUpdate(selectedNode.id, { name: event.target.value })
                }
              />
            </div>

            <div>
              <Label>Component Type</Label>
              <select
                value={selectedNode.type}
                onChange={(event) =>
                  onUpdate(selectedNode.id, { type: event.target.value })
                }
              >
                {muiComponents.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Props (JSON)</Label>
              <textarea
                value={JSON.stringify(selectedNode.props, null, 2)}
                onChange={(event) => {
                  try {
                    const props = JSON.parse(event.target.value)
                    onUpdate(selectedNode.id, { props })
                  } catch (err) {
                    // Invalid JSON while typing - ignore
                  }
                }}
                placeholder='{"variant": "contained", "color": "primary"}'
              />
            </div>

            <Button onClick={() => onAddChild(selectedNode.id)}>
              <Plus size={16} />
              Add Child Component
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <Tree size={48} />
            <p>Select a component to edit properties</p>
          </div>
        </div>
      )}
    </Card>
  )
}
