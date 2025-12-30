import { CardTitle } from '@/components/ui'
import { Label, Textarea } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/fakemui'
import { CheckCircle, Lightning, XCircle } from '@/fakemui/icons'

import type { WorkflowTesterProps } from './types'

export const WorkflowTester = ({
  workflow,
  testData,
  testOutput,
  onTestDataChange,
}: WorkflowTesterProps) => (
  <>
    <div className="space-y-2">
      <Label>Test Input Data (JSON)</Label>
      <Textarea
        value={testData}
        onChange={e => onTestDataChange(e.target.value)}
        className="font-mono text-sm min-h-[100px]"
        placeholder='{"example": "data"}'
      />
    </div>

    {testOutput && (
      <Card
        className={testOutput.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            {testOutput.success ? (
              <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
            ) : (
              <XCircleIcon sx={{ fontSize: 20, color: 'error.main' }} />
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
        <LightningIcon sx={{ fontSize: 16 }} />
        <span>Workflow execution: {workflow.nodes.map(n => n.label).join(' → ')}</span>
      </div>
    </div>
  </>
)
