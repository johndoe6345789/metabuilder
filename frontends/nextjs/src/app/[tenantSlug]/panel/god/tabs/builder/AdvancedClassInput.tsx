'use client'

import { TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

export interface AdvancedClassInputProps {
  value: string
  open: boolean
  onToggleOpen: () => void
  onChange: (value: string) => void
}

/** Escape hatch for a class the Styles tab doesn't define -- a global
 *  utility class, most often. Collapsed by default: applying a class is a
 *  click on a chip above, not typing, for everyone who doesn't need this. */
export function AdvancedClassInput({
  value,
  open,
  onToggleOpen,
  onChange,
}: AdvancedClassInputProps) {
  return (
    <div className={s.advancedClasses}>
      <button
        type="button"
        className={s.advancedClassesHead}
        aria-expanded={open}
        onClick={onToggleOpen}
      >
        <span
          className={`material-symbols-rounded ${s.propTwist} ${
            open ? s.propTwistOpen : ''
          }`}
          aria-hidden="true"
        >
          chevron_right
        </span>
        Type a class name instead
      </button>
      {open && (
        <div className={s.advancedClassesBody}>
          <TextField
            size="small"
            fullWidth
            label="CSS classes"
            placeholder="card card--wide"
            value={value}
            helperText="Space separated, same as the class attribute. For a class the Styles tab doesn't define."
            onChange={event => {
              onChange(event.target.value)
            }}
          />
        </div>
      )}
    </div>
  )
}
