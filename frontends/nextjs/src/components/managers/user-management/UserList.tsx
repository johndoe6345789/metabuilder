'use client'
import { useMemo, useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
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
import { FunnelSimple, PencilSimple, Trash } from '@/fakemui/icons'
import type { User, UserRole } from '@/lib/level-types'
interface UserListProps {
  users: User[]
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  compact?: boolean
}
const ROLE_STYLES: Record<
  UserRole,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  public: { label: 'Public', variant: 'outline' },
  user: { label: 'User', variant: 'outline' },
  moderator: { label: 'Moderator', variant: 'secondary' },
  admin: { label: 'Admin', variant: 'secondary' },
  god: { label: 'God', variant: 'default' },
  supergod: { label: 'Supergod', variant: 'default' },
}

function initials(value: string) {
  return value
    .split(' ')
    .map(chunk => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserList({ users, onEdit, onDelete, compact }: UserListProps) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<UserRole | 'all'>('all')

  const filtered = useMemo(() => {
    return users.filter(user => {
      const matchesQuery = `${user.username} ${user.email}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesRole = role === 'all' || user.role === role
      return matchesQuery && matchesRole
    })
  }, [users, query, role])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="user-search">Search users</Label>
          <Input
            id="user-search"
            placeholder="Search by name or email"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="flex items-center gap-2" htmlFor="role-filter">
            <FunnelSimple size={16} /> Role filter
          </Label>
          <select
            id="role-filter"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={event => setRole(event.target.value as UserRole | 'all')}
          >
            <option value="all">All roles</option>
            {Object.entries(ROLE_STYLES).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-32">Role</TableHead>
              <TableHead className="w-40">Joined</TableHead>
              {(onEdit || onDelete) && <TableHead className="w-28 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(user => (
              <TableRow key={user.id} className={compact ? 'text-sm' : undefined}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {user.profilePicture && <img alt={user.username} src={user.profilePicture} />}
                    <AvatarFallback>{initials(user.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_STYLES[user.role]?.variant}>
                    {ROLE_STYLES[user.role]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="flex justify-end gap-2">
                    {onEdit && (
                      <Button size="icon" variant="outline" onClick={() => onEdit(user)}>
                        <PencilSimple size={16} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="icon" variant="ghost" onClick={() => onDelete(user)}>
                        <Trash size={16} />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No users match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
