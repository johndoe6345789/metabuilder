import { Card } from '@/components/ui/card'

export function ColorsSection() {
  return (
    <section className="space-y-6" data-testid="colors-section" role="region" aria-label="Colors palette">
      <div>
        <h2 className="text-3xl font-bold mb-2">Colors</h2>
        <p className="text-muted-foreground">
          Semantic color palette with accessibility in mind
        </p>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-primary" />
            <div>
              <p className="font-medium">Primary</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.50 0.18 310)
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-secondary" />
            <div>
              <p className="font-medium">Secondary</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.30 0.08 310)
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-accent" />
            <div>
              <p className="font-medium">Accent</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.72 0.20 25)
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-destructive" />
            <div>
              <p className="font-medium">Destructive</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.577 0.245 27.325)
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted" />
            <div>
              <p className="font-medium">Muted</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.25 0.06 310)
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-card border border-border" />
            <div>
              <p className="font-medium">Card</p>
              <code className="text-xs text-muted-foreground">
                oklch(0.20 0.12 310)
              </code>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
