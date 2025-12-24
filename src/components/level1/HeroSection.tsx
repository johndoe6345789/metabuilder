import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onNavigate: (level: number) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Build Anything, Visually
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A 5-level meta-architecture for creating entire applications through visual workflows, 
          schema editors, and embedded scripting. No code required.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => onNavigate(2)}>
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
