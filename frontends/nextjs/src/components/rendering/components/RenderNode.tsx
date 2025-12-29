import type React from 'react'
import type { ComponentInstance } from '@/lib/types/builder-types'
import {
  Button,
  Input,
  Textarea,
  Label,
  Badge,
  Card,
  Switch,
  Checkbox,
  Separator,
  Alert,
  Progress,
  Slider,
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { IRCWebchatDeclarative } from '@/components/IRCWebchatDeclarative'
import { NotificationSummaryCard } from '@/components/NotificationSummaryCard'
import type { User } from '@/lib/level-types'
import { getDeclarativeRenderer } from '@/lib/declarative-component-renderer'

interface RenderNodeProps {
  component: ComponentInstance
  renderChildren: () => React.ReactNode
  user?: User
}

export function RenderNode({ component, renderChildren, user }: RenderNodeProps) {
  const { type, props } = component
  const renderer = getDeclarativeRenderer()

  if (renderer.hasComponentConfig(type)) {
    if (type === 'IRCWebchat' && user) {
      return (
        <IRCWebchatDeclarative
          user={user}
          channelName={props.channelName || 'general'}
          onClose={props.onClose}
        />
      )
    }

    return (
      <div className="p-4 border-2 border-dashed border-accent">
        Declarative Component: {type}
        <div className="text-xs text-muted-foreground mt-2">
          This is a package-defined component
        </div>
      </div>
    )
  }

  switch (type) {
    case 'Container':
      return <div className={props.className || 'p-4'}>{renderChildren()}</div>

    case 'Flex':
      return <div className={props.className || 'flex gap-4'}>{renderChildren()}</div>

    case 'Grid':
      return <div className={props.className || 'grid grid-cols-2 gap-4'}>{renderChildren()}</div>

    case 'Stack':
      return <div className={props.className || 'flex flex-col gap-2'}>{renderChildren()}</div>

    case 'Card':
      return <Card className={props.className || 'p-6'}>{renderChildren()}</Card>

    case 'NotificationSummary':
      return (
        <NotificationSummaryCard
          title={props.title}
          subtitle={props.subtitle}
          totalLabel={props.totalLabel}
          items={props.items}
        />
      )

    case 'Button':
      return (
        <Button variant={props.variant} size={props.size}>
          {props.children || 'Button'}
        </Button>
      )

    case 'Input':
      return <Input placeholder={props.placeholder} type={props.type} />

    case 'Textarea':
      return <Textarea placeholder={props.placeholder} rows={props.rows} />

    case 'Label':
      return <Label>{props.children || 'Label'}</Label>

    case 'Heading': {
      const level = props.level || '1'
      const className = props.className
      const text = props.children || 'Heading'

      if (level === '1') return <h1 className={className}>{text}</h1>
      if (level === '2') return <h2 className={className}>{text}</h2>
      if (level === '3') return <h3 className={className}>{text}</h3>
      if (level === '4') return <h4 className={className}>{text}</h4>
      return <h1 className={className}>{text}</h1>
    }

    case 'Text':
      return <p className={props.className}>{props.children || 'Text'}</p>

    case 'Badge':
      return <Badge variant={props.variant}>{props.children || 'Badge'}</Badge>

    case 'Switch':
      return <Switch />

    case 'Checkbox':
      return <Checkbox />

    case 'Separator':
      return <Separator />

    case 'Alert':
      return <Alert variant={props.variant}>{renderChildren()}</Alert>

    case 'Progress':
      return <Progress value={props.value || 50} />

    case 'Slider':
      return (
        <Slider
          defaultValue={props.defaultValue || [50]}
          max={props.max || 100}
          step={props.step || 1}
        />
      )

    case 'Avatar':
      return (
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )

    case 'Table':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

    default:
      return <div className="p-4 border-2 border-dashed">Unknown Component: {type}</div>
  }
}
