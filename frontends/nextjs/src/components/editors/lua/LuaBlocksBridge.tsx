import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Trash } from '@phosphor-icons/react'
import type { LuaExecutionResult } from '@/lib/lua-engine'
import type { LuaScript } from '@/lib/level-types'
import { LuaExecutionResultCard } from './LuaExecutionResultCard'
import { LuaContextInfo } from './LuaContextInfo'

interface LuaBlocksBridgeProps {
  currentScript: LuaScript
  testInputs: Record<string, any>
  testOutput: LuaExecutionResult | null
  onAddParameter: () => void
  onDeleteParameter: (index: number) => void
  onUpdateParameter: (index: number, updates: { name?: string; type?: string }) => void
  onUpdateScript: (updates: Partial<LuaScript>) => void
  onUpdateTestInput: (name: string, value: any) => void
}

export function LuaBlocksBridge({
  currentScript,
  testInputs,
  testOutput,
  onAddParameter,
  onDeleteParameter,
  onUpdateParameter,
  onUpdateScript,
  onUpdateTestInput,
}: LuaBlocksBridgeProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Script Name</Label>
          <Input
            value={currentScript.name}
            onChange={event => onUpdateScript({ name: event.target.value })}
            placeholder="validate_user"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Return Type</Label>
          <Input
            value={currentScript.returnType || ''}
            onChange={event => onUpdateScript({ returnType: event.target.value })}
            placeholder="table, boolean, string..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={currentScript.description || ''}
          onChange={event => onUpdateScript({ description: event.target.value })}
          placeholder="What this script does..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Parameters</Label>
          <Button size="sm" variant="outline" onClick={onAddParameter}>
            Add Parameter
          </Button>
        </div>
        <div className="space-y-2">
          {currentScript.parameters.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">No parameters defined</p>
          ) : (
            currentScript.parameters.map((param, index) => (
              <div key={param.name} className="flex gap-2 items-center">
                <Input
                  value={param.name}
                  onChange={event => onUpdateParameter(index, { name: event.target.value })}
                  placeholder="paramName"
                  className="flex-1 font-mono text-sm"
                />
                <Input
                  value={param.type}
                  onChange={event => onUpdateParameter(index, { type: event.target.value })}
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

      {currentScript.parameters.length > 0 && (
        <div>
          <Label className="mb-2 block">Test Input Values</Label>
          <div className="space-y-2">
            {currentScript.parameters.map(param => (
              <div key={param.name} className="flex gap-2 items-center">
                <Label className="w-32 text-sm font-mono">{param.name}</Label>
                <Input
                  value={testInputs[param.name] ?? ''}
                  onChange={event => {
                    const value =
                      param.type === 'number'
                        ? parseFloat(event.target.value) || 0
                        : param.type === 'boolean'
                        ? event.target.value === 'true'
                        : event.target.value
                    onUpdateTestInput(param.name, value)
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

      {testOutput && <LuaExecutionResultCard result={testOutput} />}

      <LuaContextInfo />
    </div>
  )
}
