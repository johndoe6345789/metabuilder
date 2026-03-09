export enum Position {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

interface BezierPathParams {
  sourceX: number
  sourceY: number
  sourcePosition: Position
  targetX: number
  targetY: number
  targetPosition: Position
  curvature?: number
}

function getControlOffset(distance: number, curvature: number): number {
  return distance * curvature
}

function getDirection(position: Position): { x: number; y: number } {
  switch (position) {
    case Position.Top: return { x: 0, y: -1 }
    case Position.Bottom: return { x: 0, y: 1 }
    case Position.Left: return { x: -1, y: 0 }
    case Position.Right: return { x: 1, y: 0 }
  }
}

export function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  curvature = 0.25,
}: BezierPathParams): [string, number, number] {
  const distX = Math.abs(targetX - sourceX)
  const distY = Math.abs(targetY - sourceY)
  const dist = Math.sqrt(distX * distX + distY * distY)

  const offsetFactor = Math.max(dist, 100)
  const offset = getControlOffset(offsetFactor, curvature)

  const sourceDir = getDirection(sourcePosition)
  const targetDir = getDirection(targetPosition)

  const sourceControlX = sourceX + sourceDir.x * offset
  const sourceControlY = sourceY + sourceDir.y * offset
  const targetControlX = targetX + targetDir.x * offset
  const targetControlY = targetY + targetDir.y * offset

  const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`

  const centerX = (sourceX + targetX) / 2
  const centerY = (sourceY + targetY) / 2

  return [path, centerX, centerY]
}
