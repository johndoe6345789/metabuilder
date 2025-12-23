import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, Play, CheckCircle, XCircle, Code, FileCode } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { createLuaEngine, type LuaExecutionResult } from '@/lib/lua-engine'
import { getLuaExampleCode, getLuaExamplesList } from '@/lib/lua-examples'
import type { LuaScript } from '@/lib/level-types'

interface LuaEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaEditor({ scripts, onScriptsChange }: LuaEditorProps) {
  const [selectedScript, setSelectedScript] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [testOutput, setTestOutput] = useState<LuaExecutionResult | null>(null)
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)

  const currentScript = scripts.find(s => s.id === selectedScript)

  useEffect(() => {
    if (currentScript) {
      const inputs: Record<string, any> = {}
      currentScript.parameters.forEach((param) => {
        inputs[param.name] = param.type === 'number' ? 0 : param.type === 'boolean' ? false : ''
      })
      setTestInputs(inputs)
    }
  }, [selectedScript, currentScript?.parameters.length])

  const handleAddScript = () => {
    const newScript: LuaScript = {
      id: `lua_${Date.now()}`,
      name: 'New Script',
      code: '-- Lua script example\n-- Access input parameters via context.data\n-- Use log() or print() to output messages\n\nlog("Script started")\n\nif context.data then\n  log("Received data:", context.data)\nend\n\nlocal result = {\n  success = true,\n  message = "Script executed successfully"\n}\n\nreturn result',
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

  const handleTestScript = async () => {
    if (!currentScript) return

    setIsExecuting(true)
    setTestOutput(null)

    try {
      const engine = createLuaEngine()
      
      const contextData: any = {}
      currentScript.parameters.forEach((param) => {
        contextData[param.name] = testInputs[param.name]
      })

      const result = await engine.execute(currentScript.code, {
        data: contextData,
        user: { username: 'test_user', role: 'god' },
        log: (...args: any[]) => console.log('[Lua]', ...args)
      })

      setTestOutput(result)
      
      if (result.success) {
        toast.success('Script executed successfully')
      } else {
        toast.error('Script execution failed')
      }

      engine.destroy()
    } catch (error) {
      toast.error('Execution error: ' + (error instanceof Error ? error.message : String(error)))
      setTestOutput({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: []
      })
    } finally {
      setIsExecuting(false)
    }
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
                <Button onClick={handleTestScript} disabled={isExecuting}>
                  <Play className="mr-2" size={16} />
                  {isExecuting ? 'Executing...' : 'Test Script'}
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
                  {currentScript.parameters.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
                      No parameters defined
                    </p>
                  ) : (
                    currentScript.parameters.map((param, index) => (
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
                    ))
                  )}
                </div>
              </div>

              {currentScript.parameters.length > 0 && (
                <div>
                  <Label className="mb-2 block">Test Input Values</Label>
                  <div className="space-y-2">
                    {currentScript.parameters.map((param) => (
                      <div key={param.name} className="flex gap-2 items-center">
                        <Label className="w-32 text-sm font-mono">{param.name}</Label>
                        <Input
                          value={testInputs[param.name] ?? ''}
                          onChange={(e) => {
                            const value = param.type === 'number' 
                              ? parseFloat(e.target.value) || 0
                              : param.type === 'boolean'
                              ? e.target.value === 'true'
                              : e.target.value
                            setTestInputs({ ...testInputs, [param.name]: value })
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Lua Code</Label>
                  <Select
                    onValueChange={(value) => {
                      const exampleCode = getLuaExampleCode(value as any)
                      handleUpdateScript({ code: exampleCode })
                      toast.success('Example loaded')
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <FileCode size={16} className="mr-2" />
                      <SelectValue placeholder="Load example" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLuaExamplesList().map((example) => (
                        <SelectItem key={example.key} value={example.key}>
                          <div>
                            <div className="font-medium">{example.name}</div>
                            <div className="text-xs text-muted-foreground">{example.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={currentScript.code}
                  onChange={(e) => handleUpdateScript({ code: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder="-- Lua script&#10;log('Hello from Lua!')&#10;return {success = true}"
                />
                <p className="text-xs text-muted-foreground">
                  Write Lua code. Access parameters via <code className="font-mono">context.data</code>. Use <code className="font-mono">log()</code> or <code className="font-mono">print()</code> for output.
                </p>
              </div>

              {testOutput && (
                <Card className={testOutput.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {testOutput.success ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                      <CardTitle className="text-sm">
                        {testOutput.success ? 'Execution Successful' : 'Execution Failed'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testOutput.error && (
                      <div>
                        <Label className="text-xs text-red-600 mb-1">Error</Label>
                        <pre className="text-xs font-mono whitespace-pre-wrap text-red-700 bg-red-100 p-2 rounded">
                          {testOutput.error}
                        </pre>
                      </div>
                    )}
                    
                    {testOutput.logs.length > 0 && (
                      <div>
                        <Label className="text-xs mb-1">Logs</Label>
                        <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded">
                          {testOutput.logs.join('\n')}
                        </pre>
                      </div>
                    )}
                    
                    {testOutput.result !== null && testOutput.result !== undefined && (
                      <div>
                        <Label className="text-xs mb-1">Return Value</Label>
                        <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded">
                          {JSON.stringify(testOutput.result, null, 2)}
                        </pre>
                      </div>
                    )}
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
