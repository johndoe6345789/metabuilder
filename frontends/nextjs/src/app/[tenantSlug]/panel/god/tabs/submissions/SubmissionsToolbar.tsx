'use client'

import { Button, Chip, Select } from '@/m3'
import s from './SubmissionsTab.module.scss'

export interface SubmissionsToolbarProps {
  forms: string[]
  form: string
  onForm: (value: string) => void
  showHandled: boolean
  onShowHandled: (value: boolean) => void
  waiting: number
  canExport: boolean
  onExport: () => void
  onRefresh: () => void
}

/** Which messages to show, and the two things to do with the set. */
export function SubmissionsToolbar(props: SubmissionsToolbarProps) {
  return (
    <div className={s.toolbar}>
      <Select
        native
        value={props.form}
        inputProps={{ 'aria-label': 'Form' }}
        onChange={
          ((event: React.ChangeEvent<HTMLSelectElement>) => {
            props.onForm(event.target.value)
          }) as never
        }
      >
        <option value="">Every form</option>
        {props.forms.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>

      <Chip
        label={props.showHandled ? 'Showing handled' : 'Hiding handled'}
        size="small"
        variant={props.showHandled ? 'filled' : 'outlined'}
        onClick={() => {
          props.onShowHandled(!props.showHandled)
        }}
      />
      <Chip label={`${props.waiting} waiting`} size="small" />

      <span className={s.spacer} />

      <Button variant="text" size="small" onClick={props.onRefresh}>
        Refresh
      </Button>
      <Button
        variant="outlined"
        size="small"
        disabled={!props.canExport}
        onClick={props.onExport}
      >
        Export CSV
      </Button>
    </div>
  )
}
