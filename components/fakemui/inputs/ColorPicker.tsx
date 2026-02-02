'use client'

import React, { forwardRef, useState, useCallback } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'

export interface ColorPickerProps {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
  showInput?: boolean
  presetColors?: string[]
  alpha?: boolean
}

const DEFAULT_PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff',
  '#0080ff', '#ff0080', '#808080', '#c0c0c0', '#400000',
  '#004000', '#000040', '#404000', '#400040', '#004040'
]

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      label,
      helperText,
      error,
      value = '#000000',
      onChange,
      disabled,
      required,
      className = '',
      showInput = true,
      presetColors = DEFAULT_PRESET_COLORS,
      alpha = false,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value)

    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      onChange?.(newValue)
    }, [onChange])

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue) || /^#[0-9A-Fa-f]{8}$/.test(newValue)) {
        onChange?.(newValue)
      }
    }, [onChange])

    const handlePresetClick = useCallback((color: string) => {
      setLocalValue(color)
      onChange?.(color)
    }, [onChange])

    return (
      <div className={`color-picker ${error ? 'color-picker--error' : ''} ${disabled ? 'color-picker--disabled' : ''} ${className}`}>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <div className="color-picker__controls">
          <input
            ref={ref}
            type="color"
            value={localValue.slice(0, 7)}
            onChange={handleColorChange}
            disabled={disabled}
            className="color-picker__input"
            {...props}
          />
          {showInput && (
            <input
              type="text"
              value={localValue}
              onChange={handleTextChange}
              disabled={disabled}
              className="color-picker__text"
              placeholder="#000000"
              maxLength={alpha ? 9 : 7}
            />
          )}
        </div>
        {presetColors.length > 0 && (
          <div className="color-picker__presets">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-picker__preset ${localValue === color ? 'color-picker__preset--active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handlePresetClick(color)}
                disabled={disabled}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        )}
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }
)

ColorPicker.displayName = 'ColorPicker'
