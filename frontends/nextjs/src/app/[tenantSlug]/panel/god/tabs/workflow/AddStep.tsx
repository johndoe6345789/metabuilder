'use client'

import { useState } from 'react'
import type { NodeType } from '@/workflow-editor'

import { RUNNABLE_STEPS } from './runnable-steps'
import s from './WorkflowEditor.module.scss'

/**
 * Add a step without dragging one.
 *
 * The palette is drag-only: its PaletteNode takes an onDragStart and
 * nothing else, and it lives in a separate repo this one only mounts. So
 * a workflow could not be built at all without a mouse -- a drag being the
 * single gesture hardest to offer any other way -- and could not be
 * exercised by anything that does not synthesise HTML5 drag events.
 *
 * Dragging still works and still decides where a node lands; this just
 * means it is not the only way in.
 */
export function AddStep({ onAdd }: { onAdd: (nt: NodeType) => void }) {
  const [choice, setChoice] = useState(RUNNABLE_STEPS[0]?.id ?? '')

  return (
    <div className={s.addStep}>
      <label className={s.addStepLabel} htmlFor="add-step">
        Add a step
      </label>
      <select
        id="add-step"
        className={s.addStepSelect}
        value={choice}
        onChange={e => {
          setChoice(e.target.value)
        }}
      >
        {RUNNABLE_STEPS.map(step => (
          <option key={step.id} value={step.id}>
            {step.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={s.addStepButton}
        onClick={() => {
          const step = RUNNABLE_STEPS.find(x => x.id === choice)
          if (step !== undefined) onAdd(step)
        }}
      >
        Add
      </button>
    </div>
  )
}
