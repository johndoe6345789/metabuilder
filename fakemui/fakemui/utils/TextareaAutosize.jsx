import React, { forwardRef, useRef, useEffect, useCallback } from 'react'
import { classNames } from './classNames'

/**
 * TextareaAutosize - A textarea that automatically adjusts height based on content
 */
export const TextareaAutosize = forwardRef(function TextareaAutosize(
  {
    minRows = 1,
    maxRows,
    onChange,
    value,
    defaultValue,
    className,
    style,
    ...props
  },
  ref
) {
  const textareaRef = useRef(null)
  const shadowRef = useRef(null)

  const combinedRef = useCallback(
    (node) => {
      textareaRef.current = node
      if (ref) {
        if (typeof ref === 'function') {
          ref(node)
        } else {
          ref.current = node
        }
      }
    },
    [ref]
  )

  const syncHeight = useCallback(() => {
    const textarea = textareaRef.current
    const shadow = shadowRef.current
    if (!textarea || !shadow) return

    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20

    // Copy styles to shadow textarea
    shadow.style.width = computedStyle.width
    shadow.style.font = computedStyle.font
    shadow.style.letterSpacing = computedStyle.letterSpacing
    shadow.style.padding = computedStyle.padding
    shadow.style.border = computedStyle.border
    shadow.value = textarea.value || textarea.placeholder || 'x'

    const minHeight = lineHeight * minRows
    const maxHeight = maxRows ? lineHeight * maxRows : Infinity

    // Calculate height
    shadow.style.height = 'auto'
    const scrollHeight = shadow.scrollHeight

    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`
    textarea.style.overflow = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [minRows, maxRows])

  useEffect(() => {
    syncHeight()
  }, [value, syncHeight])

  useEffect(() => {
    const handleResize = () => syncHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [syncHeight])

  const handleChange = (e) => {
    syncHeight()
    onChange?.(e)
  }

  return (
    <>
      <textarea
        ref={combinedRef}
        className={classNames('fakemui-textarea-autosize', className)}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        style={{
          resize: 'none',
          overflow: 'hidden',
          ...style,
        }}
        rows={minRows}
        {...props}
      />
      <textarea
        ref={shadowRef}
        className="fakemui-textarea-autosize-shadow"
        tabIndex={-1}
        aria-hidden="true"
        readOnly
        style={{
          position: 'absolute',
          visibility: 'hidden',
          overflow: 'hidden',
          height: 0,
          top: 0,
          left: 0,
          transform: 'translateZ(0)',
        }}
      />
    </>
  )
})

export default TextareaAutosize
