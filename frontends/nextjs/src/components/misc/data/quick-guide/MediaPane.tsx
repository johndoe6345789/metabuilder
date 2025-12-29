import { FilmSlate, ImageSquare } from '@phosphor-icons/react'
import Image from 'next/image'

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'

interface MediaPaneProps {
  thumbnailUrl?: string
  videoUrl?: string
  onThumbnailChange?: (value: string) => void
  onVideoChange?: (value: string) => void
}

export function MediaPane({
  thumbnailUrl,
  videoUrl,
  onThumbnailChange,
  onVideoChange,
}: MediaPaneProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <FilmSlate size={20} weight="duotone" />
          Media
        </CardTitle>
        <CardDescription>
          Optional visuals to make the quick guide easier to follow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thumbnail-url">Thumbnail image</Label>
          <Input
            id="thumbnail-url"
            value={thumbnailUrl || ''}
            onChange={e => onThumbnailChange?.(e.target.value)}
            placeholder="https://images.example.com/quick-guide.png"
          />
          <p className="text-xs text-muted-foreground">Shown in dashboards and previews.</p>
          {thumbnailUrl && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
              <Image src={thumbnailUrl} alt="Quick guide thumbnail" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-url">Demo video (optional)</Label>
          <Input
            id="video-url"
            value={videoUrl || ''}
            onChange={e => onVideoChange?.(e.target.value)}
            placeholder="YouTube or direct MP4 link"
          />
          <p className="text-xs text-muted-foreground">
            Embed a short clip that shows the flow in action.
          </p>
          {videoUrl && (
            <div className="rounded-lg border bg-black p-3 text-sm text-muted-foreground">
              <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1">
                <ImageSquare size={14} />
                Preview
              </Badge>
              <div className="aspect-video overflow-hidden rounded-md bg-muted">
                <iframe
                  className="h-full w-full"
                  src={videoUrl}
                  title="Quick guide demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
