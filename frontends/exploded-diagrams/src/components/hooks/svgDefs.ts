import type { Materials } from '@/lib/types'

export function buildSvgDefs(materials: Materials): string {
  let defs = '<defs>'
  Object.entries(materials).forEach(([id, mat]) => {
    const g = mat.gradient
    const angle = g.angle || 0
    const rad = angle * Math.PI / 180
    const x2 = Math.round(50 + Math.cos(rad) * 50)
    const y2 = Math.round(50 + Math.sin(rad) * 50)
    defs +=
      `<linearGradient id="grad-${id}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">`
    g.stops.forEach(s => {
      defs += `<stop offset="${s.offset}%" stop-color="${s.color}"/>`
    })
    defs += '</linearGradient>'
  })
  defs += `
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.2"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feFlood flood-color="#00d4ff" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
  defs += '</defs>'
  return defs
}
