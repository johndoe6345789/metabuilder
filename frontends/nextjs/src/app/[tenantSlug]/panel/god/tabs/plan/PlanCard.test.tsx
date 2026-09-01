import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PlanCard } from './PlanCard'
import type { Task } from './plan-types'

const task: Task = { id: 't1', title: 'Ship it', status: 'todo' }

const handlers = () => ({
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDrop: vi.fn(),
  onOpen: vi.fn(),
  onRemove: vi.fn(),
})

describe('PlanCard', () => {
  it('renders the title', () => {
    render(<PlanCard task={task} dragging={false} {...handlers()} />)
    expect(screen.getByText('Ship it')).toBeTruthy()
  })

  it('applies the dragging class only when dragging is true', () => {
    const { rerender } = render(
      <PlanCard task={task} dragging={false} {...handlers()} />
    )
    expect(screen.getByText('Ship it').closest('article')?.className).not
      .toContain('dragging')

    rerender(<PlanCard task={task} dragging {...handlers()} />)
    expect(screen.getByText('Ship it').closest('article')?.className).toContain(
      'dragging'
    )
  })

  it('shows the description only when it is non-empty', () => {
    render(
      <PlanCard
        task={{ ...task, description: 'Details here' }}
        dragging={false}
        {...handlers()}
      />
    )
    expect(screen.getByText('Details here')).toBeTruthy()
  })

  it('hides the description span when it is empty', () => {
    render(
      <PlanCard
        task={{ ...task, description: '' }}
        dragging={false}
        {...handlers()}
      />
    )
    // priority indicator + title only: no description, no labels span.
    expect(screen.getByText('Ship it').parentElement?.children).toHaveLength(2)
  })

  it('renders each label when present', () => {
    render(
      <PlanCard
        task={{ ...task, labels: ['bug', 'urgent'] }}
        dragging={false}
        {...handlers()}
      />
    )
    expect(screen.getByText('bug')).toBeTruthy()
    expect(screen.getByText('urgent')).toBeTruthy()
  })

  it('calls onOpen when the card body is clicked', () => {
    const h = handlers()
    render(<PlanCard task={task} dragging={false} {...h} />)
    fireEvent.click(screen.getByText('Ship it'))
    expect(h.onOpen).toHaveBeenCalledOnce()
  })

  it('calls onRemove from the delete button', () => {
    const h = handlers()
    render(<PlanCard task={task} dragging={false} {...h} />)
    fireEvent.click(screen.getByTitle('Delete card'))
    expect(h.onRemove).toHaveBeenCalledOnce()
  })
})
