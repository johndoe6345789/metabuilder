import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { getIcon, resolveBinding } from './utils'
import { LegacyPageSchema, PageSectionConfig } from './types'

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

interface HeaderSectionProps {
  title?: string
  description?: string
}

function HeaderSection({ title, description }: HeaderSectionProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

interface CardSectionProps {
  cards: any[]
  spacing?: string
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}

function CardSection({ cards, spacing, data, functions }: CardSectionProps) {
  return (
    <div className={cn('space-y-' + (spacing || '4'))}>
      {cards.map((card) => (
        <PageCard
          key={card.id}
          card={card}
          data={data}
          functions={functions}
        />
      ))}
    </div>
  )
}

interface PageCardProps {
  card: any
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}

function PageCard({ card, data, functions }: PageCardProps) {
  const icon = card.icon ? getIcon(card.icon) : null

  if (card.type === 'gradient-card') {
    const computeFn = functions[card.dataSource?.compute]
    const computedData = computeFn ? computeFn(data) : data

    return (
      <Card className={cn('bg-gradient-to-br border-primary/20', card.gradient)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {card.title}
          </CardTitle>
          <CardDescription>{card.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomComponentPlaceholder
          componentName={card.component}
          props={card.props || {}}
        />
      </CardContent>
    </Card>
  )
}

interface CardSubComponentProps {
  component: any
  dataContext: Record<string, any>
}

function CardSubComponent({ component, dataContext }: CardSubComponentProps) {
  const value = dataContext[component.binding]

  switch (component.type) {
    case 'metric':
      return (
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'font-bold',
              component.size === 'large' ? 'text-4xl' : 'text-2xl'
            )}
          >
            {component.format === 'percentage' ? `${value}%` : value}
          </span>
        </div>
      )

    case 'badge': {
      const variant =
        value === 'ready' ? component.variants?.ready : component.variants?.inProgress
      return (
        <Badge variant={variant?.variant as any}>
          {variant?.label}
        </Badge>
      )
    }

    case 'progress':
      return <Progress value={value} className="h-3" />

    case 'text':
      return <p className={component.className}>{value}</p>

    default:
      return null
  }
}

interface GridSectionProps {
  items: any[]
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
  gap?: string
  data: Record<string, any>
}

function GridSection({ items, columns, gap, data }: GridSectionProps) {
  const { sm = 1, md = 2, lg = 3 } = columns || {}

  return (
    <div
      className={cn(
        'grid gap-' + (gap || '4'),
        `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg}`
      )}
    >
      {items.map((item) => (
        <StatCardRenderer key={item.id} stat={item} data={data} />
      ))}
    </div>
  )
}

interface StatCardRendererProps {
  stat: any
  data: Record<string, any>
}

function StatCardRenderer({ stat, data }: StatCardRendererProps) {
  const icon = stat.icon ? getIcon(stat.icon) : undefined
  const value = resolveBinding(stat.dataBinding, data)
  const description = `${value} ${stat.description}`

  return (
    <StatCard
      icon={icon}
      title={stat.title}
      value={value}
      description={description}
      color={stat.color}
    />
  )
}

interface CustomComponentPlaceholderProps {
  componentName?: string
  props: Record<string, any>
}

function CustomComponentPlaceholder({ componentName }: CustomComponentPlaceholderProps) {
  return <div>Custom component: {componentName}</div>
}
