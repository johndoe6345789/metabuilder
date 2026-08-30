'use client'

import s from '../CssClassesTab.module.scss'

export interface ControlHeaderProps {
  label: string
  isSet: boolean
  currentValue?: string
  onClear: () => void
}

/**
 * Every kind but "choice" and "toggle" shares this: a label, the current
 * value if one is set, and the "Default" escape that removes the
 * declaration entirely rather than forcing a value to be chosen.
 */
export function ControlHeader({
  label,
  isSet,
  currentValue,
  onClear,
}: ControlHeaderProps) {
  return (
    <div className={s.ctrlHead}>
      <span className={s.ctrlLabel}>
        {label}
        {isSet && currentValue !== undefined && (
          <span className={s.ctrlValue}>{currentValue}</span>
        )}
      </span>
      {isSet && (
        <button type="button" className={s.ctrlClear} onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}
