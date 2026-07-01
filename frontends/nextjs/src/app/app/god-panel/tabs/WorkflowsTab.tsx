'use client'

import { Suspense } from 'react'
import { Typography, Paper, Divider } from '@/m3'
import s from './WorkflowsTab.module.scss'

const WorkflowBuilderLazy =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/components/workflow/WorkflowBuilder').WorkflowBuilder
    : null

const SAMPLE_WORKFLOW = {
  id: 'wf_sample',
  name: 'Sample Workflow',
  version: '2.2.0',
  nodes: [
    {
      id: 'trigger',
      name: 'Trigger',
      nodeType: 'trigger',
      position: [50, 100],
      parameters: {},
      description: 'Workflow entry point',
    },
    {
      id: 'process',
      name: 'Process',
      nodeType: 'function',
      position: [300, 100],
      parameters: {},
      description: 'Process data',
    },
    {
      id: 'output',
      name: 'Output',
      nodeType: 'output',
      position: [550, 100],
      parameters: {},
      description: 'Return result',
    },
  ],
  connections: {
    trigger: {
      default: { '0': [{ node: 'process', port: 'input', index: 0 }] },
    },
    process: {
      default: { '0': [{ node: 'output', port: 'input', index: 0 }] },
    },
  },
  variables: {},
  settings: {
    debugMode: false,
    maxConcurrentExecutions: 1,
    executionTimeout: 30000,
  },
}

export function WorkflowsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Workflow Builder</Typography>
      <Typography variant="body2" color="text.secondary">
        Visual DAG workflow editor. Define workflows in JSON 2.2.0 format.
      </Typography>

      {WorkflowBuilderLazy != null ? (
        <Suspense
          fallback={
            <Typography variant="body2">Loading workflow editor...</Typography>
          }
        >
          <Paper className={s.editorFrame}>
            <WorkflowBuilderLazy
              workflow={SAMPLE_WORKFLOW}
              tenant="system"
              readOnly={false}
            />
          </Paper>
        </Suspense>
      ) : (
        <Paper className={s.placeholder}>
          <Typography variant="body1" color="text.secondary">
            Workflow editor available at
            /components/workflow/WorkflowBuilder.tsx
          </Typography>
          <Divider />
          <Typography variant="body2" color="text.secondary">
            Workflows are defined in dbal/shared/api/schema/workflows/ as JSON.
          </Typography>
        </Paper>
      )}
    </div>
  )
}
