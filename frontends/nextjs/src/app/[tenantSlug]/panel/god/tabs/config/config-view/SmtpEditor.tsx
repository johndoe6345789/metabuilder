'use client'

import { Button, TextField, Typography } from '@/m3'
import type { SmtpConfig } from '../use-smtp-config'
import { SMTP_FIELDS } from './smtp-fields'
import s from '../ConfigTab.module.scss'

export interface SmtpEditorProps {
  config: SmtpConfig
  dirty: boolean
  publishing: boolean
  onChange: <K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => void
  onPublish: () => void
}

/** Outbound email settings: host/port/credentials, and a publish button. */
export function SmtpEditor(props: SmtpEditorProps) {
  return (
    <div className={s.smtpSection}>
      <div className={s.smtpHead}>
        <Typography variant="h6">Email (SMTP)</Typography>
        <span className={s.spacer} />
        {props.dirty && <span className={s.dot} />}
        <Button
          variant="contained"
          size="small"
          disabled={!props.dirty || props.publishing}
          onClick={props.onPublish}
        >
          {props.publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>
      <div className={s.smtpGrid}>
        <TextField
          size="small"
          label="Port"
          value={String(props.config.port)}
          onChange={e => {
            props.onChange('port', Number(e.target.value) || 0)
          }}
        />
        {SMTP_FIELDS.map(field => (
          <TextField
            key={field.key}
            size="small"
            type={field.type}
            label={field.label}
            value={props.config[field.key]}
            onChange={e => {
              props.onChange<typeof field.key>(field.key, e.target.value)
            }}
          />
        ))}
      </div>
    </div>
  )
}
