'use client'

import React, { forwardRef, useState, useCallback, useMemo } from 'react'
import { classNames } from '../utils/classNames'
import styles from '../../../scss/atoms/mat-slider.module.scss'

// Resolve CSS module hashed class names, falling back to raw key for global classes
const s = (key: string): string => styles[key] || key

export interface SliderMark {
  value: number
  label?: React.ReactNode
}

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value' | 'size' | 'defaultValue'> {
  /** Current value (controlled) */
  value?: number | number[]
  /** Default value (uncontrolled) */
  defaultValue?: number | number[]
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Marks to display on the track */
  marks?: boolean | SliderMark[]
  /** Controls when the value label is displayed */
  valueLabelDisplay?: 'auto' | 'on' | 'off'
  /** Format function for value label */
  valueLabelFormat?: (value: number) => React.ReactNode
  /** Track display mode */
  track?: 'normal' | 'inverted' | false
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Color variant */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  /** Size variant */
  size?: 'small' | 'medium'
  /** Disable the slider */
  disabled?: boolean
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: number) => void
  /** Change committed handler (on mouse up) */
  onChangeCommitted?: (event: React.SyntheticEvent, value: number) => void
  /** Radix-style value change handler */
  onValueChange?: (value: number[]) => void
  testId?: string
  /** Accessible label */
  'aria-label'?: string
  /** ID of element that labels this slider */
  'aria-labelledby'?: string
}

// Map color props to CSS module classes
const colorClassMap: Record<string, string | undefined> = {
  primary: styles.sliderPrimary,
  secondary: styles.sliderSecondary,
  error: styles.sliderError,
  warning: styles.sliderWarning,
  info: styles.sliderInfo,
  success: styles.sliderSuccess,
}

// Map size props to CSS module classes
const sizeClassMap: Record<string, string | undefined> = {
  small: styles.sliderSmall,
  medium: styles.sliderMedium,
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      marks = false,
      valueLabelDisplay = 'off',
      valueLabelFormat = (v) => v,
      track = 'normal',
      orientation = 'horizontal',
      color = 'primary',
      size = 'medium',
      disabled = false,
      onChange,
      onChangeCommitted,
      onValueChange,
      testId,
      className = '',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(
      typeof defaultValue === 'number' ? defaultValue : defaultValue[0] ?? 0
    )
    const [showLabel, setShowLabel] = useState(valueLabelDisplay === 'on')
    const [isFocused, setIsFocused] = useState(false)

    const value = controlledValue !== undefined
      ? (typeof controlledValue === 'number' ? controlledValue : controlledValue[0] ?? 0)
      : internalValue

    const percent = ((value - min) / (max - min)) * 100

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (controlledValue === undefined) {
          setInternalValue(newValue)
        }
        onChange?.(e, newValue)
        onValueChange?.([newValue])
      },
      [controlledValue, onChange]
    )

    const handleMouseUp = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        onChangeCommitted?.(e, value)
      },
      [onChangeCommitted, value]
    )

    const handleMouseEnter = useCallback(() => {
      if (valueLabelDisplay === 'auto') setShowLabel(true)
    }, [valueLabelDisplay])

    const handleMouseLeave = useCallback(() => {
      if (valueLabelDisplay === 'auto') setShowLabel(false)
    }, [valueLabelDisplay])

    const handleFocus = useCallback(() => {
      setIsFocused(true)
    }, [])

    const handleBlur = useCallback(() => {
      setIsFocused(false)
    }, [])

    const computedMarks = useMemo<SliderMark[]>(() => {
      if (!marks) return []
      if (marks === true) {
        const result: SliderMark[] = []
        for (let v = min; v <= max; v += step) {
          result.push({ value: v })
        }
        return result
      }
      return marks
    }, [marks, min, max, step])

    const hasMarks = computedMarks.length > 0

    // Build root class using Angular Material M3 classes
    const rootClass = classNames(
      s('mat-mdc-slider'),  // Angular Material main slider class
      styles.matSlider,      // CSS module local class
      colorClassMap[color],
      sizeClassMap[size],
      {
        [s('mdc-slider--disabled')]: disabled,
        [s('mdc-slider--discrete')]: hasMarks,
        [s('mat-mdc-slider-with-animation')]: true,
        [styles.sliderVertical]: orientation === 'vertical',
        [styles.sliderTrackInverted]: track === 'inverted',
        [styles.sliderDiscrete]: hasMarks,
      },
      className
    )

    // Track fill transform based on orientation and inverted mode
    const trackFillTransform = orientation === 'horizontal'
      ? track === 'inverted'
        ? `scaleX(${(100 - percent) / 100})`
        : `scaleX(${percent / 100})`
      : track === 'inverted'
        ? `scaleY(${(100 - percent) / 100})`
        : `scaleY(${percent / 100})`

    // Thumb position
    const thumbStyle = orientation === 'horizontal'
      ? { left: `calc(${percent}% - 24px)` }
      : { bottom: `calc(${percent}% - 24px)` }

    return (
      <div
        className={rootClass}
        data-testid={testId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Track container */}
        <div className={s('mdc-slider__track')}>
          {/* Inactive track (background) */}
          <div className={s('mdc-slider__track--inactive')} />

          {/* Active track (filled portion) */}
          {track !== false && (
            <div className={s('mdc-slider__track--active')}>
              <div
                className={s('mdc-slider__track--active_fill')}
                style={{ transform: trackFillTransform }}
              />
            </div>
          )}

          {/* Tick marks for discrete slider */}
          {hasMarks && (
            <div className={s('mdc-slider__tick-marks')}>
              {computedMarks.map((mark) => {
                const markPercent = ((mark.value - min) / (max - min)) * 100
                const isActive = track === 'inverted'
                  ? mark.value >= value
                  : mark.value <= value

                return (
                  <div
                    key={mark.value}
                    className={isActive ? s('mdc-slider__tick-mark--active') : s('mdc-slider__tick-mark--inactive')}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Thumb */}
        <div
          className={classNames(s('mdc-slider__thumb'), {
            [s('mdc-slider__thumb--focused')]: isFocused,
            [s('mdc-slider__thumb--with-indicator')]: showLabel || valueLabelDisplay === 'on',
          })}
          style={thumbStyle}
        >
          {/* Value indicator (tooltip) */}
          {(showLabel || valueLabelDisplay === 'on') && (
            <div className={s('mdc-slider__value-indicator-container')}>
              <div className={s('mdc-slider__value-indicator')}>
                <span className={s('mdc-slider__value-indicator-text')}>
                  {valueLabelFormat(value)}
                </span>
              </div>
            </div>
          )}

          {/* Thumb knob */}
          <div className={s('mdc-slider__thumb-knob')} />

          {/* Ripple container */}
          <div className={s('mat-ripple')}>
            {isFocused && <div className={classNames(s('mat-ripple-element'), s('mat-mdc-slider-focus-ripple'))} />}
          </div>

          {/* Focus indicator */}
          <div className={s('mat-focus-indicator')} />
        </div>

        {/* Hidden input for accessibility */}
        <input
          ref={ref}
          type="range"
          className={s('mdc-slider__input')}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation={orientation}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
