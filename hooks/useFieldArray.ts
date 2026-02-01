'use client'

/**
 * useFieldArray Hook
 *
 * Manages dynamic form field arrays with add/remove/reorder operations.
 * Supports nested validation, field-level error tracking, and batch operations.
 *
 * @example
 * const { fields, append, remove, move, reset } = useFieldArray([])
 *
 * fields.map((field, idx) => (
 *   <div key={field.id}>
 *     <input value={field.value} />
 *     <button onClick={() => remove(idx)}>Remove</button>
 *   </div>
 * ))
 *
 * <button onClick={() => append({ value: '' })}>Add Field</button>
 */

import { useCallback, useState } from 'react'
import { nanoid } from 'nanoid'

/**
 * Field with unique identifier
 */
export interface FormField<T = unknown> {
  id: string
  value: T
}

/**
 * Configuration options
 */
interface UseFieldArrayOptions<T> {
  /** Callback when fields change */
  onChange?: (fields: FormField<T>[]) => void
  /** Min number of fields */
  minFields?: number
  /** Max number of fields */
  maxFields?: number
  /** Validation function for each field */
  validateField?: (value: T, index: number) => string
}

interface UseFieldArrayState<T> {
  fields: FormField<T>[]
  isDirty: boolean
  isTouched: boolean
  errors: Record<number, string>
  count: number
  canAdd: boolean
  canRemove: boolean
}

interface UseFieldArrayHandlers<T> {
  append: (value: T, options?: { atIndex?: number }) => void
  prepend: (value: T) => void
  remove: (index: number) => void
  insert: (index: number, value: T) => void
  move: (from: number, to: number) => void
  swap: (indexA: number, indexB: number) => void
  replace: (index: number, value: T) => void
  replaceAll: (values: T[]) => void
  updateField: (index: number, value: Partial<T>) => void
  getField: (index: number) => FormField<T> | undefined
  clear: () => void
  reset: () => void
  shift: () => FormField<T> | undefined
  pop: () => FormField<T> | undefined
  unshift: (value: T) => void
  push: (value: T) => void
  touch: () => void
  validateField: (index: number) => boolean
  validateAll: () => boolean
  setFieldError: (index: number, error: string) => void
  clearFieldError: (index: number) => void
  clearErrors: () => void
}

interface UseFieldArrayReturn<T> extends UseFieldArrayState<T> {
  handlers: UseFieldArrayHandlers<T>
}

/**
 * Hook for managing dynamic form field arrays
 *
 * @param initialFields Initial field values
 * @param options Configuration options
 * @returns Field array state and handlers
 */
