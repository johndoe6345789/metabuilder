import { Typography } from '@/components/ui'

export function ModeratorHeader() {
  return (
    <div className="space-y-2">
      <Typography variant="h4">Moderation queue</Typography>
      <Typography color="text.secondary">
        Keep the community healthy by resolving flags, reviewing reports, and guiding the tone.
      </Typography>
    </div>
  )
}
