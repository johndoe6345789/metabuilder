'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@/m3'
import { COLUMNS, PRIORITIES } from './plan-data'
import type { NewTaskInput, Priority, Status } from './plan-types'
import s from './PlanTab.module.scss'

interface NewCardDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (input: NewTaskInput) => void
}

export function NewCardDialog({ open, onClose, onCreate }: NewCardDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [labels, setLabels] = useState('')

  const submit = () => {
    const cleanTitle = title.trim()
    if (cleanTitle.length === 0) return
    onCreate({
      title: cleanTitle,
      description: description.trim(),
      status,
      priority,
      labels: labels.split(',').map(label => label.trim()).filter(Boolean),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={s.newCardDialog}>
      <DialogTitle className={s.dialogTitle}>
        <span className={`material-symbols-rounded ${s.dialogTitleIcon}`} aria-hidden="true">
          add_task
        </span>
        <span className={s.dialogTitleCopy}>
          <strong>New card</strong>
          <small>Capture the work, then place it on the board.</small>
        </span>
        <button type="button" className={s.dialogClose} onClick={onClose} aria-label="Close dialog">
          <span className="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </DialogTitle>
      <DialogContent dividers className={s.dialogContent}>
        <div className={s.dialogMain}>
          <TextField
            autoFocus
            label="Title"
            value={title}
            onChange={event => { setTitle(event.target.value) }}
            onKeyDown={event => { if (event.key === 'Enter') submit() }}
            className={s.dialogField}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={event => { setDescription(event.target.value) }}
            multiline
            rows={6}
            className={s.dialogField}
            fullWidth
          />
        </div>
        <aside className={s.dialogSide}>
          <span className={s.dialogSideTitle}>Card settings</span>
          <div className={s.choiceGroup}>
            <span>List</span>
            <div className={s.choiceGrid}>
              {COLUMNS.map(column => (
                <button
                  key={column.status}
                  type="button"
                  className={`${s.choice} ${status === column.status ? s.choiceActive : ''}`}
                  onClick={() => { setStatus(column.status) }}
                >
                  <span className={`${s.choiceDot} ${s[column.status]}`} />
                  {column.label}
                </button>
              ))}
            </div>
          </div>
          <div className={s.choiceGroup}>
            <span>Priority</span>
            <div className={s.choiceGrid}>
              {PRIORITIES.map(value => (
                <button
                  key={value}
                  type="button"
                  className={`${s.choice} ${priority === value ? s.choiceActive : ''}`}
                  onClick={() => { setPriority(value) }}
                >
                  <span className={`${s.choiceDot} ${s[value]}`} />
                  {value}
                </button>
              ))}
            </div>
          </div>
          <TextField
            label="Labels"
            helperText="Comma separated"
            value={labels}
            onChange={event => { setLabels(event.target.value) }}
            className={s.dialogField}
            fullWidth
          />
        </aside>
      </DialogContent>
      <DialogActions className={s.dialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={title.trim().length === 0} onClick={submit}>
          Create card
        </Button>
      </DialogActions>
    </Dialog>
  )
}
