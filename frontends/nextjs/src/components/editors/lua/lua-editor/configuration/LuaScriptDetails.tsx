import { Plus, Trash } from '@/fakemui/icons'

import { Badge, Button, CardContent, Input, Label } from '@/components/ui'
import type { LuaScript } from '@/lib/level-types'
import type { JsonValue } from '@/types/utility-types'

interface LuaScriptDetailsProps {
  script: LuaScript
  testInputs: Record<string, JsonValue>
  onUpdateScript: (updates: Partial<LuaScript>) => void
  onAddParameter: () => void
  onDeleteParameter: (index: number) => void
  onUpdateParameter: (index: number, updates: { name?: string; type?: string }) => void
  onTestInputChange: (paramName: string, value: JsonValue) => void
}

export const LuaScriptDetails = ({
  script,
  testInputs,
  onUpdateScript,
  onAddParameter,
  onDeleteParameter,
  onUpdateParameter,
  onTestInputChange,
}: LuaScriptDetailsProps) => (
  <CardContent className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Script Name</Label>
        <Input
          value={script.name}
          onChange={e => onUpdateScript({ name: e.target.value })}
          placeholder="validate_user"
          className="font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label>Return Type</Label>
        <Input
          value={script.returnType || ''}
          onChange={e => onUpdateScript({ returnType: e.target.value })}
          placeholder="table, boolean, string..."
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label>Description</Label>
      <Input
        value={script.description || ''}
        onChange={e => onUpdateScript({ description: e.target.value })}
        placeholder="What this script does..."
      />
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Parameters</Label>
        <Button size="sm" variant="outline" onClick={onAddParameter}>
          <Plus className="mr-2" size={14} />
          Add Parameter
        </Button>
      </div>
      <div className="space-y-2">
        {script.parameters.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
            No parameters defined
          </p>
        ) : (
          script.parameters.map((param, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={param.name}
                onChange={e => onUpdateParameter(index, { name: e.target.value })}
                placeholder="paramName"
                className="flex-1 font-mono text-sm"
              />
              <Input
                value={param.type}
                onChange={e => onUpdateParameter(index, { type: e.target.value })}
                placeholder="string"
                className="w-32 text-sm"
              />
              <Button variant="ghost" size="sm" onClick={() => onDeleteParameter(index)}>
                <Trash size={14} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>

    {script.parameters.length > 0 && (
      <div>
        <Label className="mb-2 block">Test Input Values</Label>
        <div className="space-y-2">
          {script.parameters.map(param => (
            <div key={param.name} className="flex gap-2 items-center">
              <Label className="w-32 text-sm font-mono">{param.name}</Label>
              <Input
                value={testInputs[param.name] ?? ''}
                onChange={e => {
                  const value =
                    param.type === 'number'
                      ? parseFloat(e.target.value) || 0
                      : param.type === 'boolean'
                        ? e.target.value === 'true'
                        : e.target.value
                  onTestInputChange(param.name, value)
                }}
                placeholder={`Enter ${param.type} value`}
                className="flex-1 text-sm"
                type={param.type === 'number' ? 'number' : 'text'}
              />
              <Badge variant="outline" className="text-xs">
                {param.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )}
  </CardContent>
)
