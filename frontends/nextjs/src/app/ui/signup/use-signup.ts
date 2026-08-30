'use client'

import { useState } from 'react'
import { canSubmit, communityNameError, type TierId } from './signup-form'
import { submitSignup } from './register-request'

/** The signup form's fields, submission, and everything it reports back. */
export function useSignup() {
  const [community, setCommunity] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tier, setTier] = useState<TierId>('creator')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fields = { community, name, email, password, tier }

  const submit = async (): Promise<void> => {
    setError('')
    const nameError = communityNameError(community)
    if (nameError !== null) {
      setError(nameError)
      return
    }
    setLoading(true)
    const failure = await submitSignup(fields)
    if (failure !== null) setError(failure)
    setLoading(false)
  }

  return {
    community,
    setCommunity,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    tier,
    setTier,
    error,
    loading,
    canSubmit: canSubmit(fields),
    submit,
  }
}
