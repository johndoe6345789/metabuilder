import { describe, expect, it, vi } from 'vitest'

import { useSelectedClass } from './use-selected-class'

const classes = [
  { id: 'c1', name: 'card', props: {} },
  { id: 'c2', name: 'heading', props: {} },
]

describe('useSelectedClass', () => {
  it('picks the class matching the selected id', () => {
    const { selected } = useSelectedClass({
      classes,
      selectedId: 'c2',
      newName: '',
      onCreate: vi.fn(),
      onSelect: vi.fn(),
      onNewNameChange: vi.fn(),
    })
    expect(selected?.id).toBe('c2')
  })

  it('falls back to the first class when nothing is selected', () => {
    const { selected } = useSelectedClass({
      classes,
      selectedId: null,
      newName: '',
      onCreate: vi.fn(),
      onSelect: vi.fn(),
      onNewNameChange: vi.fn(),
    })
    expect(selected?.id).toBe('c1')
  })

  it('is undefined when there are no classes at all', () => {
    const { selected } = useSelectedClass({
      classes: [],
      selectedId: null,
      newName: '',
      onCreate: vi.fn(),
      onSelect: vi.fn(),
      onNewNameChange: vi.fn(),
    })
    expect(selected).toBeUndefined()
  })

  it('does nothing when the new name is blank', () => {
    const onCreate = vi.fn()
    const { addClass } = useSelectedClass({
      classes,
      selectedId: null,
      newName: '   ',
      onCreate,
      onSelect: vi.fn(),
      onNewNameChange: vi.fn(),
    })
    addClass()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('creates, selects, and clears the field for a real name', () => {
    const onCreate = vi.fn(() => 'new-id')
    const onSelect = vi.fn()
    const onNewNameChange = vi.fn()
    const { addClass } = useSelectedClass({
      classes,
      selectedId: null,
      newName: 'Big Heading',
      onCreate,
      onSelect,
      onNewNameChange,
    })
    addClass()
    expect(onCreate).toHaveBeenCalledWith('big-heading')
    expect(onSelect).toHaveBeenCalledWith('new-id')
    expect(onNewNameChange).toHaveBeenCalledWith('')
  })
})
