import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, Lightning, Code, GitBranch, ArrowRight, Play, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { createWorkflowEngine, type WorkflowExecutionResult as WFExecResult } from '@/lib/workflow-engine'
import type { Workflow, WorkflowNode, WorkflowEdge, LuaScript } from '@/lib/level-types'

interface WorkflowEditorProps {
  workflows: Workflow[]
  onWorkflowsChange: (workflows: Workflow[]) => void
  scripts?: LuaScript[]
}

export function WorkflowEditor({ workflows, onWorkflowsChange, scripts = [] }: WorkflowEditorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(
    workflows.length > 0 ? workflows[0].id : null
  )
  const [testData, setTestData] = useState<string>('{"example": "data"}')
  const [testOutput, setTestOutput] = useState<WFExecResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const currentWorkflow = workflows.find(w => w.id === selectedWorkflow)

  const handleAddWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      nodes: [],
      edges: [],
      enabled: true,
    }
    onWorkflowsChange([...workflows, newWorkflow])
    setSelectedWorkflow(newWorkflow.id)
    toast.success('Workflow created')
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    onWorkflowsChange(workflows.filter(w => w.id !== workflowId))
    if (selectedWorkflow === workflowId) {
      setSelectedWorkflow(workflows.length > 1 ? workflows[0].id : null)
    }
    toast.success('Workflow deleted')
  }

  const handleUpdateWorkflow = (updates: Partial<Workflow>) => {
    if (!currentWorkflow) return
    
    onWorkflowsChange(
      workflows.map(w => w.id === selectedWorkflow ? { ...w, ...updates } : w)
    )
  }

  const handleAddNode = (type: WorkflowNode['type']) => {
    if (!currentWorkflow) return

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      config: {},
      position: { x: 100, y: currentWorkflow.nodes.length * 100 + 100 },
    }

    handleUpdateWorkflow({
      nodes: [...currentWorkflow.nodes, newNode],
    })
    toast.success('Node added')
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return

    handleUpdateWorkflow({
      nodes: currentWorkflow.nodes.filter(n => n.id !== nodeId),
      edges: currentWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    })
    toast.success('Node deleted')
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!currentWorkflow) return

    handleUpdateWorkflow({
      nodes: currentWorkflow.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
    })
  }

  const handleTestWorkflow = async () => {
    if (!currentWorkflow) return

    setIsExecuting(true)
    setTestOutput(null)

    try {
      let parsedData: any
      try {
        parsedData = JSON.parse(testData)
      } catch {
        parsedData = testData
      }

      const engine = createWorkflowEngine()
      const result = await engine.executeWorkflow(currentWorkflow, {
        data: parsedData,
        user: { username: 'test_user', role: 'god' },
        scripts,
      })

      setTestOutput(result)

      if (result.success) {
        toast.success('Workflow executed successfully')
      } else {
        toast.error('Workflow execution failed')
      }
    } catch (error) {
      toast.error('Execution error: ' + (error instanceof Error ? error.message : String(error)))
      setTestOutput({
        success: false,
        outputs: {},
        logs: [],
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger':
        return <Lightning size={16} />
      case 'action':
        return <ArrowRight size={16} />
      case 'condition':
        return <GitBranch size={16} />
      case 'lua':
        return <Code size={16} />
      case 'transform':
        return <ArrowRight size={16} />
      default:
        return <ArrowRight size={16} />
    }
  }

  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger':
        return 'bg-green-500'
      case 'action':
        return 'bg-blue-500'
      case 'condition':
        return 'bg-yellow-500'
      case 'lua':
        return 'bg-purple-500'
      case 'transform':
        return 'bg-cyan-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflows</CardTitle>
            <Button size="sm" onClick={handleAddWorkflow}>
              <Plus size={16} />
            </Button>
          </div>
          <CardDescription>Automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workflows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No workflows yet. Create one to start.
              </p>
            ) : (
              workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWorkflow === workflow.id
                      ? 'bg-accent border-accent-foreground'
                      : 'hover:bg-muted border-border'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{workflow.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {workflow.nodes.length} nodes
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.enabled ? 'default' : 'secondary'} className="text-xs">
                      {workflow.enabled ? 'On' : 'Off'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteWorkflow(workflow.id)
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        {!currentWorkflow ? (
          <CardContent className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select or create a workflow to edit</p>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Workflow: {currentWorkflow.name}</CardTitle>
                  <CardDescription>Configure workflow nodes and connections</CardDescription>
                </div>
                <Button onClick={handleTestWorkflow} disabled={isExecuting}>
                  <Play className="mr-2" size={16} />
                  {isExecuting ? 'Running...' : 'Test Workflow'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input
                    value={currentWorkflow.name}
                    onChange={(e) => handleUpdateWorkflow({ name: e.target.value })}
                    placeholder="My Workflow"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={currentWorkflow.description || ''}
                    onChange={(e) => handleUpdateWorkflow({ description: e.target.value })}
                    placeholder="What this workflow does..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Nodes</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAddNode('trigger')}>
                      <Lightning className="mr-2" size={14} />
                      Trigger
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddNode('action')}>
                      <ArrowRight className="mr-2" size={14} />
                      Action
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddNode('condition')}>
                      <GitBranch className="mr-2" size={14} />
                      Condition
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddNode('lua')}>
                      <Code className="mr-2" size={14} />
                      Lua
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentWorkflow.nodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                      No nodes yet. Add nodes to build your workflow.
                    </p>
                  ) : (
                    currentWorkflow.nodes.map((node, index) => (
                      <Card key={node.id} className="border-2">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg ${getNodeColor(node.type)} flex items-center justify-center text-white shrink-0`}>
                              {getNodeIcon(node.type)}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-xs">Node Label</Label>
                                  <Input
                                    value={node.label}
                                    onChange={(e) =>
                                      handleUpdateNode(node.id, { label: e.target.value })
                                    }
                                    placeholder="Node name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Node Type</Label>
                                  <Select
                                    value={node.type}
                                    onValueChange={(value) =>
                                      handleUpdateNode(node.id, { type: value as WorkflowNode['type'] })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="trigger">Trigger</SelectItem>
                                      <SelectItem value="action">Action</SelectItem>
                                      <SelectItem value="condition">Condition</SelectItem>
                                      <SelectItem value="lua">Lua Script</SelectItem>
                                      <SelectItem value="transform">Transform</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {node.type === 'lua' && scripts.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-xs">Lua Script</Label>
                                  <Select
                                    value={node.config.scriptId || ''}
                                    onValueChange={(value) =>
                                      handleUpdateNode(node.id, { 
                                        config: { ...node.config, scriptId: value }
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a script" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {scripts.map((script) => (
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
                                    onChange={(e) =>
                                      handleUpdateNode(node.id, { 
                                        config: { ...node.config, condition: e.target.value }
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
                                    onChange={(e) =>
                                      handleUpdateNode(node.id, { 
                                        config: { ...node.config, transform: e.target.value }
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
                                {index < currentWorkflow.nodes.length - 1 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ArrowRight size={12} />
                                    <span>Next</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNode(node.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {currentWorkflow.nodes.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Test Input Data (JSON)</Label>
                    <Textarea
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      className="font-mono text-sm min-h-[100px]"
                      placeholder='{"example": "data"}'
                    />
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
                            {testOutput.success ? 'Workflow Execution Successful' : 'Workflow Execution Failed'}
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
                            <Label className="text-xs mb-1">Execution Logs</Label>
                            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded max-h-[200px] overflow-y-auto">
                              {testOutput.logs.join('\n')}
                            </pre>
                          </div>
                        )}
                        
                        {Object.keys(testOutput.outputs).length > 0 && (
                          <div>
                            <Label className="text-xs mb-1">Node Outputs</Label>
                            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded max-h-[200px] overflow-y-auto">
                              {JSON.stringify(testOutput.outputs, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lightning size={16} />
                      <span>Workflow execution: {currentWorkflow.nodes.map(n => n.label).join(' → ')}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
