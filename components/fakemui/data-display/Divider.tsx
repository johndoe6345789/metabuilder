import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/mat-divider.module.scss'

export type DividerVariant = 'fullBleed' | 'inset' | 'insetStart' | 'insetEnd' | 'insetBoth' | 'middle'
export type DividerTextAlign = 'start' | 'center' | 'end'

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Render as vertical divider */
  vertical?: boolean
  /** Inset/margin variant */
  variant?: DividerVariant
  /** Thicker divider (2px instead of 1px) */
  thick?: boolean
  /** Lighter color variant */
  light?: boolean
  /** Darker color variant (uses outline instead of outline-variant) */
  dark?: boolean
  /** Use flexItem margins (8px horizontal) */
  flexItem?: boolean
  /** Section divider style (8px height, surface-container background) */
  section?: boolean
  /** Text content to display in the divider */
  children?: React.ReactNode
  /** Text alignment when children are provided */
  textAlign?: DividerTextAlign
  /** Test ID for automated testing */
  testId?: string
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  variant,
  thick = false,
  light = false,
  dark = false,
  flexItem = false,
  section = false,
  children,
  textAlign = 'center',
  testId,
  className,
  ...props
}) => {
  // If there are children, render as a div with text
  if (children) {
    return (
      <div
        className={classNames(
          styles.dividerWithText,
          {
            [styles.dividerWithTextStart]: textAlign === 'start',
            [styles.dividerWithTextEnd]: textAlign === 'end',
          },
          className
        )}
        role="separator"
        data-testid={testId}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        <span className={styles.dividerText}>{children}</span>
      </div>
    )
  }

  return (
    <hr
      role="separator"
      data-testid={testId}
      className={classNames(
        styles.divider,
        {
          // Orientation
          [styles.dividerVertical]: vertical,
          // Variants
          [styles.dividerFullBleed]: variant === 'fullBleed',
          [styles.dividerInset]: variant === 'inset',
          [styles.dividerInsetStart]: variant === 'insetStart',
          [styles.dividerInsetEnd]: variant === 'insetEnd',
          [styles.dividerInsetBoth]: variant === 'insetBoth',
          [styles.dividerMiddle]: variant === 'middle',
          // Modifiers
          [styles.dividerThick]: thick,
          [styles.dividerLight]: light,
          [styles.dividerDark]: dark,
          [styles.dividerFlexItem]: flexItem,
          [styles.dividerSection]: section,
        },
        className
      )}
      {...props}
    />
  )
}
