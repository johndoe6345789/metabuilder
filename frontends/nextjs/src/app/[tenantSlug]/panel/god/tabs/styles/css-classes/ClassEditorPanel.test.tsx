import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClassEditorPanel } from './ClassEditorPanel'

const selected = { id: 'c1', name: 'card', props: { color: 'red' } }

describe('ClassEditorPanel', () => {
  it('prompts to name a style when none is selected', () => {
    render(
      <ClassEditorPanel
        selected={undefined}
        onRename={vi.fn()}
        onSetProp={vi.fn()}
        onClearProp={vi.fn()}
      />
    )
    expect(screen.getByText(/Name a style above to start/)).toBeTruthy()
  })

  it('shows the selected style name', () => {
    render(
      <ClassEditorPanel
        selected={selected}
        onRename={vi.fn()}
        onSetProp={vi.fn()}
        onClearProp={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('card')).toBeTruthy()
  })

  it('renames as typed', () => {
    const onRename = vi.fn()
    render(
      <ClassEditorPanel
        selected={selected}
        onRename={onRename}
        onSetProp={vi.fn()}
        onClearProp={vi.fn()}
      />
    )
    fireEvent.change(screen.getByDisplayValue('card'), {
      target: { value: 'Big Card' },
    })
    expect(onRename).toHaveBeenCalledWith('c1', 'Big Card')
  })

  it('normalizes the name to a class name on blur', () => {
    // Mirrors the real flow: typing commits the raw name to the parent
    // (a controlled field reverts otherwise), which re-renders with it
    // before the field is ever blurred.
    const onRename = vi.fn()
    const { rerender } = render(
      <ClassEditorPanel
        selected={selected}
        onRename={onRename}
        onSetProp={vi.fn()}
        onClearProp={vi.fn()}
      />
    )
    rerender(
      <ClassEditorPanel
        selected={{ ...selected, name: 'Big Card' }}
        onRename={onRename}
        onSetProp={vi.fn()}
        onClearProp={vi.fn()}
      />
    )
    fireEvent.blur(screen.getByDisplayValue('Big Card'))
    expect(onRename).toHaveBeenLastCalledWith('c1', 'big-card')
  })
})
