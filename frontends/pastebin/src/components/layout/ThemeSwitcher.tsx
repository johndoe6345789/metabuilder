'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTheme } from '@/store/slices/uiSlice'
import { selectTheme } from '@/store/selectors'
import styles from './theme-switcher.module.scss'

export function ThemeSwitcher() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const isDark = theme === 'dark'

  return (
    <button
      className={styles.btn}
      onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="theme-switcher"
    >
      {isDark
        ? <MaterialIcon name="light_mode" size={18} aria-hidden="true" />
        : <MaterialIcon name="dark_mode" size={18} aria-hidden="true" />
      }
    </button>
  )
}
