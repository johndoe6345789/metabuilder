import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Heart, ChatCircle, Share, DotsThree } from '@phosphor-icons/react'

export function SocialActionsSection() {
  return (
    <section className="space-y-6" data-testid="social-actions-section" role="region" aria-label="Social action buttons">
      <div>
        <h2 className="text-3xl font-bold mb-2">Social Actions</h2>
        <p className="text-muted-foreground">
          Grouped interactive buttons for social features
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="mr-2" />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <ChatCircle className="mr-2" />
              Comment
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="mr-2" />
              Share
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Heart weight="fill" className="text-destructive mr-2" />
                <span className="text-foreground">256</span>
              </Button>
              <Button variant="outline" size="sm">
                <ChatCircle className="mr-2" />
                <span>42</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share />
              </Button>
              <Button variant="ghost" size="sm">
                <DotsThree weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
