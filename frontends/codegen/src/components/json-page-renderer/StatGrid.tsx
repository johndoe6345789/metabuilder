/**
 * StatGrid.tsx
 *
 * StatCardRenderer and GridSection extracted from
 * SectionRenderer.tsx.
 */

import React from 'react'
import { Card } from '@metabuilder/fakemui/surfaces'
import { getIcon } from './utils'

/**
 * Inline color map — avoids needing Tailwind color
 * classes for stat card icons.
 */
const STAT_COLORS: Record<string, string> = {
  'text-blue-500': '#3b82f6',
  'text-purple-500': '#a855f7',
  'text-green-500': '#22c55e',
  'text-orange-500': '#f97316',
  'text-pink-500': '#ec4899',
  'text-cyan-500': '#06b6d4',
}

/**
 * Resolve a data binding expression against the data
 * context. Sandboxed Function pattern for dev-authored
 * JSON config (never user input).
 */
function resolveStatBinding(
  binding: string,
  data: Record<string, any>
): any {
  try {
    const keys = Object.keys(data).filter((k) =>
      /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)
    )
    const values = keys.map((k) => data[k])
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      ...keys,
      `return (${binding})`
    )
    return fn(...values)
  } catch {
    return 0
  }
}

export function GridSection({
  items,
  data,
}: {
  items: any[]
  columns?: { sm?: number; md?: number; lg?: number }
  gap?: string
  data: Record<string, any>
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    }}>
      {items.map((item) => (
        <StatCardRenderer
          key={item.id}
          stat={item}
          data={data}
        />
      ))}
    </div>
  )
}

function StatCardRenderer({
  stat,
  data,
}: {
  stat: any
  data: Record<string, any>
}) {
  const icon = stat.icon
    ? getIcon(stat.icon, {
        size: 28,
        fill: 1,
        weight: 500,
      })
    : null
  const value = resolveStatBinding(
    stat.dataBinding,
    data
  )
  const color =
    STAT_COLORS[stat.color] || 'var(--primary)'

  return (
    <Card style={{ padding: 0, gap: 0 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1.25rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            letterSpacing: '0.02em',
          }}>
            {stat.title}
          </span>
          {icon && (
            <span style={{
              color,
              display: 'inline-flex',
            }}>
              {icon}
            </span>
          )}
        </div>
        <span style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--foreground)',
        }}>
          {value ?? 0}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--muted-foreground)',
        }}>
          {stat.description}
        </span>
      </div>
    </Card>
  )
}
