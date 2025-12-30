'use client'

import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
} from '@/components/ui'
import { Crown } from '@/fakemui/icons'
import type { PowerTransferRequest, User } from '@/lib/level-types'

const STATUS_VARIANTS: Record<
  PowerTransferRequest['status'],
  'default' | 'secondary' | 'destructive'
> = {
  accepted: 'default',
  pending: 'secondary',
  rejected: 'destructive',
}

export const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString()

export const formatExpiry = (expiresAt: number) => {
  const diff = expiresAt - Date.now()
  if (diff <= 0) {
    return 'Expired'
  }
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes}m ${seconds}s remaining`
}

export function CriticalActionNotice() {
  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex gap-3">
        <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" weight="fill" />
        <div>
          <h4 className="font-semibold text-amber-200 mb-1">Critical Action</h4>
          <p className="text-sm text-amber-300/80">
            This action cannot be undone. Only one Super God can exist at a time. After transfer,
            you will have God-level access only.
          </p>
        </div>
      </div>
    </div>
  )
}

interface UserSelectionListProps {
  users: User[]
  selectedUserId: string
  onSelect: (userId: string) => void
}

export function UserSelectionList({ users, selectedUserId, onSelect }: UserSelectionListProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-white">Select User to Transfer Power To:</h4>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {users.map(user => (
            <Card
              key={user.id}
              className={`cursor-pointer transition-all ${
                selectedUserId === user.id
                  ? 'bg-purple-600/30 border-purple-500'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => onSelect(user.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-gray-300 border-gray-500/50">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface TransferHistoryProps {
  requests: PowerTransferRequest[]
  getUserLabel: (userId: string) => string
  isLoading: boolean
  requestError: string | null
}

export function TransferHistory({
  requests,
  getUserLabel,
  isLoading,
  requestError,
}: TransferHistoryProps) {
  const sortedRequests = [...requests].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">Recent transfers</h4>
        {isLoading && <span className="text-xs text-muted-foreground">Refreshing...</span>}
      </div>

      {requestError && (
        <Alert variant="destructive">
          <AlertDescription>{requestError}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-[260px]">
        <div className="space-y-3 p-2">
          {sortedRequests.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No transfer history available.</p>
          ) : (
            sortedRequests.map(request => (
              <Card key={request.id} className="bg-white/5 border-white/10">
                <CardHeader className="flex items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base text-white">
                      Transfer to {getUserLabel(request.toUserId)}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Requested by {getUserLabel(request.fromUserId)}
                    </CardDescription>
                  </div>
                  <Badge variant={STATUS_VARIANTS[request.status]}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {formatDate(request.createdAt)}</p>
                  <p>Expires: {formatDate(request.expiresAt)}</p>
                  <p>{formatExpiry(request.expiresAt)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
