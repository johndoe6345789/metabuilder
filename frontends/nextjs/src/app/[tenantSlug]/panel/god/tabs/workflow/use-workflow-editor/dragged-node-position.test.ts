import { describe, it, expect } from 'vitest'
import { draggedNodePosition } from './dragged-node-position'

describe('draggedNodePosition', () => {
  it('adds the raw delta at 1x zoom', () => {
    expect(draggedNodePosition({ x: 10, y: 20 }, 5, -5, 1)).toEqual({
      x: 15,
      y: 15,
    })
  })

  it('scales the delta down when zoomed in', () => {
    expect(draggedNodePosition({ x: 0, y: 0 }, 100, 100, 2)).toEqual({
      x: 50,
      y: 50,
    })
  })

  it('scales the delta up when zoomed out', () => {
    expect(draggedNodePosition({ x: 0, y: 0 }, 30, 30, 0.5)).toEqual({
      x: 60,
      y: 60,
    })
  })

  it('leaves the origin unchanged with no movement', () => {
    expect(draggedNodePosition({ x: 42, y: 7 }, 0, 0, 1.5)).toEqual({
      x: 42,
      y: 7,
    })
  })
})
