import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CardDetails } from './CardDetails'
import type { Task } from './plan-types'

const task: Task = {
  id: 't1',
  title: 'Ship it',
  status: 'todo',
}

describe('CardDetails', () => {
  it('calls onClose from the close button', () => {
    const onClose = vi.fn()
    render(<CardDetails task={task} onClose={onClose} onChange={vi.fn()} />)
    screen.getByLabelText('Close details').click()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('reports a title edit', () => {
    const onChange = vi.fn()
    render(<CardDetails task={task} onClose={vi.fn()} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New title' },
    })
    expect(onChange).toHaveBeenCalledWith({ title: 'New title' })
  })

  it('reports a description edit, defaulting to empty when unset', () => {
    const onChange = vi.fn()
    render(<CardDetails task={task} onClose={vi.fn()} onChange={onChange} />)
    expect(screen.getByLabelText('Description')).toHaveProperty('value', '')
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Details' },
    })
    expect(onChange).toHaveBeenCalledWith({ description: 'Details' })
  })

  it('reports a status change', () => {
    const onChange = vi.fn()
    render(<CardDetails task={task} onClose={vi.fn()} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'done' },
    })
    expect(onChange).toHaveBeenCalledWith({ status: 'done' })
  })

  it('defaults priority to medium and reports a change', () => {
    const onChange = vi.fn()
    render(<CardDetails task={task} onClose={vi.fn()} onChange={onChange} />)
    expect(screen.getByLabelText('Priority')).toHaveProperty('value', 'medium')
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'high' },
    })
    expect(onChange).toHaveBeenCalledWith({ priority: 'high' })
  })

  it('joins existing labels with commas and parses edits back into a list', () => {
    const onChange = vi.fn()
    render(
      <CardDetails
        task={{ ...task, labels: ['bug', 'urgent'] }}
        onClose={vi.fn()}
        onChange={onChange}
      />
    )
    expect(screen.getByLabelText('Labels')).toHaveProperty(
      'value',
      'bug, urgent'
    )
    fireEvent.change(screen.getByLabelText('Labels'), {
      target: { value: 'a,  b ,,c' },
    })
    expect(onChange).toHaveBeenCalledWith({ labels: ['a', 'b', 'c'] })
  })
})
