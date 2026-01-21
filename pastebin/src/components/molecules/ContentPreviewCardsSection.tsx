import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@phosphor-icons/react'

export function ContentPreviewCardsSection() {
  return (
    <section className="space-y-6" data-testid="content-preview-cards-section" role="region" aria-label="Content preview card examples">
      <div>
        <h2 className="text-3xl font-bold mb-2">Content Preview Cards</h2>
        <p className="text-muted-foreground">
          Compact cards displaying content with metadata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg line-clamp-2">
                  Building Scalable Design Systems
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to create and maintain design systems that grow with your team.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Mar 15, 2024</span>
              </div>
              <span>•</span>
              <span>5 min read</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Design</Badge>
              <Badge variant="outline">System</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg line-clamp-2">
                  Advanced TypeScript Patterns
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore advanced type system features and practical patterns for production apps.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Mar 12, 2024</span>
              </div>
              <span>•</span>
              <span>8 min read</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Tutorial</Badge>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
