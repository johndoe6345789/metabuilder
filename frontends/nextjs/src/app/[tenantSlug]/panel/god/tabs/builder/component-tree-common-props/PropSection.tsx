'use client'

import type { ReactNode } from 'react'
import s from '../ComponentTreeTab.module.scss'

export interface PropSectionProps {
  id: string
  label: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

/** One collapsible group in the property sheet -- a header that toggles
 *  its own body, in the spirit of a VB6 property sheet's categories. */
export function PropSection({
  id,
  label,
  isOpen,
  onToggle,
  children,
}: PropSectionProps) {
  return (
    <div className={s.propSection}>
      <button
        type="button"
        className={s.propSectionHead}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
      >
        <span
          className={`material-symbols-rounded ${s.propTwist} ${
            isOpen ? s.propTwistOpen : ''
          }`}
          aria-hidden="true"
        >
          chevron_right
        </span>
        {label}
      </button>
      {isOpen && (
        <div className={s.propCol} id={id}>
          {children}
        </div>
      )}
    </div>
  )
}
