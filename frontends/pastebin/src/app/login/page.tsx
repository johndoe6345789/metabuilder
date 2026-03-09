'use client'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { ThemeApplier } from '@/components/layout/ThemeApplier'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, registerUser, clearError } from '@/store/slices/authSlice'
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '@/store/selectors'
import pkg from '../../../package.json'
import styles from './login.module.scss'

type Mode = 'signin' | 'register'
type ForgotState = 'closed' | 'open' | 'sent'

function apiBase() {
  return (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') || '/pastebin-api'
}

const FEATURES = [
  { icon: 'code',           label: 'Multi-language syntax highlighting' },
  { icon: 'folder_special', label: 'Smart namespace organisation' },
  { icon: 'terminal',       label: 'Live Python runner' },
  { icon: 'auto_awesome',   label: 'AI-powered error analysis' },
]

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading         = useAppSelector(selectAuthLoading)
  const reduxError      = useAppSelector(selectAuthError)

  const [mode, setMode]           = useState<Mode>('signin')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState('')

  const [forgot, setForgot]               = useState<ForgotState>('closed')
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotEmail, setForgotEmail]       = useState('')
  const [forgotLoading, setForgotLoading]   = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  const switchMode = (m: Mode) => {
    setMode(m)
    setLocalError('')
    setShowPass(false)
    setShowConf(false)
    setForgot('closed')
    dispatch(clearError())
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    const result = await dispatch(loginUser({ username, password }))
    if (loginUser.fulfilled.match(result)) router.replace('/')
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (password !== confirm) { setLocalError('Passwords do not match'); return }
    if (password.length < 6)  { setLocalError('Password must be at least 6 characters'); return }
    const result = await dispatch(registerUser({ username, password }))
    if (registerUser.fulfilled.match(result)) router.replace('/')
  }

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await fetch(`${apiBase()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername, email: forgotEmail }),
      })
    } finally {
      setForgotLoading(false)
      setForgot('sent')
    }
  }

  const displayError = localError || reduxError

  return (
    <div className={styles.page}>
      <ThemeApplier />
      <div className={styles.container}>

        {/* ── Left: brand panel ────────────────────────────────── */}
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <div className={styles.brandLogo}>
              <div className={styles.brandIconWrap}>
                <MaterialIcon name="code" />
              </div>
              <span className={styles.brandName}>CodeSnippet</span>
            </div>

            <h2 className={styles.brandHeadline}>
              {mode === 'signin' ? 'Welcome\nback.' : 'Start building\ntoday.'}
            </h2>
            <p className={styles.brandSub}>
              {mode === 'signin'
                ? 'Sign in to access your snippets, namespaces and tools.'
                : 'Create a free account and start organising your code.'}
            </p>

            <ul className={styles.features}>
              {FEATURES.map(f => (
                <li key={f.icon} className={styles.featureItem}>
                  <MaterialIcon name={f.icon} className={styles.featureIcon} />
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative code window */}
          <div className={styles.codeWindow}>
            <div className={styles.codeChrome}>
              <span /><span /><span />
              <span className={styles.codeFile}>snippet.ts</span>
            </div>
            <pre className={styles.codePre}>
              <span className={styles.cm}>{'// Smart snippet manager'}</span>{'\n'}
              <span className={styles.kw}>{'const'}</span>{' snippet '}
              <span className={styles.op}>{'='}</span>{' {\n'}
              {'  title: '}<span className={styles.str}>{'"Hello World"'}</span>{',\n'}
              {'  lang:  '}<span className={styles.str}>{'"typescript"'}</span>{',\n'}
              {'  tags:  ['}<span className={styles.str}>{'"api"'}</span>{', '}<span className={styles.str}>{'"utils"'}</span>{'],\n'}
              {'  '}<span className={styles.fn}>{'run'}</span>
              <span className={styles.op}>{'()'}</span>{' '}<span className={styles.op}>{'{'}</span>{'\n'}
              {'    '}<span className={styles.kw}>{'await'}</span>{' '}<span className={styles.fn}>{'execute'}</span>
              <span className={styles.op}>{'()'}</span>{'\n'}
              {'  '},<span className={styles.op}>{'}'}</span>{'\n'}
              {'}'}
            </pre>
          </div>

          <p className={styles.brandBottom}>CodeSnippet · v{pkg.version}</p>
        </div>

        {/* ── Right: form panel ─────────────────────────────────── */}
        <div className={styles.form}>
          <div className={styles.formInner}>

            {mode === 'signin' ? (
              <>
                <div>
                  <h1 className={styles.formTitle}>Log In</h1>
                  <p className={styles.formSub}>Enter your credentials to continue.</p>
                </div>

                {displayError && <div className={styles.error}>{displayError}</div>}

                <form onSubmit={handleSignIn} style={{ display: 'contents' }}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="username">Username</label>
                    <input
                      id="username"
                      className={styles.input}
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      autoFocus
                      autoComplete="username"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <div className={styles.inputRow}>
                      <input
                        id="password"
                        className={`${styles.input} ${styles.withIcon}`}
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button type="button" className={styles.eyeBtn} aria-label="Toggle password" onClick={() => setShowPass(p => !p)}>
                        <MaterialIcon name={showPass ? 'visibility_off' : 'visibility'} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.checkRow}>
                    <input id="remember" type="checkbox" className={styles.checkbox} checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <label htmlFor="remember" className={styles.checkLabel}>Keep me signed in</label>
                  </div>

                  <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Log In'}
                  </button>
                </form>

                {forgot === 'closed' && (
                  <button type="button" className={styles.textBtn} onClick={() => setForgot('open')}>
                    Forgot your password?
                  </button>
                )}

                {forgot === 'open' && (
                  <form className={styles.forgotBox} onSubmit={handleForgot}>
                    <p className={styles.forgotHint}>Enter your username and the email to send the reset link to.</p>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="fgt-u">Username</label>
                      <input id="fgt-u" className={styles.input} type="text" value={forgotUsername} onChange={e => setForgotUsername(e.target.value)} required autoFocus />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="fgt-e">Email address</label>
                      <input id="fgt-e" className={styles.input} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                    </div>
                    <div className={styles.forgotActions}>
                      <button type="button" className={styles.textBtn} onClick={() => setForgot('closed')}>Cancel</button>
                      <button type="submit" className={styles.btnSm} disabled={forgotLoading}>
                        {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                )}

                {forgot === 'sent' && (
                  <p className={styles.success}>Reset link sent — check your inbox.</p>
                )}

                <div className={styles.divider} />
                <div className={styles.switchRow}>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => switchMode('register')}>Create one.</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className={styles.formTitle}>Create Account</h1>
                  <p className={styles.formSub}>Choose a username and password to get started.</p>
                </div>

                {displayError && <div className={styles.error}>{displayError}</div>}

                <form onSubmit={handleRegister} style={{ display: 'contents' }}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-u">Username</label>
                    <input
                      id="reg-u"
                      className={styles.input}
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      autoFocus
                      autoComplete="username"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-p">Password</label>
                    <div className={styles.inputRow}>
                      <input
                        id="reg-p"
                        className={`${styles.input} ${styles.withIcon}`}
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} aria-label="Toggle password" onClick={() => setShowPass(p => !p)}>
                        <MaterialIcon name={showPass ? 'visibility_off' : 'visibility'} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-c">Confirm Password</label>
                    <div className={styles.inputRow}>
                      <input
                        id="reg-c"
                        className={`${styles.input} ${styles.withIcon}`}
                        type={showConf ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} aria-label="Toggle password" onClick={() => setShowConf(p => !p)}>
                        <MaterialIcon name={showConf ? 'visibility_off' : 'visibility'} />
                      </button>
                    </div>
                  </div>

                  <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <div className={styles.divider} />
                <div className={styles.switchRow}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('signin')}>Log In.</button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
