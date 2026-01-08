import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, Play, CheckCircle, XCircle, FileCode, ArrowsOut, BookOpen, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { createLuaEngine, type LuaExecutionResult } from '@/lib/lua-engine'
import { getLuaExampleCode, getLuaExamplesList } from '@/lib/lua-examples'
import type { LuaScript } from '@/lib/level-types'
import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { LuaSnippetLibrary } from '@/components/LuaSnippetLibrary'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { securityScanner, type SecurityScanResult } from '@/lib/security-scanner'
import { SecurityWarningDialog } from '@/components/SecurityWarningDialog'

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSnippetLibrary, setShowSnippetLibrary] = useState(false)
  const [securityScanResult, setSecurityScanResult] = useState<SecurityScanResult | null>(null)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  const currentScript = scripts.find(s => s.id === selectedScript)

  useEffect(() => {
    if (monaco) {
      monaco.languages.registerCompletionItemProvider('lua', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }

          const suggestions: any[] = [
            {
              label: 'context.data',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'context.data',
              documentation: 'Access input parameters passed to the script',
              range
            },
            {
              label: 'context.user',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'context.user',
              documentation: 'Current user information (username, role, etc.)',
              range
            },
            {
              label: 'context.kv',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'context.kv',
              documentation: 'Key-value storage interface',
              range
            },
            {
              label: 'context.log',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'context.log(${1:message})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Log a message to the output console',
              range
            },
            {
              label: 'log',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'log(${1:message})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Log a message (shortcut for context.log)',
              range
            },
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'print(${1:message})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print a message to output',
              range
            },
            {
              label: 'return',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'return ${1:result}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Return a value from the script',
              range
            },
          ]

          return { suggestions }
        }
      })

      monaco.languages.setLanguageConfiguration('lua', {
        comments: {
          lineComment: '--',
          blockComment: ['--[[', ']]']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      })
    }
  }, [monaco])

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

    const scanResult = securityScanner.scanLua(currentScript.code)
    setSecurityScanResult(scanResult)

    if (scanResult.severity === 'critical' || scanResult.severity === 'high') {
      setShowSecurityDialog(true)
      toast.warning('Security issues detected in script')
      return
    }

    if (scanResult.severity === 'medium' && scanResult.issues.length > 0) {
      toast.warning(`${scanResult.issues.length} security warning(s) detected`)
    }

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

  const handleScanCode = () => {
    if (!currentScript) return
    
    const scanResult = securityScanner.scanLua(currentScript.code)
    setSecurityScanResult(scanResult)
    setShowSecurityDialog(true)
    
    if (scanResult.safe) {
      toast.success('No security issues detected')
    } else {
      toast.warning(`${scanResult.issues.length} security issue(s) detected`)
    }
  }

  const handleProceedWithExecution = () => {
    setShowSecurityDialog(false)
    if (!currentScript) return

    setIsExecuting(true)
    setTestOutput(null)

    setTimeout(async () => {
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
    }, 100)
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

  const handleInsertSnippet = (code: string) => {
    if (!currentScript) return
    
    if (editorRef.current) {
      const selection = editorRef.current.getSelection()
      if (selection) {
        editorRef.current.executeEdits('', [{
          range: selection,
          text: code,
          forceMoveMarkers: true
        }])
        editorRef.current.focus()
      } else {
        const currentCode = currentScript.code
        const newCode = currentCode ? currentCode + '\n\n' + code : code
        handleUpdateScript({ code: newCode })
      }
    } else {
      const currentCode = currentScript.code
      const newCode = currentCode ? currentCode + '\n\n' + code : code
      handleUpdateScript({ code: newCode })
    }
    
    setShowSnippetLibrary(false)
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleScanCode}>
                    <ShieldCheck className="mr-2" size={16} />
                    Security Scan
                  </Button>
                  <Button onClick={handleTestScript} disabled={isExecuting}>
                    <Play className="mr-2" size={16} />
                    {isExecuting ? 'Executing...' : 'Test Script'}
                  </Button>
                </div>
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
                  <div className="flex gap-2">
                    <Sheet open={showSnippetLibrary} onOpenChange={setShowSnippetLibrary}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          <BookOpen size={16} className="mr-2" />
                          Snippet Library
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Lua Snippet Library</SheetTitle>
                          <SheetDescription>
                            Browse and insert pre-built code templates
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <LuaSnippetLibrary onInsertSnippet={handleInsertSnippet} />
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Select
                      onValueChange={(value) => {
                        const exampleCode = getLuaExampleCode(value as any)
                        handleUpdateScript({ code: exampleCode })
                        toast.success('Example loaded')
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <FileCode size={16} className="mr-2" />
                        <SelectValue placeholder="Examples" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      <ArrowsOut size={16} />
                    </Button>
                  </div>
                </div>
                <div className={`border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-background' : ''}`}>
                  <Editor
                    height={isFullscreen ? 'calc(100vh - 8rem)' : '400px'}
                    language="lua"
                    value={currentScript.code}
                    onChange={(value) => handleUpdateScript({ code: value || '' })}
                    onMount={(editor) => {
                      editorRef.current = editor
                    }}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: isFullscreen },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      snippetSuggestions: 'inline',
                      parameterHints: { enabled: true },
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Write Lua code. Access parameters via <code className="font-mono">context.data</code>. Use <code className="font-mono">log()</code> or <code className="font-mono">print()</code> for output. Press <code className="font-mono">Ctrl+Space</code> for autocomplete.
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

      {securityScanResult && (
        <SecurityWarningDialog
          open={showSecurityDialog}
          onOpenChange={setShowSecurityDialog}
          scanResult={securityScanResult}
          onProceed={handleProceedWithExecution}
          onCancel={() => setShowSecurityDialog(false)}
          codeType="Lua script"
          showProceedButton={true}
        />
      )}
    </div>
  )
}
