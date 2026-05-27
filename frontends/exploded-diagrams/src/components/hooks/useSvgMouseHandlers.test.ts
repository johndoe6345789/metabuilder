import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSvgMouseHandlers } from './useSvgMouseHandlers'
import type React from 'react'

function makeSvgEvent(
  targetEl: Element | null
): React.MouseEvent<SVGSVGElement> {
  return {
    target: targetEl ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    nativeEvent: new MouseEvent('mouseover'),
  } as unknown as React.MouseEvent<SVGSVGElement>
}

// Helper: create a .part element with data-part attribute
function makePartElement(partId: string): Element {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.classList.add('part')
  g.setAttribute('data-part', partId)
  return g
}

// Helper: create a child element inside a .part element
function makeChildOfPart(partId: string): Element {
  const part = makePartElement(partId)
  const child = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  part.appendChild(child)
  // Need to attach to DOM for closest() to work
  document.body.appendChild(part)
  return child
}

describe('useSvgMouseHandlers', () => {
  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = ''
  })

  describe('handleMouseOver', () => {
    it('calls onPartHover with partId when hovering over a .part element', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const partEl = makePartElement('bolt-01')
      document.body.appendChild(partEl)
      const event = makeSvgEvent(partEl)
      result.current.handleMouseOver(event)
      expect(onPartHover).toHaveBeenCalledWith('bolt-01', expect.any(MouseEvent))
    })

    it('calls onPartHover when hovering over a child of .part element', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const child = makeChildOfPart('bolt-02')
      const event = makeSvgEvent(child)
      result.current.handleMouseOver(event)
      expect(onPartHover).toHaveBeenCalledWith('bolt-02', expect.any(MouseEvent))
    })

    it('does not call onPartHover when target is not inside a .part element', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.appendChild(svg)
      const event = makeSvgEvent(svg)
      result.current.handleMouseOver(event)
      expect(onPartHover).not.toHaveBeenCalled()
    })
  })

  describe('handleMouseOut', () => {
    it('calls onPartHover(null) when leaving a .part element', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const partEl = makePartElement('nut-01')
      document.body.appendChild(partEl)
      const event = makeSvgEvent(partEl)
      result.current.handleMouseOut(event)
      expect(onPartHover).toHaveBeenCalledWith(null)
    })

    it('does not call onPartHover when leaving a non-part element', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const nonPart = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      document.body.appendChild(nonPart)
      const event = makeSvgEvent(nonPart)
      result.current.handleMouseOut(event)
      expect(onPartHover).not.toHaveBeenCalled()
    })
  })

  describe('handleMouseMove', () => {
    it('calls onPartHover with partId on mouse move over .part', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const partEl = makePartElement('spring-03')
      document.body.appendChild(partEl)
      const event = makeSvgEvent(partEl)
      result.current.handleMouseMove(event)
      expect(onPartHover).toHaveBeenCalledWith('spring-03', expect.any(MouseEvent))
    })

    it('does not call onPartHover when no .part ancestor on mouse move', () => {
      const onPartHover = vi.fn()
      const { result } = renderHook(() => useSvgMouseHandlers({ onPartHover }))

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.appendChild(svg)
      const event = makeSvgEvent(svg)
      result.current.handleMouseMove(event)
      expect(onPartHover).not.toHaveBeenCalled()
    })
  })
})
