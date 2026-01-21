import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChartBar,
  Users,
  Gear,
  ArrowRight,
} from '@phosphor-icons/react'

export function LandingPageTemplate() {
  return (
    <Card className="overflow-hidden" data-testid="landing-page-template" role="main" aria-label="Landing page template">
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <h3 className="text-xl font-bold">ProductName</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Features
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </div>

      <div className="p-12 text-center bg-gradient-to-br from-primary/20 to-accent/20">
        <Badge className="mb-4">New Release</Badge>
        <h1 className="text-5xl font-bold mb-6">
          Build Amazing Products Faster
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The complete toolkit for modern product development. Ship faster with our
          component library and design system.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg">
            Get Started
            <ArrowRight className="ml-2" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </div>

      <div className="p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build production-ready applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <ChartBar className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track and analyze your product metrics in real-time
            </p>
          </Card>

          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together with your team seamlessly
            </p>
          </Card>

          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Gear className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Customizable</h3>
            <p className="text-sm text-muted-foreground">
              Adapt the platform to your specific needs
            </p>
          </Card>
        </div>
      </div>

      <div className="p-12 text-center bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of teams already building with our platform
        </p>
        <Button size="lg" variant="secondary">
          Start Free Trial
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </Card>
  )
}
