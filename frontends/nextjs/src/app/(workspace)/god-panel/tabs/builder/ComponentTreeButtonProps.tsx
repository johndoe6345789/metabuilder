'use client'

import { Button, TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  label: string
  href: string
  runWorkflow: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeButtonProps({
  label,
  href,
  runWorkflow,
  onChange,
}: Props) {
  return (
    <div className={s.propCol}>
      <TextField
        size="small"
        fullWidth
        label="Label"
        value={label}
        onChange={event => {
          onChange({ label: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Link URL"
        placeholder="/app/demo-site/contact"
        value={href}
        onChange={event => {
          onChange({ href: event.target.value })
        }}
      />
      <Button
        size="small"
        variant={runWorkflow ? 'contained' : 'outlined'}
        onClick={() => {
          onChange({ runWorkflow: !runWorkflow })
        }}
      >
        {runWorkflow
          ? '✓ Runs workflow on click'
          : '⚡ Wire workflow on click'}
      </Button>
    </div>
  )
}
