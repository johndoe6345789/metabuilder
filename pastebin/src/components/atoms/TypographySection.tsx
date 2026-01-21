import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function TypographySection() {
  return (
    <section className="space-y-6" data-testid="typography-section" role="region" aria-label="Typography styles">
      <div>
        <h2 className="text-3xl font-bold mb-2">Typography</h2>
        <p className="text-muted-foreground">
          Text styles and hierarchical type scale
        </p>
      </div>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
            <p className="text-sm text-muted-foreground">
              Bricolage Grotesque Bold / 48px
            </p>
          </div>
          <Separator />
          <div>
            <h2 className="text-4xl font-semibold mb-2">Heading 2</h2>
            <p className="text-sm text-muted-foreground">
              Bricolage Grotesque Semibold / 36px
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-3xl font-semibold mb-2">Heading 3</h3>
            <p className="text-sm text-muted-foreground">
              Bricolage Grotesque Semibold / 30px
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="text-2xl font-medium mb-2">Heading 4</h4>
            <p className="text-sm text-muted-foreground">
              Bricolage Grotesque Medium / 24px
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-base mb-2">
              Body text - The quick brown fox jumps over the lazy dog. This is
              regular body text used for paragraphs and general content.
            </p>
            <p className="text-sm text-muted-foreground">Inter Regular / 16px</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Small text - Additional information, captions, and secondary content.
            </p>
            <p className="text-sm text-muted-foreground">Inter Regular / 14px</p>
          </div>
          <Separator />
          <div>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              const example = "code text";
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              JetBrains Mono Regular / 14px
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
