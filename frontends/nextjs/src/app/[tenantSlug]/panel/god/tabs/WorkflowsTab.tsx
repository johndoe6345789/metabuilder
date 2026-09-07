'use client'

import { Button } from '@/m3'
import type { Workflow } from '@/workflow-editor'
import { WorkflowEditor } from './workflow/WorkflowEditor'
import { useGodWorkflow } from './workflow/use-god-workflow'
import { WorkflowTrigger } from './workflow/WorkflowTrigger'
import { WorkflowPicker } from './workflow/WorkflowPicker'
import { useFormNames } from './workflow/use-form-names'
import { VersionHistory } from '@/components/version-history/VersionHistory'
import s from './WorkflowsTab.module.scss'

export function WorkflowsTab() {
  const wf = useGodWorkflow()
  const knownForms = useFormNames()
  const { workflow, save, trigger, setTrigger, dirty, publish, publishing } = wf

  return (
    <>
      <div className={s.publishBar}>
        <WorkflowPicker
          entries={wf.entries}
          selectedId={wf.selectedId}
          onSelect={wf.select}
          onAdd={wf.add}
          onRemove={wf.remove}
        />
        <WorkflowTrigger
          value={trigger}
          onChange={setTrigger}
          formName={wf.formName}
          onFormNameChange={wf.setFormName}
          knownForms={knownForms}
        />
        {dirty ? <span className={s.dot} /> : null}
        <span className={`${s.status} ${dirty ? '' : s.clean}`}>
          {wf.error ??
            (dirty
              ? 'Staged changes — not yet published'
              : 'Published — up to date')}
        </span>
        <span className={s.spacer} />
        <VersionHistory<Workflow> storageKey="god.workflow" onRevert={save} />
        <Button
          variant="contained"
          size="small"
          disabled={!dirty || publishing}
          onClick={() => {
            void publish()
          }}
        >
          {publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>

      {/*
        Keyed by the workflow being edited so React remounts the editor
        when the picker changes. useWorkflowEditor seeds its state from
        the prop once, so without this the canvas kept showing the
        previous workflow -- and every edit landed on that one, silently.
      */}
      <WorkflowEditor
        key={wf.selectedId}
        workflow={workflow}
        onChange={save}
        onSave={save}
      />
    </>
  )
}
