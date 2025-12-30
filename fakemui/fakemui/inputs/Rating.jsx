import React, { useState } from 'react'
import { classNames } from '../utils/classNames'

export function Rating({
  value = 0,
  onChange,
  max = 5,
  precision = 1,
  size = 'medium',
  disabled = false,
  readOnly = false,
  name,
  emptyIcon = '☆',
  icon = '★',
  highlightSelectedOnly = false,
  className,
  ...props
}) {
  const [hoverValue, setHoverValue] = useState(-1)

  const displayValue = hoverValue >= 0 ? hoverValue : value

  const handleClick = (newValue) => {
    if (disabled || readOnly) return
    onChange?.(null, newValue === value ? 0 : newValue)
  }

  const handleMouseMove = (e, index) => {
    if (disabled || readOnly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (precision === 0.5) {
      setHoverValue(index + (percent < 0.5 ? 0.5 : 1))
    } else {
      setHoverValue(index + 1)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(-1)
  }

  const renderIcon = (index) => {
    const filled = displayValue >= index + 1
    const halfFilled = displayValue >= index + 0.5 && displayValue < index + 1

    return (
      <span
        key={index}
        className={classNames('fakemui-rating-icon', {
          'fakemui-rating-icon-filled': filled,
          'fakemui-rating-icon-half': halfFilled,
          'fakemui-rating-icon-empty': !filled && !halfFilled,
        })}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onClick={() => handleClick(index + 1)}
      >
        {halfFilled ? (
          <span className="fakemui-rating-icon-half-container">
            <span className="fakemui-rating-icon-half-filled">{icon}</span>
            <span className="fakemui-rating-icon-half-empty">{emptyIcon}</span>
          </span>
        ) : filled ? (
          icon
        ) : (
          emptyIcon
        )}
      </span>
    )
  }

  return (
    <span
      className={classNames('fakemui-rating', `fakemui-rating-size-${size}`, className, {
        'fakemui-rating-disabled': disabled,
        'fakemui-rating-readonly': readOnly,
      })}
      onMouseLeave={handleMouseLeave}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      {name && <input type="hidden" name={name} value={value} />}
      {Array.from({ length: max }, (_, index) => renderIcon(index))}
    </span>
  )
}

export default Rating
