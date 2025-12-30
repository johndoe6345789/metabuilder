'use client'

import { ArrowsLeftRight } from '@/fakemui/icons'
import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui'
import { fetchPowerTransferRequests } from '@/lib/api/power-transfers'
import type { PowerTransferRequest, User } from '@/lib/level-types'

import { CriticalActionNotice, TransferHistory, UserSelectionList } from './sections'

interface PowerTransferTabProps {
  currentUser: User
  allUsers: User[]
  onInitiateTransfer: (userId: string) => void
  refreshSignal?: number
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
        <CriticalActionNotice />

        <Separator className="bg-white/10" />

        <UserSelectionList
          users={highlightedUsers}
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />

        <TransferHistory
          requests={requests}
          getUserLabel={getUserLabel}
          isLoading={isLoadingRequests}
          requestError={requestError}
        />

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
