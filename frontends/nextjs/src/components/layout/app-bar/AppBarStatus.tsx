'use client'

import { useRouter } from 'next/navigation'
import { SunIcon, MoonIcon } from '../AppBarIcons'
import type { DbalState } from './use-dbal-status'
import { AppBarAuthControls } from './AppBarAuthControls'
import s from '../AppBar.module.scss'

export interface AppBarStatusProps {
  dbalState: DbalState
  themeMode: 'light' | 'dark'
  onToggleTheme?: () => void
  isAuthenticated: boolean
  username: string | null
  role: string
  onLogout: () => void
}

export function AppBarStatus(props: AppBarStatusProps) {
  const router = useRouter()
  const dbalTitle = `DBAL ${props.dbalState}`
  const nextTheme = props.themeMode === 'dark' ? 'light' : 'dark'

  return (
    <div className={s.right}>
      <span
        className={`${s.dbalStatus} ${s[props.dbalState]}`}
        title={dbalTitle}
        aria-label={dbalTitle}
      >
        <span className={s.dbalDot} aria-hidden="true" />
        <span className={s.dbalText}>DBAL</span>
      </span>

      {props.onToggleTheme != null && (
        <button
          type="button"
          onClick={props.onToggleTheme}
          className={s.iconButton}
          title={`Switch to ${nextTheme} theme`}
          aria-label={`Switch to ${nextTheme} theme`}
        >
          {props.themeMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      )}

      <span className={s.rule} aria-hidden="true" />

      {!props.isAuthenticated ? (
        <button
          type="button"
          onClick={() => {
            router.push('/login')
          }}
          className={s.primaryButton}
        >
          Login
        </button>
      ) : (
        <AppBarAuthControls
          username={props.username}
          role={props.role}
          onLogout={props.onLogout}
        />
      )}
    </div>
  )
}
