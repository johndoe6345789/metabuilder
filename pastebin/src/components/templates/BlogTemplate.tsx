import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowRight } from '@phosphor-icons/react'

export function BlogTemplate() {
  return (
    <Card className="overflow-hidden" data-testid="blog-template" role="main" aria-label="Blog template">
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Blog</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Articles
            </Button>
            <Button variant="ghost" size="sm">
              Tutorials
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 mb-8">
            <div className="flex gap-2">
              <Badge>Design</Badge>
              <Badge variant="secondary">Tutorial</Badge>
            </div>
            <h1 className="text-5xl font-bold">
              Building a Comprehensive Component Library
            </h1>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                <AvatarFallback>AW</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Alex Writer</p>
                <p className="text-sm text-muted-foreground">
                  March 15, 2024 · 10 min read
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="prose prose-invert max-w-none space-y-6">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary to-accent" />
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Design systems have become an essential part of modern product development.
              They provide consistency, improve efficiency, and create a shared language
              between designers and developers.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Understanding Atomic Design
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The atomic design methodology consists of five distinct stages: atoms,
              molecules, organisms, templates, and pages. Each stage builds upon the
              previous, creating a comprehensive system that scales with your needs.
            </p>

            <Card className="p-6 my-8 bg-muted/50">
              <p className="text-sm text-muted-foreground italic">
                "A design system is never complete. It's a living, breathing ecosystem
                that evolves with your product and team."
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-4">Getting Started</h2>
            <p className="text-muted-foreground leading-relaxed">
              Begin by identifying the core components your product needs. Start small
              with basic atoms like buttons and inputs, then gradually build up to more
              complex organisms and templates.
            </p>
          </div>

          <Separator className="my-12" />

          <div className="flex items-center justify-between">
            <Button variant="outline">
              Previous Article
            </Button>
            <Button>
              Next Article
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
