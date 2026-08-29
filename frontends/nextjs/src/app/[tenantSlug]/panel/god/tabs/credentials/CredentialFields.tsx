'use client'

import { TextField } from '@/m3'

export interface CredentialFieldsProps {
  username: string
  password: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
}

/** The two things a credential is: a name and a secret. */
export function CredentialFields(props: CredentialFieldsProps) {
  return (
    <>
        <TextField
          label="Username"
          value={props.username}
          onChange={event => {
            props.onUsernameChange(event.target.value)
          }}
          fullWidth
          size="small"
          placeholder="service-user"
        />
        <TextField
          label="Temporary password"
          type="password"
          value={props.password}
          onChange={event => {
            props.onPasswordChange(event.target.value)
          }}
          fullWidth
          size="small"
          placeholder="At least 8 characters"
        />
    </>
  )
}