export function useFieldArray<T = unknown>(
  initialFields: T[] = [],
  options?: UseFieldArrayOptions<T>
): UseFieldArrayReturn<T> {
  // Create initial fields with unique IDs
  const initialFormFields: FormField<T>[] = initialFields.map((value) => ({
    id: nanoid(),
    value,
  }))

  const [fields, setFields] = useState<FormField<T>[]>(initialFormFields)
  const [isDirty, setIsDirty] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})

  // Calculate state
  const count = fields.length
  const canAdd = !options?.maxFields || count < options.maxFields
  const canRemove = !options?.minFields || count > options.minFields

  /**
   * Update fields and call onChange
   */
  const updateFields = useCallback(
    (newFields: FormField<T>[]) => {
      setFields(newFields)
      setIsDirty(JSON.stringify(newFields) !== JSON.stringify(initialFormFields))
      options?.onChange?.(newFields)
    },
    [initialFormFields, options]
  )

  /**
   * Append a field at the end
   */
  const append = useCallback(
    (value: T, opts?: { atIndex?: number }) => {
      if (!canAdd) return

      const newField: FormField<T> = {
        id: nanoid(),
        value,
      }

      const index = opts?.atIndex ?? fields.length
      const newFields = [...fields.slice(0, index), newField, ...fields.slice(index)]

      updateFields(newFields)
    },
    [fields, canAdd, updateFields]
  )

  /**
   * Prepend a field at the beginning
   */
  const prepend = useCallback(
    (value: T) => {
      append(value, { atIndex: 0 })
    },
    [append]
  )

  /**
   * Insert a field at a specific index
   */
  const insert = useCallback(
    (index: number, value: T) => {
      if (index < 0 || index > fields.length) return

      const newField: FormField<T> = {
        id: nanoid(),
        value,
      }

      const newFields = [...fields.slice(0, index), newField, ...fields.slice(index)]

      updateFields(newFields)
    },
    [fields, updateFields]
  )

  /**
   * Remove a field at a specific index
   */
  const remove = useCallback(
    (index: number) => {
      if (index < 0 || index >= fields.length || !canRemove) return

      const newFields = fields.filter((_, i) => i !== index)

      updateFields(newFields)

      // Clear error for removed field
      setErrors((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    },
    [fields, canRemove, updateFields]
  )

  /**
   * Move a field from one index to another
   */
  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || from >= fields.length || to < 0 || to >= fields.length)
        return

      const newFields = [...fields]
      const [movedField] = newFields.splice(from, 1)
      newFields.splice(to, 0, movedField)

      updateFields(newFields)
    },
    [fields, updateFields]
  )

  /**
   * Swap two fields
   */
  const swap = useCallback(
    (indexA: number, indexB: number) => {
      if (
        indexA === indexB ||
        indexA < 0 ||
        indexA >= fields.length ||
        indexB < 0 ||
        indexB >= fields.length
      )
        return

      const newFields = [...fields]
      ;[newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]]

      updateFields(newFields)
    },
    [fields, updateFields]
  )

  /**
   * Replace a field value
   */
  const replace = useCallback(
    (index: number, value: T) => {
      if (index < 0 || index >= fields.length) return

      const newFields = [
        ...fields.slice(0, index),
        { ...fields[index], value },
        ...fields.slice(index + 1),
      ]

      updateFields(newFields)
    },
    [fields, updateFields]
  )

  /**
   * Replace all fields
   */
  const replaceAll = useCallback(
    (values: T[]) => {
      const newFields = values.map((value) => ({
        id: nanoid(),
        value,
      }))

      updateFields(newFields)
    },
    [updateFields]
  )

  /**
   * Update partial field value
   */
  const updateField = useCallback(
    (index: number, value: Partial<T>) => {
      if (index < 0 || index >= fields.length) return

      const newFields = [
        ...fields.slice(0, index),
        {
          ...fields[index],
          value: {
            ...fields[index].value,
            ...value,
          },
        },
        ...fields.slice(index + 1),
      ]

      updateFields(newFields)
    },
    [fields, updateFields]
  )

  /**
   * Get field at index
   */
  const getField = useCallback(
    (index: number): FormField<T> | undefined => {
      return fields[index]
    },
    [fields]
  )

  /**
   * Clear all fields
   */
  const clear = useCallback(() => {
    updateFields([])
    setErrors({})
  }, [updateFields])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setFields(initialFormFields)
    setIsDirty(false)
    setIsTouched(false)
    setErrors({})
  }, [initialFormFields])

  /**
   * Remove and return first field
   */
  const shift = useCallback((): FormField<T> | undefined => {
    if (fields.length === 0 || !canRemove) return undefined

    const [first, ...rest] = fields
    updateFields(rest)

    return first
  }, [fields, canRemove, updateFields])

  /**
   * Remove and return last field
   */
  const pop = useCallback((): FormField<T> | undefined => {
    if (fields.length === 0 || !canRemove) return undefined

    const last = fields[fields.length - 1]
    updateFields(fields.slice(0, -1))

    return last
  }, [fields, canRemove, updateFields])

  /**
   * Add field at beginning (like array.unshift)
   */
  const unshift = useCallback(
    (value: T) => {
      prepend(value)
    },
    [prepend]
  )

  /**
   * Add field at end (like array.push)
   */
  const push = useCallback(
    (value: T) => {
      append(value)
    },
    [append]
  )

  /**
   * Mark as touched
   */
  const touch = useCallback(() => {
    setIsTouched(true)
  }, [])

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (index: number): boolean => {
      if (!options?.validateField) return true

      const field = fields[index]
      if (!field) return true

      const error = options.validateField(field.value, index)

      if (error) {
        setErrors((prev) => ({
          ...prev,
          [index]: error,
        }))
        return false
      } else {
        // Clear error if validation passes
        setErrors((prev) => {
          const next = { ...prev }
          delete next[index]
          return next
        })
        return true
      }
    },
    [fields, options]
  )

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    if (!options?.validateField) return true

    const newErrors: Record<number, string> = {}

    fields.forEach((field, index) => {
      const error = options.validateField!(field.value, index)
      if (error) {
        newErrors[index] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fields, options])

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((index: number, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [index]: error,
    }))
  }, [])

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((index: number) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }, [])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    fields,
    isDirty,
    isTouched,
    errors,
    count,
    canAdd,
    canRemove,
    handlers: {
      append,
      prepend,
      remove,
      insert,
      move,
      swap,
      replace,
      replaceAll,
      updateField,
      getField,
      clear,
      reset,
      shift,
      pop,
      unshift,
      push,
      touch,
      validateField,
      validateAll,
      setFieldError,
      clearFieldError,
      clearErrors,
    },
  }
}

export default useFieldArray
