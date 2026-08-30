import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClassListPanel } from './ClassListPanel'

const classes = [{ id: 'c1', name: 'card', props: {} }]

describe('ClassListPanel add flow', () => {
  it('adds a class on Enter in the new-style field', () => {
    const onAdd = vi.fn()
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName="fresh"
        onNewNameChange={vi.fn()}
        onAdd={onAdd}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    fireEvent.keyDown(screen.getByLabelText('New style'), { key: 'Enter' })
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('adds a class via the + button', () => {
    const onAdd = vi.fn()
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName="fresh"
        onNewNameChange={vi.fn()}
        onAdd={onAdd}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('+'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('reports each keystroke in the new-style field', () => {
    const onNewNameChange = vi.fn()
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName=""
        onNewNameChange={onNewNameChange}
        onAdd={vi.fn()}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    fireEvent.change(screen.getByLabelText('New style'), {
      target: { value: 'x' },
    })
    expect(onNewNameChange).toHaveBeenCalledWith('x')
  })
})
