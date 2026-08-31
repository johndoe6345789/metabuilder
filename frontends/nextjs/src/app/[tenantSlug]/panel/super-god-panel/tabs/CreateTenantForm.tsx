'use client'

import { useState } from 'react'
import { Typography, Paper, Button, TextField } from '@/m3'
import s from './TenantsTab.module.scss'

export interface CreateTenantFormProps {
  onCreate: (name: string) => void
  onCancel: () => void
}

export function CreateTenantForm({
  onCreate,
  onCancel,
}: CreateTenantFormProps) {
  const [name, setName] = useState('')

  const submit = () => {
    if (name.trim() === '') return
    onCreate(name)
    setName('')
  }

  return (
    <Paper>
      <Typography variant="subtitle2" gutterBottom>
        Create New Tenant
      </Typography>
      <div className={s.createRow}>
        <TextField
          label="Tenant Name"
          value={name}
          onChange={e => {
            setName(e.target.value)
          }}
          size="small"
          fullWidth
        />
        <Button variant="outlined" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={submit}>
          Create
        </Button>
      </div>
    </Paper>
  )
}
