import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { classNames } from '../utils/classNames'

/**
 * DatePicker - Date selection component
 */
export const DatePicker = forwardRef(function DatePicker(
  {
    value,
    onChange,
    label,
    format = 'MM/dd/yyyy',
    minDate,
    maxDate,
    disabled = false,
    readOnly = false,
    error = false,
    helperText,
    placeholder = 'Select date',
    clearable = false,
    className,
    inputProps = {},
    ...props
  },
  ref
) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value || new Date())
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    return format
      .replace('MM', month)
      .replace('dd', day)
      .replace('yyyy', year)
      .replace('yy', String(year).slice(-2))
  }

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange?.(newDate)
    setOpen(false)
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const isDateDisabled = (day) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    return false
  }

  const renderCalendar = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="fakemui-datepicker-day-empty" />)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value && 
        new Date(value).getDate() === day &&
        new Date(value).getMonth() === month &&
        new Date(value).getFullYear() === year
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year
      const isDisabled = isDateDisabled(day)

      days.push(
        <button
          key={day}
          type="button"
          className={classNames('fakemui-datepicker-day', {
            'fakemui-datepicker-day-selected': isSelected,
            'fakemui-datepicker-day-today': isToday,
            'fakemui-datepicker-day-disabled': isDisabled,
          })}
          disabled={isDisabled}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      )
    }

    return (
      <div className="fakemui-datepicker-calendar">
        <div className="fakemui-datepicker-header">
          <button type="button" onClick={handlePrevMonth}>‹</button>
          <span>
            {viewDate.toLocaleString('default', { month: 'long' })} {year}
          </span>
          <button type="button" onClick={handleNextMonth}>›</button>
        </div>
        <div className="fakemui-datepicker-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="fakemui-datepicker-weekday">{day}</div>
          ))}
        </div>
        <div className="fakemui-datepicker-days">{days}</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={classNames('fakemui-datepicker', className, {
        'fakemui-datepicker-disabled': disabled,
        'fakemui-datepicker-error': error,
      })}
      {...props}
    >
      {label && <label className="fakemui-datepicker-label">{label}</label>}
      <div className="fakemui-datepicker-input-container">
        <input
          ref={ref}
          type="text"
          className="fakemui-datepicker-input"
          value={formatDate(value)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && !readOnly && setOpen(true)}
          {...inputProps}
        />
        {clearable && value && (
          <button
            type="button"
            className="fakemui-datepicker-clear"
            onClick={(e) => {
              e.stopPropagation()
              onChange?.(null)
            }}
          >
            ×
          </button>
        )}
        <span className="fakemui-datepicker-icon">📅</span>
      </div>
      {helperText && (
        <span className={classNames('fakemui-datepicker-helper', { 'fakemui-datepicker-helper-error': error })}>
          {helperText}
        </span>
      )}
      {open && renderCalendar()}
    </div>
  )
})

/**
 * TimePicker - Time selection component
 */
export const TimePicker = forwardRef(function TimePicker(
  {
    value,
    onChange,
    label,
    format = 'HH:mm',
    ampm = false,
    disabled = false,
    readOnly = false,
    error = false,
    helperText,
    placeholder = 'Select time',
    className,
    ...props
  },
  ref
) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    let hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    if (ampm) {
      const period = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      return `${hours}:${minutes} ${period}`
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`
  }

  const handleTimeChange = (hours, minutes) => {
    const newDate = value ? new Date(value) : new Date()
    newDate.setHours(hours, minutes, 0, 0)
    onChange?.(newDate)
  }

  return (
    <div
      ref={containerRef}
      className={classNames('fakemui-timepicker', className, {
        'fakemui-timepicker-disabled': disabled,
        'fakemui-timepicker-error': error,
      })}
      {...props}
    >
      {label && <label className="fakemui-timepicker-label">{label}</label>}
      <input
        ref={ref}
        type="time"
        className="fakemui-timepicker-input"
        value={value ? `${String(new Date(value).getHours()).padStart(2, '0')}:${String(new Date(value).getMinutes()).padStart(2, '0')}` : ''}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => {
          const [hours, minutes] = e.target.value.split(':').map(Number)
          handleTimeChange(hours, minutes)
        }}
      />
      {helperText && (
        <span className={classNames('fakemui-timepicker-helper', { 'fakemui-timepicker-helper-error': error })}>
          {helperText}
        </span>
      )}
    </div>
  )
})

/**
 * DateTimePicker - Combined date and time picker
 */
export const DateTimePicker = forwardRef(function DateTimePicker(
  {
    value,
    onChange,
    label,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  return (
    <div className={classNames('fakemui-datetimepicker', className)} {...props}>
      {label && <label className="fakemui-datetimepicker-label">{label}</label>}
      <div className="fakemui-datetimepicker-inputs">
        <DatePicker
          value={value}
          onChange={(date) => {
            if (date && value) {
              date.setHours(new Date(value).getHours(), new Date(value).getMinutes())
            }
            onChange?.(date)
          }}
          disabled={disabled}
        />
        <TimePicker
          value={value}
          onChange={(time) => {
            if (time && value) {
              const newDate = new Date(value)
              newDate.setHours(new Date(time).getHours(), new Date(time).getMinutes())
              onChange?.(newDate)
            } else {
              onChange?.(time)
            }
          }}
          disabled={disabled}
        />
      </div>
    </div>
  )
})

// Additional picker variants
export const DesktopDatePicker = DatePicker
export const MobileDatePicker = DatePicker
export const StaticDatePicker = forwardRef(function StaticDatePicker({ value, onChange, ...props }, ref) {
  const [viewDate, setViewDate] = useState(value || new Date())
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div ref={ref} className="fakemui-static-datepicker" {...props}>
      <div className="fakemui-datepicker-header">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
        <span>{viewDate.toLocaleString('default', { month: 'long' })} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="fakemui-datepicker-weekdays">
        {weekDays.map((day) => <div key={day} className="fakemui-datepicker-weekday">{day}</div>)}
      </div>
      <div className="fakemui-datepicker-days">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            className={classNames('fakemui-datepicker-day', {
              'fakemui-datepicker-day-selected': value && new Date(value).getDate() === day && new Date(value).getMonth() === month,
            })}
            onClick={() => onChange?.(new Date(year, month, day))}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
})

export const CalendarPicker = StaticDatePicker
export const ClockPicker = forwardRef(function ClockPicker({ value, onChange, ...props }, ref) {
  return (
    <div ref={ref} className="fakemui-clock-picker" {...props}>
      <TimePicker value={value} onChange={onChange} />
    </div>
  )
})

export default DatePicker
