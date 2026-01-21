import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  List,
  GridFour,
} from '@phosphor-icons/react'
import { useState } from 'react'

export function ContentGridsShowcase() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <section className="space-y-6" data-testid="content-grids-showcase" role="region" aria-label="Content grids showcase">
      <div>
        <h2 className="text-3xl font-bold mb-2">Content Grids</h2>
        <p className="text-muted-foreground">
          Switchable grid and list views with filtering
        </p>
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-semibold text-lg">Projects</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'filled' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <GridFour aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'filled' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="h-32 rounded-lg bg-gradient-to-br from-primary to-accent" />
                  <h4 className="font-semibold">Project {i}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    A brief description of this project and its goals.
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">Project {i}</h4>
                    <p className="text-sm text-muted-foreground">
                      A brief description of this project
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  )
}
