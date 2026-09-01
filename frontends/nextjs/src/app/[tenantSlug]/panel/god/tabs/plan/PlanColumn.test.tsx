import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PlanColumn } from './PlanColumn'
import type { ColumnDef, Task } from './plan-types'

const column: ColumnDef = { status: 'todo', label: 'To Do', hint: 'Not started' }
const task: Task = { id: 't1', title: 'Ship it', status: 'todo' }

const handlers = () => ({
  onSetDraft: vi.fn(),
  onAdd: vi.fn(),
  onDropColumn: vi.fn(),
  onDropCard: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onOpen: vi.fn(),
  onRemove: vi.fn(),
})

describe('PlanColumn', () => {
  it('shows the column label, hint, and task count', () => {
    render(
      <PlanColumn
        column={column}
        tasks={[task]}
        draft=""
        dragId={null}
        {...handlers()}
      />
    )
    expect(screen.getByText('To Do')).toBeTruthy()
    expect(screen.getByText('Not started')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('renders a card per task', () => {
    render(
      <PlanColumn
        column={column}
        tasks={[task, { ...task, id: 't2', title: 'Second' }]}
        draft=""
        dragId={null}
        {...handlers()}
      />
    )
    expect(screen.getByText('Ship it')).toBeTruthy()
    expect(screen.getByText('Second')).toBeTruthy()
  })

  it('calls onOpen for the clicked card', () => {
    const h = handlers()
    render(
      <PlanColumn column={column} tasks={[task]} draft="" dragId={null} {...h} />
    )
    fireEvent.click(screen.getByText('Ship it'))
    expect(h.onOpen).toHaveBeenCalledWith('t1')
  })

  it('calls onRemove for the right task', () => {
    const h = handlers()
    render(
      <PlanColumn column={column} tasks={[task]} draft="" dragId={null} {...h} />
    )
    fireEvent.click(screen.getByTitle('Delete card'))
    expect(h.onRemove).toHaveBeenCalledWith('t1')
  })

  it('marks the dragged card as dragging by id', () => {
    render(
      <PlanColumn column={column} tasks={[task]} draft="" dragId="t1" {...handlers()} />
    )
    expect(screen.getByText('Ship it').closest('article')?.className).toContain(
      'dragging'
    )
  })
})
