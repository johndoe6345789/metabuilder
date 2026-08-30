'use client'

import Link from 'next/link'
import { SignupFields } from './SignupFields'
import { TierPicker } from './TierPicker'
import { useSignup } from './use-signup'
import s from './page.module.scss'

export default function SignupPage() {
  const form = useSignup()

  return (
    <div className={s.root}>
      <div className={s.card}>
        <Link href="/" className={s.logo} />
        <h1 className={s.title}>Create your community</h1>
        <p className={s.sub}>Free 14-day trial · No card needed</p>

        <form
          onSubmit={e => {
            e.preventDefault()
            void form.submit()
          }}
          className={s.form}
        >
          <SignupFields
            community={form.community}
            name={form.name}
            email={form.email}
            password={form.password}
            onCommunityChange={form.setCommunity}
            onNameChange={form.setName}
            onEmailChange={form.setEmail}
            onPasswordChange={form.setPassword}
          />

          <TierPicker tier={form.tier} onChange={form.setTier} />

          {form.error.length > 0 && <p className={s.error}>{form.error}</p>}

          <button
            type="submit"
            className={s.submit}
            disabled={form.loading || !form.canSubmit}
          >
            {form.loading ? 'Creating your platform…' : 'Start free trial'}
          </button>
        </form>

        <p className={s.signin}>
          Already have an account?{' '}
          <Link href="/login" className={s.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
