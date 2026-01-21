import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Bell,
  Gear,
  House,
  ChartBar,
  Folder,
  Plus,
  TrendUp,
  Users,
} from '@phosphor-icons/react'

export function DashboardTemplate() {
  return (
    <Card className="overflow-hidden" data-testid="dashboard-template" role="main" aria-label="Dashboard template">
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold">Dashboard</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>
            <Button variant="ghost" size="icon">
              <Gear />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/150?img=4" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 border-r border-border bg-card/30 p-4 hidden lg:block">
          <nav className="space-y-1">
            <Button variant="filled" className="w-full justify-start">
              <House className="mr-2" />
              Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ChartBar className="mr-2" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Folder className="mr-2" />
              Projects
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2" />
              Team
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-muted-foreground">
                  Welcome back, here's what's happening
                </p>
              </div>
              <Button>
                <Plus className="mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">$45,231</p>
                    <p className="text-sm text-accent mt-2 flex items-center gap-1">
                      <TrendUp className="h-4 w-4" />
                      +20.1% from last month
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold mt-2">2,350</p>
                    <p className="text-sm text-accent mt-2 flex items-center gap-1">
                      <TrendUp className="h-4 w-4" />
                      +12.5% from last month
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">1,234</p>
                    <p className="text-sm text-accent mt-2 flex items-center gap-1">
                      <TrendUp className="h-4 w-4" />
                      +8.2% from last month
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Recent Activity</h3>
                </div>
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">User {i}</span> completed a task
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Quick Actions</h3>
                </div>
                <div className="p-4 space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2" />
                    Create New Project
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2" />
                    Invite Team Members
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Folder className="mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Card>
  )
}
