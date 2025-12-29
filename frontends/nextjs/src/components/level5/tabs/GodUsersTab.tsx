import { Shield, Users } from '@phosphor-icons/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { User } from '@/lib/level-types'

interface GodUsersTabProps {
  godUsers: User[]
}

export function GodUsersTab({ godUsers }: GodUsersTabProps) {
  return (
    <Card className="bg-black/40 border-white/10 text-white">
      <CardHeader>
        <CardTitle>God-Level Users</CardTitle>
        <CardDescription className="text-gray-400">All users with God access level</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {godUsers.map(godUser => (
              <Card key={godUser.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-purple-400" weight="fill" />
                      <div>
                        <p className="font-semibold text-white">{godUser.username}</p>
                        <p className="text-sm text-gray-400">{godUser.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-300 border-purple-500/50">
                      God
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
