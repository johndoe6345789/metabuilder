import React, { forwardRef, useId } from 'react'
import classNames from 'classnames'
import { useAccessible } from '../../../hooks/useAccessible'
import styles from '../../../scss/atoms/mat-checkbox.module.scss'

/** Resolve a class key through CSS Modules; falls back to the raw string when the module does not export it. */
const s = (key: string): string => styles[key] || key

export type CheckboxColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning'
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode
  color?: CheckboxColor
  size?: CheckboxSize
  error?: boolean
  indeterminate?: boolean
  /** Unique identifier for testing and accessibility */
  testId?: string
}

/**
 * Checkbox component using Angular Material M3 structure
 *
 * DOM structure matches Angular Material:
 * - .mat-mdc-checkbox (wrapper)
 *   - .mat-internal-form-field (form field container)
 *     - .mdc-checkbox (checkbox with input + background)
 *     - label text
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label,
    className,
    color = 'primary',
    size = 'md',
    error = false,
    disabled,
    indeterminate = false,
    id: providedId,
    testId,
    ...props
  }, ref) => {
    const autoId = useId()
    const id = providedId ?? autoId

    const accessible = useAccessible({
      feature: 'form',
      component: 'checkbox',
      identifier: testId || String(label),
    })

    // Build class list for the root element
    const rootClasses = classNames(
      s('mat-mdc-checkbox'),
      s('matCheckbox'),
      {
        [s('mat-mdc-checkbox-disabled')]: disabled,
        [s('sizeSm')]: size === 'sm',
        [s('sizeLg')]: size === 'lg',
        [s('colorSecondary')]: color === 'secondary',
        [s('colorError')]: color === 'error' || error,
        [s('colorSuccess')]: color === 'success',
        [s('colorWarning')]: color === 'warning',
      },
      className
    )

    // Build class list for the mdc-checkbox container
    const mdcClasses = classNames(s('mdc-checkbox'), {
      [s('mdc-checkbox--disabled')]: disabled,
    })

    return (
      <div className={rootClasses} data-testid={accessible['data-testid']}>
        <div className={s('mat-internal-form-field')}>
          <div className={mdcClasses}>
            <input
              ref={ref}
              type="checkbox"
              id={id}
              className={s('mdc-checkbox__native-control')}
              disabled={disabled}
              aria-checked={indeterminate ? 'mixed' : undefined}
              {...props}
            />
            <div className={s('mdc-checkbox__ripple')} />
            <div className={s('mdc-checkbox__background')}>
              {/* Checkmark SVG - shown when checked */}
              <svg
                className={s('mdc-checkbox__checkmark')}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  className={s('mdc-checkbox__checkmark-path')}
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"
                />
              </svg>
              {/* Mixedmark - shown when indeterminate */}
              <div className={s('mdc-checkbox__mixedmark')} />
            </div>
            <div className={s('mat-mdc-checkbox-touch-target')} />
            <div className={s('mat-mdc-checkbox-ripple')} />
          </div>
          {label && (
            <label htmlFor={id}>
              {label}
            </label>
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
