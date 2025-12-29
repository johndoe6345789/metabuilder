'use client'
import { useMemo, useState } from 'react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Clock, ShieldWarning, UserSwitch } from '@phosphor-icons/react'
export type AuditSeverity = 'info' | 'warning' | 'critical'
export interface AuditEvent {
  id: string
  actor: string
  action: string
  target?: string
  timestamp: string | number
  severity: AuditSeverity
}
interface AuditTrailProps {
  events: AuditEvent[]
  showSearch?: boolean
  maxRows?: number
}
const SEVERITY_META: Record<
  AuditSeverity,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  info: { label: 'Info', variant: 'secondary' },
  warning: { label: 'Warning', variant: 'default' },
  critical: { label: 'Critical', variant: 'destructive' },
}
const formatTime = (value: string | number) => new Date(value).toLocaleString()
export function AuditTrail({ events, showSearch = true, maxRows }: AuditTrailProps) {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<AuditSeverity | 'all'>('all')
  const filtered = useMemo(() => {
    const text = query.toLowerCase()
    return events
      .filter(event => {
        const matchesText =
          !text ||
          `${event.actor} ${event.action} ${event.target ?? ''}`.toLowerCase().includes(text)
        const matchesSeverity = severity === 'all' || event.severity === severity
        return matchesText && matchesSeverity
      })
      .slice(0, maxRows ?? events.length)
  }, [events, query, severity, maxRows])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>Recent security-sensitive actions.</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <UserSwitch size={14} />
            {events.length} events
          </Badge>
        </div>
        {showSearch && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="audit-query">Search</Label>
              <Input
                id="audit-query"
                placeholder="Filter by actor or action"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-severity">Severity</Label>
              <select
                id="audit-severity"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={severity}
                onChange={event => setSeverity(event.target.value as AuditSeverity | 'all')}
              >
                <option value="all">All events</option>
                {Object.entries(SEVERITY_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-32">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(event => (
                <TableRow key={event.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {formatTime(event.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.actor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.action}
                    {event.target && (
                      <span className="ml-2 rounded bg-muted px-2 py-1 text-xs text-foreground">
                        {event.target}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={SEVERITY_META[event.severity].variant} className="gap-1">
                      <ShieldWarning size={14} />
                      {SEVERITY_META[event.severity].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No audit events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
