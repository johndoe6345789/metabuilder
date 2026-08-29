import { describe, expect, it } from 'vitest'

import { getBezierPath, Position } from './flow'

const between = (over: Record<string, unknown> = {}) =>
  getBezierPath({
    sourceX: 0,
    sourceY: 0,
    sourcePosition: Position.Right,
    targetX: 100,
    targetY: 0,
    targetPosition: Position.Left,
    ...over,
  })

/** The four numbers in `C x1,y1 x2,y2 x,y`. */
const controls = (path: string): number[] =>
  (path.split('C')[1] ?? '')
    .trim()
    .split(/[ ,]/)
    .map(Number)

describe('getBezierPath', () => {
  it('starts at the source and ends at the target', () => {
    const [path] = between()
    expect(path.startsWith('M0,0 ')).toBe(true)
    expect(path.endsWith(' 100,0')).toBe(true)
  })

  it('reports the midpoint between the two ends', () => {
    const [, centerX, centerY] = between({ targetX: 100, targetY: 50 })
    expect([centerX, centerY]).toEqual([50, 25])
  })

  it('reports the midpoint for a target behind the source', () => {
    const [, centerX] = between({ sourceX: 100, targetX: 0 })
    expect(centerX).toBe(50)
  })

  // Each side's control point is pushed out along the handle's own
  // direction, which is what keeps the curve leaving the node squarely.
  it('pushes the control points along each handle direction', () => {
    const [path] = between()
    const [x1, y1, x2, y2] = controls(path)
    expect(x1).toBeGreaterThan(0)
    expect(y1).toBe(0)
    expect(x2).toBeLessThan(100)
    expect(y2).toBe(0)
  })

  it.each([
    [Position.Top, 0, -1],
    [Position.Bottom, 0, 1],
    [Position.Left, -1, 0],
    [Position.Right, 1, 0],
  ])('offsets a %s handle by (%i, %i)', (sourcePosition, dx, dy) => {
    const [path] = between({ sourcePosition })
    const [x1, y1] = controls(path)
    expect(Math.sign(x1 ?? 0)).toBe(dx)
    expect(Math.sign(y1 ?? 0)).toBe(dy)
  })

  it('curves more as the curvature rises', () => {
    const gentle = controls(between({ curvature: 0.1 })[0])[0] ?? 0
    const sharp = controls(between({ curvature: 0.9 })[0])[0] ?? 0
    expect(sharp).toBeGreaterThan(gentle)
  })

  it('still curves at zero distance, so two stacked nodes join', () => {
    const [path] = between({ targetX: 0, targetY: 0 })
    expect(controls(path)[0]).toBeGreaterThan(0)
  })

  it('scales the offset with the distance once past the floor', () => {
    const near = controls(between({ targetX: 100 })[0])[0] ?? 0
    const far = controls(between({ targetX: 1000 })[0])[0] ?? 0
    expect(far).toBeGreaterThan(near)
  })

  it('defaults the curvature when none is given', () => {
    expect(controls(between()[0])[0]).toBe(controls(
      between({ curvature: 0.25 })[0]
    )[0])
  })
})
