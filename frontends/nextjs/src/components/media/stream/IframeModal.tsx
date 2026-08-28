'use client'

import { useEffect, useState } from 'react'
import s from './IframeModal.module.scss'

interface Props {
  name: string
  url: string
  onClose: () => void
}

// Embedding is opt-in per service (see useStreamApps' embedMode) precisely
// because most streaming platforms block it via X-Frame-Options/CSP —
// there's no reliable way to detect that from here (a blocked frame just
// stays blank; browsers don't fire an error event for it), so this shows a
// "stuck?" escape hatch after a delay rather than pretending to detect
// success/failure.
export function IframeModal({ name, url, onClose }: Props) {
  const [showFallbackHint, setShowFallbackHint] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setShowFallbackHint(true)
    }, 3500)
    return () => {
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.panel}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <div className={s.header}>
          <span className={s.title}>{name}</span>
          <div className={s.headerActions}>
            {showFallbackHint && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={s.fallbackLink}
              >
                Not loading? Open in new tab ↗
              </a>
            )}
            <button className={s.closeBtn} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <iframe src={url} className={s.frame} title={name} />
      </div>
    </div>
  )
}
