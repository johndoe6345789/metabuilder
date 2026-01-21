import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Gear,
  SignOut,
  User,
  House,
  ChartBar,
  Folder,
} from '@phosphor-icons/react'

export function SidebarNavigationShowcase() {
  return (
    <section className="space-y-6" data-testid="sidebar-navigation-showcase" role="region" aria-label="Sidebar navigation showcase">
      <div>
        <h2 className="text-3xl font-bold mb-2">Sidebar Navigation</h2>
        <p className="text-muted-foreground">
          Complete sidebar with nested navigation
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex">
          <aside className="w-64 border-r border-border bg-card/50 p-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-accent" />
                <span className="font-bold">Dashboard</span>
              </div>

              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <House className="mr-2" aria-hidden="true" />
                  Home
                </Button>
                <Button variant="filled" className="w-full justify-start">
                  <ChartBar className="mr-2" aria-hidden="true" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2" aria-hidden="true" />
                  Projects
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2" aria-hidden="true" />
                  Team
                </Button>
              </nav>

              <Separator />

              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Gear className="mr-2" aria-hidden="true" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  <SignOut className="mr-2" aria-hidden="true" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </aside>

          <div className="flex-1 p-6">
            <p className="text-sm text-muted-foreground">
              Sidebar with navigation items and user actions
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
