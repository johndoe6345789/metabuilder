import { useMemo } from 'react'

import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { ChatCircle, MagnifyingGlass, PencilSimple, Trash, Users } from '@/fakemui/icons'
import type { User } from '@/lib/level-types'

import { ChallengePanel } from '../sections/ChallengePanel'

interface UserTableProps {
  users: User[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  currentUserId: string
  commentCount: number
  commentLabel: string
}

export function UserTable({
  users,
  searchTerm,
  onSearchChange,
  onEditUser,
  onDeleteUser,
  currentUserId,
  commentCount,
  commentLabel,
}: UserTableProps) {
  const filteredUsers = useMemo(
    () =>
      users.filter(
        u =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  )

  return (
    <ChallengePanel title="Models" description="Browse and manage data models">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} /> {users.length}
          <ChatCircle size={16} /> {commentLabel} {commentCount}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      u.role === 'god' ? 'default' : u.role === 'admin' ? 'secondary' : 'outline'
                    }
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEditUser(u)}>
                      <PencilSimple size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(u.id)}
                      disabled={u.id === currentUserId}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ChallengePanel>
  )
}
