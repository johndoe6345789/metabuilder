'use client'

import React, { useState, useRef, useEffect } from 'react'
import { classNames } from '../utils/classNames'

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  label?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  format?: string
  inputFormat?: string
  views?: ('year' | 'month' | 'day')[]
  openTo?: 'year' | 'month' | 'day'
  className?: string
  sx?: React.CSSProperties
  renderInput?: (props: any) => React.ReactNode
  disableFuture?: boolean
  disablePast?: boolean
}

export interface TimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  label?: string
  disabled?: boolean
  ampm?: boolean
  views?: ('hours' | 'minutes' | 'seconds')[]
  className?: string
  sx?: React.CSSProperties
  renderInput?: (props: any) => React.ReactNode
}

export interface DateTimePickerProps extends Omit<DatePickerProps, 'views'>, Omit<TimePickerProps, 'views'> {
  dateFormat?: string
  timeFormat?: string
  views?: ('year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds')[]
}

/**
 * Format a date to YYYY-MM-DD
 */
const formatDate = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a time to HH:MM
 */
const formatTime = (date: Date | null): string => {
  if (!date) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Format a datetime to YYYY-MM-DDTHH:MM
 */
const formatDateTime = (date: Date | null): string => {
  if (!date) return ''
  return `${formatDate(date)}T${formatTime(date)}`
}

/**
 * DatePicker - Date selection component
 */
export function DatePicker({
  value,
  onChange,
  label,
  disabled = false,
  minDate,
  maxDate,
  className,
  sx,
  renderInput,
  disableFuture = false,
  disablePast = false,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = value !== undefined ? value : internalValue

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    const newDate = dateStr ? new Date(dateStr + 'T00:00:00') : null
    
    setInternalValue(newDate)
    onChange?.(newDate)
  }

  const getMinMax = () => {
    let min: string | undefined
    let max: string | undefined

    if (minDate) min = formatDate(minDate)
    if (maxDate) max = formatDate(maxDate)
    if (disablePast) min = formatDate(new Date())
    if (disableFuture) max = formatDate(new Date())

    return { min, max }
  }

  const { min, max } = getMinMax()

  const inputProps = {
    type: 'date',
    value: formatDate(currentValue ?? null),
    onChange: handleChange,
    disabled,
    min,
    max,
    ref: inputRef,
    className: 'fakemui-datepicker-input',
  }

  if (renderInput) {
    return renderInput(inputProps)
  }

  return (
    <div className={classNames('fakemui-datepicker', className)} style={sx}>
      {label && <label className="fakemui-datepicker-label">{label}</label>}
      <input {...inputProps} />
    </div>
  )
}

/**
 * TimePicker - Time selection component
 */
export function TimePicker({
  value,
  onChange,
  label,
  disabled = false,
  ampm = false,
  className,
  sx,
  renderInput,
}: TimePickerProps) {
  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = value !== undefined ? value : internalValue

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value
    if (!timeStr) {
      setInternalValue(null)
      onChange?.(null)
      return
    }

    const [hours, minutes] = timeStr.split(':').map(Number)
    if (hours === undefined || minutes === undefined) {
      return
    }
    const newDate = new Date()
    newDate.setHours(hours, minutes, 0, 0)
    
    setInternalValue(newDate)
    onChange?.(newDate)
  }

  const inputProps = {
    type: 'time',
    value: formatTime(currentValue ?? null),
    onChange: handleChange,
    disabled,
    ref: inputRef,
    className: 'fakemui-timepicker-input',
  }

  if (renderInput) {
    return renderInput(inputProps)
  }

  return (
    <div className={classNames('fakemui-timepicker', className)} style={sx}>
      {label && <label className="fakemui-timepicker-label">{label}</label>}
      <input {...inputProps} />
    </div>
  )
}

/**
 * DateTimePicker - Combined date and time selection
 */
export function DateTimePicker({
  value,
  onChange,
  label,
  disabled = false,
  minDate,
  maxDate,
  className,
  sx,
  renderInput,
  disableFuture = false,
  disablePast = false,
}: DateTimePickerProps) {
  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = value !== undefined ? value : internalValue

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateTimeStr = e.target.value
    const newDate = dateTimeStr ? new Date(dateTimeStr) : null
    
    setInternalValue(newDate)
    onChange?.(newDate)
  }

  const getMinMax = () => {
    let min: string | undefined
    let max: string | undefined

    if (minDate) min = formatDateTime(minDate)
    if (maxDate) max = formatDateTime(maxDate)
    if (disablePast) min = formatDateTime(new Date())
    if (disableFuture) max = formatDateTime(new Date())

    return { min, max }
  }

  const { min, max } = getMinMax()

  const inputProps = {
    type: 'datetime-local',
    value: formatDateTime(currentValue ?? null),
    onChange: handleChange,
    disabled,
    min,
    max,
    ref: inputRef,
    className: 'fakemui-datetimepicker-input',
  }

  if (renderInput) {
    return renderInput(inputProps)
  }

  return (
    <div className={classNames('fakemui-datetimepicker', className)} style={sx}>
      {label && <label className="fakemui-datetimepicker-label">{label}</label>}
      <input {...inputProps} />
    </div>
  )
}

// Aliases for API compatibility
export const DesktopDatePicker = DatePicker
export const MobileDatePicker = DatePicker
export const StaticDatePicker = DatePicker
export const CalendarPicker = DatePicker
export const ClockPicker = TimePicker
