'use client'

import { FormField } from './FormField'
import { slugify } from './signup-form'
import s from './page.module.scss'

export interface SignupFieldsProps {
  community: string
  name: string
  email: string
  password: string
  onCommunityChange: (value: string) => void
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
}

/** Community name, the owner's name, email and password. */
export function SignupFields(props: SignupFieldsProps) {
  const hint = props.community.trim().length > 1 && (
    <span className={s.hint}>
      Your URL: metabuilder.app/<strong>{slugify(props.community)}</strong>
    </span>
  )

  return (
    <>
      <FormField
        label="Community name"
        type="text"
        placeholder="Acme Running Club"
        value={props.community}
        onChange={props.onCommunityChange}
        required
        autoFocus
        hint={hint}
      />
      <FormField
        label="Your name"
        type="text"
        placeholder="Alex Smith"
        value={props.name}
        onChange={props.onNameChange}
        required
      />
      <FormField
        label="Email"
        type="email"
        placeholder="alex@example.com"
        value={props.email}
        onChange={props.onEmailChange}
        required
      />
      <FormField
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        value={props.password}
        onChange={props.onPasswordChange}
        required
        minLength={8}
      />
    </>
  )
}
