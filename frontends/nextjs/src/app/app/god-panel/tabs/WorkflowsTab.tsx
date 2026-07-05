'use client'

import { Button } from '@/m3'
import { WorkflowEditor } from './workflow/WorkflowEditor'
import { useGodWorkflow } from './workflow/use-god-workflow'
import s from './WorkflowsTab.module.scss'

export function WorkflowsTab() {
  const { workflow, save, dirty, publish, publishing } = useGodWorkflow()

  return (
    <>
      <div className={s.publishBar}>
        {dirty ? <span className={s.dot} /> : null}
        <span className={`${s.status} ${dirty ? '' : s.clean}`}>
          {dirty ? 'Staged changes — not yet published' : 'Published — up to date'}
        </span>
        <span className={s.spacer} />
        <Button
          variant="contained"
          size="small"
          disabled={!dirty || publishing}
          onClick={() => { void publish() }}
        >
          {publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>

      <WorkflowEditor workflow={workflow} onChange={save} onSave={save} />
    </>
  )
}
