import React, { forwardRef, useId } from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/mat-radio.module.scss'

/** Resolve CSS module class names with fallback to raw string */
const s = (key: string): string => styles[key] || key

export type RadioColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning'
export type RadioSize = 'sm' | 'md' | 'lg'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  testId?: string
  /** Label text for the radio button */
  label?: React.ReactNode
  /** Color variant */
  color?: RadioColor
  /** Size variant */
  size?: RadioSize
  /** Error state */
  error?: boolean
  /** Disable ripple effect */
  disableRipple?: boolean
}

/**
 * Radio component using Angular Material M3 structure
 *
 * DOM structure matches Angular Material:
 * - .mat-mdc-radio-button (wrapper)
 *   - .mdc-radio (radio with input + background)
 *     - .mdc-radio__native-control (hidden input)
 *     - .mdc-radio__background (visual indicator)
 *       - .mdc-radio__outer-circle
 *       - .mdc-radio__inner-circle
 *     - .mat-radio-ripple (ripple effect)
 *   - .mat-mdc-radio-touch-target (enlarged touch area)
 *   - .mat-internal-form-field (label)
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      className,
      color = 'primary',
      size = 'md',
      error = false,
      disabled,
      checked,
      disableRipple = false,
      testId,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const id = providedId ?? autoId

    // Build class list for the root element
    const rootClasses = classNames(
      s('mat-mdc-radio-button'),
      s('matRadio'),
      {
        [s('mat-mdc-radio-checked')]: checked,
        [s('mat-mdc-radio-disabled')]: disabled,
        [s('_mat-animation-noopable')]: disableRipple,
        [s('sizeSm')]: size === 'sm',
        [s('sizeLg')]: size === 'lg',
        [s('colorSecondary')]: color === 'secondary',
        [s('colorError')]: color === 'error' || error,
        [s('colorSuccess')]: color === 'success',
        [s('colorWarning')]: color === 'warning',
      },
      className
    )

    // Build class list for the mdc-radio container
    const mdcClasses = classNames(s('mdc-radio'), {
      [s('mdc-radio--disabled')]: disabled,
    })

    return (
      <div className={rootClasses} data-testid={testId}>
        <div className={mdcClasses}>
          <input
            ref={ref}
            type="radio"
            id={id}
            className={s('mdc-radio__native-control')}
            disabled={disabled}
            checked={checked}
            {...props}
          />
          <div className={s('mdc-radio__background')}>
            <div className={s('mdc-radio__outer-circle')} />
            <div className={s('mdc-radio__inner-circle')} />
          </div>
          {!disableRipple && (
            <div className={classNames(s('mat-radio-ripple'), s('mat-focus-indicator'))}>
              <span className={s('mat-ripple-element')} />
            </div>
          )}
        </div>
        <div className={s('mat-mdc-radio-touch-target')} />
        {label && (
          <label className={s('mat-internal-form-field')} htmlFor={id}>
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'
