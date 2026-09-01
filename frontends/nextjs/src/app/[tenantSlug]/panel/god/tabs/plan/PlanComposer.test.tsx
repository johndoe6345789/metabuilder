import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PlanComposer } from './PlanComposer'
import type { ColumnDef } from './plan-types'

const column: ColumnDef = {
  status: 'todo',
  label: 'To Do',
  hint: 'Not started',
}

describe('PlanComposer', () => {
  it('labels the field with the column name', () => {
    render(
      <PlanComposer column={column} draft="" onSetDraft={vi.fn()} onAdd={vi.fn()} />
    )
    expect(screen.getByLabelText('Add to To Do')).toBeTruthy()
  })

  it('reports draft edits scoped to this column', () => {
    const onSetDraft = vi.fn()
    render(
      <PlanComposer
        column={column}
        draft=""
        onSetDraft={onSetDraft}
        onAdd={vi.fn()}
      />
    )
    fireEvent.change(screen.getByLabelText('Add to To Do'), {
      target: { value: 'New task' },
    })
    expect(onSetDraft).toHaveBeenCalledWith('todo', 'New task')
  })

  it('adds on Enter', () => {
    const onAdd = vi.fn()
    render(
      <PlanComposer column={column} draft="New task" onSetDraft={vi.fn()} onAdd={onAdd} />
    )
    fireEvent.keyDown(screen.getByLabelText('Add to To Do'), { key: 'Enter' })
    expect(onAdd).toHaveBeenCalledWith('todo')
  })

  it('ignores other keys', () => {
    const onAdd = vi.fn()
    render(
      <PlanComposer column={column} draft="New task" onSetDraft={vi.fn()} onAdd={onAdd} />
    )
    fireEvent.keyDown(screen.getByLabelText('Add to To Do'), { key: 'Escape' })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('adds from the Add card button', () => {
    const onAdd = vi.fn()
    render(
      <PlanComposer column={column} draft="New task" onSetDraft={vi.fn()} onAdd={onAdd} />
    )
    fireEvent.click(screen.getByText('Add card'))
    expect(onAdd).toHaveBeenCalledWith('todo')
  })
})
