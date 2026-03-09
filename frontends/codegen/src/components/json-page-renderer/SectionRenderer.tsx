import { CSSProperties, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Progress } from '@metabuilder/fakemui/feedback'
import { getIcon } from './utils'
import { LegacyPageSchema, PageSectionConfig } from './types'

/**
 * Resolve a data binding expression against the data context.
 * Uses the same sandboxed Function pattern as expression-helpers.ts:133
 * for developer-authored JSON config bindings (never user input).
 */
function resolveStatBinding(binding: string, data: Record<string, any>): any {
  try {
    const keys = Object.keys(data).filter(k => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k))
    const values = keys.map(k => data[k])
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return (${binding})`)
    return fn(...values)
  } catch {
    return 0
  }
}

interface PageSectionRendererProps {
  index: number
  section: PageSectionConfig
  pageSchema: LegacyPageSchema
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}

export function PageSectionRenderer({
  index,
  section,
  pageSchema,
  data,
  functions,
}: PageSectionRendererProps): ReactNode {
  switch (section.type) {
    case 'header':
      return (
        <HeaderSection
          key={index}
          title={section.title}
          description={section.description}
        />
      )

    case 'cards':
      return (
        <CardSection
          key={index}
          cards={pageSchema[section.items as string] || []}
          spacing={section.spacing}
          data={data}
          functions={functions}
        />
      )

    case 'grid':
      return (
        <GridSection
          key={index}
          items={pageSchema[section.items as string] || []}
          columns={section.columns}
          gap={section.gap}
          data={data}
        />
      )

    default:
      return null
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

function HeaderSection({ title, description }: { title?: string; description?: string }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <h1 style={{ marginBottom: '0.25rem', fontSize: '1.875rem', fontWeight: 700 }}>{title}</h1>
      {description && (
        <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)' }}>{description}</p>
      )}
    </div>
  )
}

// ── Card Section ──────────────────────────────────────────────────────────────

function CardSection({
  cards,
  data,
  functions,
}: {
  cards: any[]
  spacing?: string
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {cards.map((card) => (
        <PageCard key={card.id} card={card} data={data} functions={functions} />
      ))}
    </div>
  )
}

// ── Page Card ─────────────────────────────────────────────────────────────────

function PageCard({
  card,
  data,
  functions,
}: {
  card: any
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  if (card.type === 'gradient-card') {
    return <GradientCard card={card} data={data} functions={functions} />
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
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          {card.component || 'No content'}
        </p>
      </CardContent>
    </Card>
  )
}

// ── Gradient Card (Completion) ────────────────────────────────────────────────

const gradientStyle: CSSProperties = {
  background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, transparent), color-mix(in srgb, var(--accent, var(--primary)) 4%, transparent))',
  borderColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
}

function GradientCard({
  card,
  data,
  functions,
}: {
  card: any
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  const icon = card.icon ? getIcon(card.icon, { size: 24, fill: 1, weight: 500 }) : null
  const computeFn = functions[card.dataSource?.compute]
  const computedData = computeFn ? computeFn(data) : data

  return (
    <Card style={gradientStyle}>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
          {icon && <span style={{ color: 'var(--primary)', display: 'inline-flex' }}>{icon}</span>}
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {card.components?.map((comp: any, idx: number) => (
          <CardSubComponent
            key={`${card.id}-${idx}`}
            component={comp}
            dataContext={computedData}
          />
        ))}
      </CardContent>
    </Card>
  )
}

// ── Build Status Card ─────────────────────────────────────────────────────────

function BuildStatusCard({ card }: { card: any }) {
  const icon = card.icon ? getIcon(card.icon, { size: 24, fill: 1, weight: 500 }) : null

  const checks = [
    { name: 'Build', status: 'passing' },
    { name: 'Type Check', status: 'passing' },
    { name: 'Lint', status: 'passing' },
    { name: 'E2E Tests', status: 'idle' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
          {icon && <span style={{ color: 'var(--primary)', display: 'inline-flex' }}>{icon}</span>}
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {checks.map((check) => (
          <div
            key={check.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm, 0.5rem)',
              backgroundColor: 'color-mix(in srgb, var(--muted) 40%, transparent)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontWeight: 500 }}>{check.name}</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: check.status === 'passing'
                  ? 'var(--mat-sys-primary, #6750a4)'
                  : 'var(--mat-sys-on-surface-variant, #666)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: check.status === 'passing'
                    ? 'var(--mat-sys-primary, #6750a4)'
                    : 'var(--mat-sys-outline, #ccc)',
                }}
              />
              {check.status === 'passing' ? 'Passing' : 'Idle'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Card Sub-Components ───────────────────────────────────────────────────────

function CardSubComponent({
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: component.size === 'large' ? '2.25rem' : '1.5rem',
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--primary)',
            }}
          >
            {component.format === 'percentage' ? `${value}%` : value}
          </span>
        </div>
      )

    case 'badge': {
      const variant =
        value === 'ready' ? component.variants?.ready : component.variants?.inProgress
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
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0 }}>
          {value}
        </p>
      )

    default:
      return null
  }
}

// ── Stat Grid ─────────────────────────────────────────────────────────────────

function GridSection({
  items,
  data,
}: {
  items: any[]
  columns?: { sm?: number; md?: number; lg?: number }
  gap?: string
  data: Record<string, any>
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {items.map((item) => (
        <StatCardRenderer key={item.id} stat={item} data={data} />
      ))}
    </div>
  )
}

// Inline color map — avoids needing Tailwind color classes
const STAT_COLORS: Record<string, string> = {
  'text-blue-500': '#3b82f6',
  'text-purple-500': '#a855f7',
  'text-green-500': '#22c55e',
  'text-orange-500': '#f97316',
  'text-pink-500': '#ec4899',
  'text-cyan-500': '#06b6d4',
}

function StatCardRenderer({ stat, data }: { stat: any; data: Record<string, any> }) {
  const icon = stat.icon ? getIcon(stat.icon, { size: 28, fill: 1, weight: 500 }) : null
  const value = resolveStatBinding(stat.dataBinding, data)
  const color = STAT_COLORS[stat.color] || 'var(--primary)'

  return (
    <Card
      style={{
        padding: 0,
        gap: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              letterSpacing: '0.02em',
            }}
          >
            {stat.title}
          </span>
          {icon && (
            <span style={{ color, display: 'inline-flex' }}>
              {icon}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            lineHeight: 1,
            color: 'var(--foreground)',
          }}
        >
          {value ?? 0}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
          }}
        >
          {stat.description}
        </span>
      </div>
    </Card>
  )
}
