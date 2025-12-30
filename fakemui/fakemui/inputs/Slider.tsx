import React, { forwardRef, useState, useCallback, useMemo } from 'react'
import { classNames } from '../utils/classNames'

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
  /** Accessible label */
  'aria-label'?: string
  /** ID of element that labels this slider */
  'aria-labelledby'?: string
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

    const rootClass = classNames(
      'fakemui-slider',
      `fakemui-slider--${orientation}`,
      `fakemui-slider--${color}`,
      `fakemui-slider--${size}`,
      {
        'fakemui-slider--disabled': disabled,
        'fakemui-slider--track-inverted': track === 'inverted',
        'fakemui-slider--track-none': track === false,
      },
      className
    )

    const trackStyle = orientation === 'horizontal'
      ? { width: track === 'inverted' ? `${100 - percent}%` : `${percent}%` }
      : { height: track === 'inverted' ? `${100 - percent}%` : `${percent}%` }

    return (
      <span
        className={rootClass}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="fakemui-slider-rail" />
        
        {track !== false && (
          <span className="fakemui-slider-track" style={trackStyle} />
        )}

        {computedMarks.length > 0 && (
          <span className="fakemui-slider-marks">
            {computedMarks.map((mark) => {
              const markPercent = ((mark.value - min) / (max - min)) * 100
              const markStyle = orientation === 'horizontal'
                ? { left: `${markPercent}%` }
                : { bottom: `${markPercent}%` }
              const isActive = track === 'inverted'
                ? mark.value >= value
                : mark.value <= value
              
              return (
                <span key={mark.value} className="fakemui-slider-mark-container" style={markStyle}>
                  <span
                    className={classNames('fakemui-slider-mark', {
                      'fakemui-slider-mark--active': isActive,
                    })}
                  />
                  {mark.label && (
                    <span className="fakemui-slider-mark-label">{mark.label}</span>
                  )}
                </span>
              )
            })}
          </span>
        )}

        <span
          className="fakemui-slider-thumb"
          style={orientation === 'horizontal' ? { left: `${percent}%` } : { bottom: `${percent}%` }}
        >
          {(showLabel || valueLabelDisplay === 'on') && (
            <span className="fakemui-slider-value-label">
              {valueLabelFormat(value)}
            </span>
          )}
        </span>

        <input
          ref={ref}
          type="range"
          className="fakemui-slider-input"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation={orientation}
          {...props}
        />
      </span>
    )
  }
)

Slider.displayName = 'Slider'
