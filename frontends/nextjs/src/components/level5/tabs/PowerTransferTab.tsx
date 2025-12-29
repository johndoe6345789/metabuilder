'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Crown, ArrowsLeftRight } from '@phosphor-icons/react'
import type { PowerTransferRequest, User } from '@/lib/level-types'
import { fetchPowerTransferRequests } from '@/lib/api/power-transfers'

interface PowerTransferTabProps {
  currentUser: User
  allUsers: User[]
  onInitiateTransfer: (userId: string) => void
  refreshSignal?: number
}

const STATUS_VARIANTS: Record<
  PowerTransferRequest['status'],
  'default' | 'secondary' | 'destructive'
> = {
  accepted: 'default',
  pending: 'secondary',
  rejected: 'destructive',
}

export function PowerTransferTab({
  currentUser,
  allUsers,
  onInitiateTransfer,
  refreshSignal = 0,
}: PowerTransferTabProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [requests, setRequests] = useState<PowerTransferRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)

  const highlightedUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'supergod')

  useEffect(() => {
    let isActive = true
    const reload = async () => {
      setIsLoadingRequests(true)
      setRequestError(null)
      try {
        const payload = await fetchPowerTransferRequests()
        if (isActive) {
          setRequests(payload)
        }
      } catch (error) {
        if (isActive) {
          setRequestError(
            error instanceof Error ? error.message : 'Unable to load transfer history'
          )
        }
      } finally {
        if (isActive) {
          setIsLoadingRequests(false)
        }
      }
    }

    reload()

    return () => {
      isActive = false
    }
  }, [refreshSignal])

  const sortedRequests = [...requests].sort((a, b) => b.createdAt - a.createdAt)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatExpiry = (expiresAt: number) => {
    const diff = expiresAt - Date.now()
    if (diff <= 0) {
      return 'Expired'
    }
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}m ${seconds}s remaining`
  }

  const getUserLabel = (userId: string) => {
    const user = allUsers.find(u => u.id === userId)
    return user ? user.username : userId
  }

  return (
    <Card className="bg-black/40 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Transfer Super God Power</CardTitle>
        <CardDescription className="text-gray-400">
          Transfer your Super God privileges to another user. You will be downgraded to God.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex gap-3">
            <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" weight="fill" />
            <div>
              <h4 className="font-semibold text-amber-200 mb-1">Critical Action</h4>
              <p className="text-sm text-amber-300/80">
                This action cannot be undone. Only one Super God can exist at a time. After
                transfer, you will have God-level access only.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <h4 className="font-semibold text-white">Select User to Transfer Power To:</h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {highlightedUsers.map(user => (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-all ${
                    selectedUserId === user.id
                      ? 'bg-purple-600/30 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Recent transfers</h4>
            {isLoadingRequests && (
              <span className="text-xs text-muted-foreground">Refreshing...</span>
            )}
          </div>

          {requestError && (
            <Alert variant="destructive">
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[260px]">
            <div className="space-y-3 p-2">
              {sortedRequests.length === 0 && !isLoadingRequests ? (
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

        <Button
          onClick={() => onInitiateTransfer(selectedUserId)}
          disabled={!selectedUserId}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
          size="lg"
        >
          <ArrowsLeftRight className="w-5 h-5 mr-2" />
          Initiate Power Transfer
        </Button>
      </CardContent>
    </Card>
  )
}
