import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClassListPanel } from './ClassListPanel'

const classes = [
  { id: 'c1', name: 'card', props: {} },
  { id: 'c2', name: 'heading', props: {} },
]

describe('ClassListPanel', () => {
  it('lists every class by name', () => {
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName=""
        onNewNameChange={vi.fn()}
        onAdd={vi.fn()}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.getByText('card')).toBeTruthy()
    expect(screen.getByText('heading')).toBeTruthy()
  })

  it('selects a class on click', () => {
    const onSelect = vi.fn()
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName=""
        onNewNameChange={vi.fn()}
        onAdd={vi.fn()}
        onSelect={onSelect}
        onRemove={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('heading'))
    expect(onSelect).toHaveBeenCalledWith('c2')
  })

  it('removes a class without selecting it', () => {
    const onSelect = vi.fn()
    const onRemove = vi.fn()
    render(
      <ClassListPanel
        classes={classes}
        selectedId="c1"
        newName=""
        onNewNameChange={vi.fn()}
        onAdd={vi.fn()}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    )
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(onRemove).toHaveBeenCalledWith('c1')
    expect(onSelect).not.toHaveBeenCalled()
  })
})
