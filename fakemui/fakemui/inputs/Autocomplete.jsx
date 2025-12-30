import React, { useState, useRef, useEffect } from 'react'
import { classNames } from '../utils/classNames'

export function Autocomplete({
  options = [],
  value,
  onChange,
  inputValue,
  onInputChange,
  getOptionLabel = (option) => option?.label ?? option ?? '',
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
}) {
  const [open, setOpen] = useState(false)
  const [internalInputValue, setInternalInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const controlledInputValue = inputValue ?? internalInputValue

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(controlledInputValue.toLowerCase())
  )

  const handleInputChange = (e) => {
    const newValue = e.target.value
    if (onInputChange) {
      onInputChange(e, newValue)
    } else {
      setInternalInputValue(newValue)
    }
    setOpen(true)
  }

  const handleOptionClick = (option) => {
    if (multiple) {
      const newValue = value ? [...value, option] : [option]
      onChange?.(null, newValue)
    } else {
      onChange?.(null, option)
      setInternalInputValue(getOptionLabel(option))
    }
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleOptionClick(filteredOptions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const defaultRenderInput = (params) => (
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
        {multiple && value?.length > 0 && (
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
