import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from './classNames'

/**
 * Popper - A low-level utility component for positioning floating elements
 */
export function Popper({
  anchorEl,
  children,
  container,
  disablePortal = false,
  keepMounted = false,
  modifiers = [],
  open = false,
  placement = 'bottom',
  popperOptions = {},
  popperRef,
  transition = false,
  className,
  style,
  ...props
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [actualPlacement, setActualPlacement] = useState(placement)
  const popperElementRef = useRef(null)

  useEffect(() => {
    if (!open || !anchorEl) return

    const updatePosition = () => {
      const anchor = typeof anchorEl === 'function' ? anchorEl() : anchorEl
      if (!anchor) return

      const anchorRect = anchor.getBoundingClientRect()
      const popperElement = popperElementRef.current
      const popperRect = popperElement?.getBoundingClientRect() || { width: 0, height: 0 }

      let top = 0
      let left = 0
      let finalPlacement = placement

      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = anchorRect.top - popperRect.height
          left = anchorRect.left + (anchorRect.width - popperRect.width) / 2
          break
        case 'top-start':
          top = anchorRect.top - popperRect.height
          left = anchorRect.left
          break
        case 'top-end':
          top = anchorRect.top - popperRect.height
          left = anchorRect.right - popperRect.width
          break
        case 'bottom':
          top = anchorRect.bottom
          left = anchorRect.left + (anchorRect.width - popperRect.width) / 2
          break
        case 'bottom-start':
          top = anchorRect.bottom
          left = anchorRect.left
          break
        case 'bottom-end':
          top = anchorRect.bottom
          left = anchorRect.right - popperRect.width
          break
        case 'left':
          top = anchorRect.top + (anchorRect.height - popperRect.height) / 2
          left = anchorRect.left - popperRect.width
          break
        case 'left-start':
          top = anchorRect.top
          left = anchorRect.left - popperRect.width
          break
        case 'left-end':
          top = anchorRect.bottom - popperRect.height
          left = anchorRect.left - popperRect.width
          break
        case 'right':
          top = anchorRect.top + (anchorRect.height - popperRect.height) / 2
          left = anchorRect.right
          break
        case 'right-start':
          top = anchorRect.top
          left = anchorRect.right
          break
        case 'right-end':
          top = anchorRect.bottom - popperRect.height
          left = anchorRect.right
          break
        default:
          top = anchorRect.bottom
          left = anchorRect.left
      }

      // Add scroll offset
      top += window.scrollY
      left += window.scrollX

      setPosition({ top, left })
      setActualPlacement(finalPlacement)
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, anchorEl, placement])

  if (!open && !keepMounted) {
    return null
  }

  const content = (
    <div
      ref={(node) => {
        popperElementRef.current = node
        if (popperRef) {
          if (typeof popperRef === 'function') {
            popperRef(node)
          } else {
            popperRef.current = node
          }
        }
      }}
      className={classNames('fakemui-popper', className, {
        'fakemui-popper-hidden': !open,
      })}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        ...style,
      }}
      data-popper-placement={actualPlacement}
      {...props}
    >
      {typeof children === 'function'
        ? children({ placement: actualPlacement, TransitionProps: transition ? { in: open } : undefined })
        : children}
    </div>
  )

  if (disablePortal) {
    return content
  }

  const containerElement = container
    ? (typeof container === 'function' ? container() : container)
    : document.body

  return createPortal(content, containerElement)
}

export default Popper
