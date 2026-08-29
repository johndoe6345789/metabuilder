'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/m3'
import type { UserRecord } from './admin-types'
import { UserRow } from './UserRow'
import s from './page.module.scss'

const COLUMNS = ['Username', 'Email', 'Role', 'Created']

export interface UsersTableProps {
  users: UserRecord[]
  emptyMessage: string
  onDelete: (user: UserRecord) => void
}

export function UsersTable({ users, emptyMessage, onDelete }: UsersTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {COLUMNS.map(column => (
              <TableCell key={column}>{column}</TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className={s.emptyCell}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <UserRow key={user.id} user={user} onDelete={onDelete} />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
