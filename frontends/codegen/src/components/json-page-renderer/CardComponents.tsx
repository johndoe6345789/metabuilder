/**
 * CardComponents.tsx
 *
 * Pure card sub-components for SectionRenderer:
 *   PageCard, GradientCard, BuildStatusCard,
 *   CardSubComponent
 */

import { CSSProperties } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@metabuilder/m3/surfaces'
import {
  Badge,
} from '@metabuilder/m3/data-display'
import { Progress } from '@metabuilder/m3/feedback'
import { getIcon } from './utils'

// ── Build status checks (hardcoded placeholder) ───────────

const BUILD_CHECKS = [
  { name: 'Build', status: 'passing' },
  { name: 'Type Check', status: 'passing' },
  { name: 'Lint', status: 'passing' },
  { name: 'E2E Tests', status: 'idle' },
]

// ── Gradient card style ───────────────────────────────────

const gradientStyle: CSSProperties = {
  background:
    'linear-gradient(135deg,' +
    ' color-mix(in srgb, var(--primary) 6%,' +
    ' transparent),' +
    ' color-mix(in srgb,' +
    ' var(--accent, var(--primary)) 4%,' +
    ' transparent))',
  borderColor:
    'color-mix(in srgb, var(--primary) 15%,' +
    ' transparent)',
}

// ── PageCard ──────────────────────────────────────────────

export function PageCard({
  card,
  data,
  functions,
}: {
  card: any
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  if (card.type === 'gradient-card') {
    return (
      <GradientCard
        card={card}
        data={data}
        functions={functions}
      />
    )
  }
  if (card.component === 'GitHubBuildStatus') {
    return <BuildStatusCard card={card} />
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted-foreground)',
        }}>
          {card.component || 'No content'}
        </p>
      </CardContent>
    </Card>
  )
}

// ── GradientCard ──────────────────────────────────────────

function GradientCard({
  card,
  data,
  functions,
}: {
  card: any
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  const icon = card.icon
    ? getIcon(card.icon, { size: 24, fill: 1, weight: 500 })
    : null
  const computeFn =
    functions[card.dataSource?.compute]
  const computedData = computeFn
    ? computeFn(data)
    : data

  return (
    <Card style={gradientStyle}>
      <CardHeader>
        <CardTitle style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
        }}>
          {icon && (
            <span style={{
              color: 'var(--primary)',
              display: 'inline-flex',
            }}>
              {icon}
            </span>
          )}
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {card.components?.map(
          (comp: any, idx: number) => (
            <CardSubComponent
              key={`${card.id}-${idx}`}
              component={comp}
              dataContext={computedData}
            />
          )
        )}
      </CardContent>
    </Card>
  )
}

// ── BuildStatusCard ───────────────────────────────────────

function BuildStatusCard({ card }: { card: any }) {
  const icon = card.icon
    ? getIcon(card.icon, { size: 24, fill: 1, weight: 500 })
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
        }}>
          {icon && (
            <span style={{
              color: 'var(--primary)',
              display: 'inline-flex',
            }}>
              {icon}
            </span>
          )}
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
      }}>
        {BUILD_CHECKS.map((check) => (
          <div
            key={check.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius:
                'var(--radius-sm, 0.5rem)',
              backgroundColor:
                'color-mix(in srgb,' +
                ' var(--muted) 40%, transparent)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontWeight: 500 }}>
              {check.name}
            </span>
            <CheckStatusBadge status={check.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function CheckStatusBadge({
  status,
}: {
  status: string
}) {
  const passing = status === 'passing'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontSize: '0.8rem',
      fontWeight: 500,
      color: passing
        ? 'var(--mat-sys-primary, #6750a4)'
        : 'var(--mat-sys-on-surface-variant, #666)',
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: passing
          ? 'var(--mat-sys-primary, #6750a4)'
          : 'var(--mat-sys-outline, #ccc)',
      }} />
      {passing ? 'Passing' : 'Idle'}
    </span>
  )
}

// ── CardSubComponent ──────────────────────────────────────

export function CardSubComponent({
  component,
  dataContext,
}: {
  component: any
  dataContext: Record<string, any>
}) {
  const value = dataContext[component.binding]

  switch (component.type) {
    case 'metric':
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{
            fontSize:
              component.size === 'large'
                ? '2.25rem'
                : '1.5rem',
            fontWeight: 700,
            lineHeight: 1,
            color: 'var(--primary)',
          }}>
            {component.format === 'percentage'
              ? `${value}%`
              : value}
          </span>
        </div>
      )

    case 'badge': {
      const variant =
        value === 'ready'
          ? component.variants?.ready
          : component.variants?.inProgress
      return (
        <div>
          <Badge variant={variant?.variant as any}>
            {variant?.label}
          </Badge>
        </div>
      )
    }

    case 'progress':
      return <Progress value={value} />

    case 'text':
      return (
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--muted-foreground)',
          margin: 0,
        }}>
          {value}
        </p>
      )

    default:
      return null
  }
}
