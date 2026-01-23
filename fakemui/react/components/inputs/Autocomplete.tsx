'use client'

import React, { useState, useRef, useEffect } from 'react'
import { classNames } from '../utils/classNames'

export interface AutocompleteRenderInputParams {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled: boolean
}

export interface AutocompleteRenderOptionState {
  index: number
}

export interface AutocompleteProps<T = any> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options?: T[]
  value?: T | T[] | null
  onChange?: (event: React.SyntheticEvent | null, value: T | T[] | null) => void
  inputValue?: string
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void
  getOptionLabel?: (option: T) => string
  renderOption?: (option: T, state: AutocompleteRenderOptionState) => React.ReactNode
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode
  multiple?: boolean
  freeSolo?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  noOptionsText?: string
  placeholder?: string
}

export function Autocomplete<T = any>({
  options = [],
  value,
  onChange,
  inputValue,
  onInputChange,
  getOptionLabel = (option: any) => option?.label ?? option ?? '',
  renderOption,
  renderInput,
  multiple = false,
  freeSolo = false,
  disabled = false,
  loading = false,
  loadingText = 'Loading…',
  noOptionsText = 'No options',
  placeholder,
  className,
  ...props
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false)
  const [internalInputValue, setInternalInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const controlledInputValue = inputValue ?? internalInputValue

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(controlledInputValue.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (onInputChange) {
      onInputChange(e, newValue)
    } else {
      setInternalInputValue(newValue)
    }
    setOpen(true)
  }

  const handleOptionClick = (option: T) => {
    if (multiple) {
      const currentValue = (value as T[]) || []
      const newValue = [...currentValue, option]
      onChange?.(null, newValue)
    } else {
      onChange?.(null, option)
      setInternalInputValue(getOptionLabel(option))
    }
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      const selectedOption = filteredOptions[highlightedIndex]
      if (selectedOption !== undefined) {
        handleOptionClick(selectedOption)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const defaultRenderInput = (params: AutocompleteRenderInputParams) => (
    <input
      {...params}
      type="text"
      className="fakemui-autocomplete-input"
      placeholder={placeholder}
    />
  )

  return (
    <div
      className={classNames('fakemui-autocomplete', className, {
        'fakemui-autocomplete-disabled': disabled,
      })}
      ref={inputRef}
      {...props}
    >
      <div className="fakemui-autocomplete-input-wrapper">
        {multiple && Array.isArray(value) && value.length > 0 && (
          <div className="fakemui-autocomplete-tags">
            {value.map((item, index) => (
              <span key={index} className="fakemui-autocomplete-tag">
                {getOptionLabel(item)}
                <button
                  type="button"
                  className="fakemui-autocomplete-tag-remove"
                  onClick={() => {
                    const newValue = value.filter((_, i) => i !== index)
                    onChange?.(null, newValue)
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {renderInput ? (
          renderInput({
            value: controlledInputValue,
            onChange: handleInputChange,
            onFocus: () => setOpen(true),
            onKeyDown: handleKeyDown,
            disabled,
          })
        ) : (
          defaultRenderInput({
            value: controlledInputValue,
            onChange: handleInputChange,
            onFocus: () => setOpen(true),
            onKeyDown: handleKeyDown,
            disabled,
          })
        )}
      </div>

      {open && (
        <ul className="fakemui-autocomplete-listbox" ref={listRef}>
          {loading ? (
            <li className="fakemui-autocomplete-loading">{loadingText}</li>
          ) : filteredOptions.length === 0 ? (
            <li className="fakemui-autocomplete-no-options">{noOptionsText}</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                className={classNames('fakemui-autocomplete-option', {
                  'fakemui-autocomplete-option-highlighted': index === highlightedIndex,
                })}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {renderOption ? renderOption(option, { index }) : getOptionLabel(option)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default Autocomplete
