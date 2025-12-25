import { useState } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Crown, ArrowsLeftRight } from '@phosphor-icons/react'
import type { User } from '@/lib/level-types'

interface PowerTransferTabProps {
  currentUser: User
  allUsers: User[]
  onInitiateTransfer: (userId: string) => void
}

export function PowerTransferTab({ currentUser, allUsers, onInitiateTransfer }: PowerTransferTabProps) {
  const [selectedUserId, setSelectedUserId] = useState('')

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
                This action cannot be undone. Only one Super God can exist at a time. After transfer, you will have God-level access only.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <h4 className="font-semibold text-white">Select User to Transfer Power To:</h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {allUsers
                .filter(u => u.id !== currentUser.id && u.role !== 'supergod')
                .map(u => (
                  <Card
                    key={u.id}
                    className={`cursor-pointer transition-all ${
                      selectedUserId === u.id
                        ? 'bg-purple-600/30 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{u.username}</p>
                          <p className="text-sm text-gray-400">{u.email}</p>
                        </div>
                        <Badge variant="outline" className="text-gray-300 border-gray-500/50">
                          {u.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
