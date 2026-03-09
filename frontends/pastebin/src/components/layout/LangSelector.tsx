'use client'

import { useState, useRef, useEffect } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch, useAppSelector, setLocale } from '@/store/exports'
import type { AppLocale } from '@/store/slices/uiSlice'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './lang-selector.module.scss'

const LANGS: { code: AppLocale; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
]

export function LangSelector() {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const locale = useAppSelector(state => state.ui.locale ?? 'en')

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={styles.root} ref={ref} data-testid="lang-selector">
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-label={t.langSelector.ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        data-testid="lang-trigger"
      >
        <MaterialIcon name="language" size={16} aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
      </button>

      {open && (
        <div className={styles.panel} role="listbox" aria-label="Language">
          {LANGS.map(lang => (
            <button
              key={lang.code}
              role="option"
              aria-selected={locale === lang.code}
              className={locale === lang.code ? styles.optionActive : styles.option}
              onClick={() => { dispatch(setLocale(lang.code)); setOpen(false) }}
              data-testid={`lang-option-${lang.code}`}
            >
              <span className={styles.optionLabel}>{lang.native}</span>
              <span className={styles.optionSub}>{lang.label}</span>
              {locale === lang.code && <MaterialIcon name="check" size={14} className={styles.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
