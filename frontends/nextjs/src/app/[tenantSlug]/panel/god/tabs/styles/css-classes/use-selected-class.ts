'use client'

import { toClassName } from '../style-controls'
import type { CssClass } from '../use-css-classes'

interface Args {
  classes: CssClass[]
  selectedId: string | null
  newName: string
  onCreate: (name: string) => string
  onSelect: (id: string) => void
  onNewNameChange: (name: string) => void
}

/** The active class, and the add-a-new-class flow, in one place. */
export function useSelectedClass({
  classes,
  selectedId,
  newName,
  onCreate,
  onSelect,
  onNewNameChange,
}: Args) {
  const selected = classes.find(c => c.id === selectedId) ?? classes[0]

  const addClass = () => {
    if (newName.trim() === '') return
    onSelect(onCreate(toClassName(newName)))
    onNewNameChange('')
  }

  return { selected, addClass }
}
