import { PlayArrow as PlayIcon } from '@mui/icons-material'
import { Card, CardContent, CardHeader } from '@mui/material'

import { CardDescription, CardTitle } from '@/components/ui'

import { createActionHandlers } from './editor/createActionHandlers'
import type { WorkflowEditorProps } from './editor/types'
import { useWorkflowState } from './editor/useWorkflowState'
import { WorkflowDetailsPanel } from './editor/WorkflowDetailsPanel'
import { WorkflowNodesPanel } from './editor/WorkflowNodesPanel'
import { WorkflowSidebar } from './editor/WorkflowSidebar'
import { WorkflowTester } from './editor/WorkflowTester'

export function WorkflowEditor({
  workflows,
  onWorkflowsChange,
  scripts = [],
}: WorkflowEditorProps) {
  const state = useWorkflowState(workflows)
  const {
    currentWorkflow,
    selectedWorkflowId,
    setSelectedWorkflowId,
    testData,
    setTestData,
    testOutput,
    setTestOutput,
    isExecuting,
    setIsExecuting,
  } = state

  const {
    handleAddWorkflow,
    handleDeleteWorkflow,
    handleUpdateWorkflow,
    handleAddNode,
    handleDeleteNode,
    handleUpdateNode,
    handleTestWorkflow,
  } = createActionHandlers({
    workflows,
    currentWorkflow,
    onWorkflowsChange,
    setSelectedWorkflowId,
    setTestOutput,
    setIsExecuting,
    scripts,
    testData,
  })

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <WorkflowSidebar
        workflows={workflows}
        selectedWorkflowId={selectedWorkflowId}
        onSelectWorkflow={setSelectedWorkflowId}
        onAddWorkflow={handleAddWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
      />

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
                <button
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  onClick={handleTestWorkflow}
                  disabled={isExecuting}
                >
                  <PlayIcon sx={{ fontSize: 16 }} />
                  {isExecuting ? 'Running...' : 'Test Workflow'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <WorkflowDetailsPanel workflow={currentWorkflow} onUpdate={handleUpdateWorkflow} />

              <WorkflowNodesPanel
                workflow={currentWorkflow}
                scripts={scripts}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
                onUpdateNode={handleUpdateNode}
              />

              {currentWorkflow.nodes.length > 0 && (
                <WorkflowTester
                  workflow={currentWorkflow}
                  testData={testData}
                  testOutput={testOutput}
                  onTestDataChange={setTestData}
                />
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
