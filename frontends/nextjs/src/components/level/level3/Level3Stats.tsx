import { ChatCircle, Users } from '@phosphor-icons/react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { Comment,User } from '@/lib/level-types'

interface Level3StatsProps {
  users: User[]
  comments: Comment[]
}

export function Level3Stats({ users, comments }: Level3StatsProps) {
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'god').length

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, helper: 'Registered accounts' },
    {
      label: 'Total Comments',
      value: comments.length,
      icon: ChatCircle,
      helper: 'Posted by users',
    },
    { label: 'Admins', value: adminCount, icon: Users, helper: 'Admin & god users' },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
