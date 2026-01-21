import { Card } from '@/components/ui/card'
import {
  Heart,
  Star,
  Lightning,
  Check,
  X,
  Plus,
  Minus,
  MagnifyingGlass,
} from '@phosphor-icons/react'

export function IconsSection() {
  return (
    <section className="space-y-6" data-testid="icons-section" role="region" aria-label="Icon gallery">
      <div>
        <h2 className="text-3xl font-bold mb-2">Icons</h2>
        <p className="text-muted-foreground">
          Phosphor icon set with multiple weights
        </p>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6">
          <div className="flex flex-col items-center gap-2">
            <Heart className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Heart</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Star</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Lightning className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Lightning</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Check className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Check</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <X className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">X</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Minus className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Minus</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MagnifyingGlass className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Search</span>
          </div>
        </div>
      </Card>
    </section>
  )
}
