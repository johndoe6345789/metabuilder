'use client'

import { WorkflowEditor } from './workflow/WorkflowEditor'
import { useGodWorkflow } from './workflow/use-god-workflow'

export function WorkflowsTab() {
  const { workflow, save } = useGodWorkflow()

  return (
    <WorkflowEditor
      workflow={workflow}
      onChange={save}
      onSave={save}
    />
  )
}
