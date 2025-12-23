import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, Play } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { LuaScript } from '@/lib/level-types'

interface LuaEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaEditor({ scripts, onScriptsChange }: LuaEditorProps) {
  const [selectedScript, setSelectedScript] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [testOutput, setTestOutput] = useState<string>('')

  const currentScript = scripts.find(s => s.id === selectedScript)

  const handleAddScript = () => {
    const newScript: LuaScript = {
      id: `lua_${Date.now()}`,
      name: 'New Script',
      code: '-- Lua script\nfunction execute(context)\n  -- Your code here\n  return {success = true}\nend',
      parameters: [],
    }
    onScriptsChange([...scripts, newScript])
    setSelectedScript(newScript.id)
    toast.success('Script created')
  }

  const handleDeleteScript = (scriptId: string) => {
    onScriptsChange(scripts.filter(s => s.id !== scriptId))
    if (selectedScript === scriptId) {
      setSelectedScript(scripts.length > 1 ? scripts[0].id : null)
    }
    toast.success('Script deleted')
  }

  const handleUpdateScript = (updates: Partial<LuaScript>) => {
    if (!currentScript) return
    
    onScriptsChange(
      scripts.map(s => s.id === selectedScript ? { ...s, ...updates } : s)
    )
  }

  const handleTestScript = () => {
    if (!currentScript) return

    setTestOutput('Lua execution simulation:\n\nScript: ' + currentScript.name + '\n\nNote: Actual Lua execution would require a Lua interpreter library.\nFor now, this is a mock test showing your script would execute.\n\nYour code:\n' + currentScript.code)
    toast.info('Script test simulation complete')
  }

  const handleAddParameter = () => {
    if (!currentScript) return

    const newParam = { name: `param${currentScript.parameters.length + 1}`, type: 'string' }
    handleUpdateScript({
      parameters: [...currentScript.parameters, newParam],
    })
  }

  const handleDeleteParameter = (index: number) => {
    if (!currentScript) return

    handleUpdateScript({
      parameters: currentScript.parameters.filter((_, i) => i !== index),
    })
  }

  const handleUpdateParameter = (index: number, updates: { name?: string; type?: string }) => {
    if (!currentScript) return

    handleUpdateScript({
      parameters: currentScript.parameters.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      ),
    })
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lua Scripts</CardTitle>
            <Button size="sm" onClick={handleAddScript}>
              <Plus size={16} />
            </Button>
          </div>
          <CardDescription>Custom logic scripts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scripts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No scripts yet. Create one to start.
              </p>
            ) : (
              scripts.map((script) => (
                <div
                  key={script.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedScript === script.id
                      ? 'bg-accent border-accent-foreground'
                      : 'hover:bg-muted border-border'
                  }`}
                  onClick={() => setSelectedScript(script.id)}
                >
                  <div>
                    <div className="font-medium text-sm font-mono">{script.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {script.parameters.length} params
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteScript(script.id)
                    }}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        {!currentScript ? (
          <CardContent className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select or create a script to edit</p>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Script: {currentScript.name}</CardTitle>
                  <CardDescription>Write custom Lua logic</CardDescription>
                </div>
                <Button onClick={handleTestScript}>
                  <Play className="mr-2" size={16} />
                  Test Script
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Script Name</Label>
                  <Input
                    value={currentScript.name}
                    onChange={(e) => handleUpdateScript({ name: e.target.value })}
                    placeholder="validate_user"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Type</Label>
                  <Input
                    value={currentScript.returnType || ''}
                    onChange={(e) => handleUpdateScript({ returnType: e.target.value })}
                    placeholder="table, boolean, string..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={currentScript.description || ''}
                  onChange={(e) => handleUpdateScript({ description: e.target.value })}
                  placeholder="What this script does..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Parameters</Label>
                  <Button size="sm" variant="outline" onClick={handleAddParameter}>
                    <Plus className="mr-2" size={14} />
                    Add Parameter
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentScript.parameters.map((param, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={param.name}
                        onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                        placeholder="paramName"
                        className="flex-1 font-mono text-sm"
                      />
                      <Input
                        value={param.type}
                        onChange={(e) => handleUpdateParameter(index, { type: e.target.value })}
                        placeholder="string"
                        className="w-32 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteParameter(index)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lua Code</Label>
                <Textarea
                  value={currentScript.code}
                  onChange={(e) => handleUpdateScript({ code: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder="-- Lua script&#10;function execute(context)&#10;  -- Your code here&#10;  return {success = true}&#10;end"
                />
                <p className="text-xs text-muted-foreground">
                  Write Lua code. The context object provides access to data and utilities.
                </p>
              </div>

              {testOutput && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Test Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono whitespace-pre-wrap">{testOutput}</pre>
                  </CardContent>
                </Card>
              )}

              <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Available in context:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><code className="font-mono">context.data</code> - Input data</li>
                    <li><code className="font-mono">context.user</code> - Current user info</li>
                    <li><code className="font-mono">context.kv</code> - Key-value storage</li>
                    <li><code className="font-mono">context.log(msg)</code> - Logging function</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
