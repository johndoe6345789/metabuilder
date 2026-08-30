'use client'

import { TextField, Typography } from '@/m3'
import { StyleVisualEditor } from '../StyleVisualEditor'
import { toClassName } from '../style-controls'
import type { CssClass } from '../use-css-classes'
import s from '../CssClassesTab.module.scss'

export interface ClassEditorPanelProps {
  selected: CssClass | undefined
  onRename: (id: string, name: string) => void
  onSetProp: (id: string, prop: string, value: string) => void
  onClearProp: (id: string, prop: string) => void
}

export function ClassEditorPanel({
  selected,
  onRename,
  onSetProp,
  onClearProp,
}: ClassEditorPanelProps) {
  if (selected === undefined) {
    return (
      <section className={s.editor}>
        <Typography variant="body2" color="text.secondary">
          Name a style above to start. A style is a look you can reuse —
          give it a name, set how it should look, then apply it to any
          component in the builder.
        </Typography>
      </section>
    )
  }

  return (
    <section className={s.editor}>
      <TextField
        size="small"
        fullWidth
        label="Style name"
        value={selected.name}
        helperText={`Applied to a component as "${selected.name}"`}
        onChange={e => {
          onRename(selected.id, e.target.value)
        }}
        onBlur={e => {
          // Tidied on the way out rather than as they type, so the field
          // does not fight the person using it.
          onRename(selected.id, toClassName(e.target.value))
        }}
      />

      <StyleVisualEditor
        props={selected.props}
        onSet={(prop, value) => {
          onSetProp(selected.id, prop, value)
        }}
        onClear={prop => {
          onClearProp(selected.id, prop)
        }}
      />
    </section>
  )
}
