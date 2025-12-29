import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Stack,
  Typography,
} from '@/components/ui'

interface ModeratorActionsProps {
  flaggedCount: number
  resolvedCount: number
  flaggedTerms: string[]
}

export function ModeratorActions({
  flaggedCount,
  resolvedCount,
  flaggedTerms,
}: ModeratorActionsProps) {
  const highlightLabel = (term: string) => term.charAt(0).toUpperCase() + term.slice(1)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Flagged content</CardTitle>
          <CardDescription>Automated signal based on keywords</CardDescription>
        </CardHeader>
        <CardContent>
          <Typography variant="h3">{flaggedCount}</Typography>
          <Typography color="text.secondary" className="mt-2">
            Pending items in the moderation queue
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resolved this session</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="h3">{resolvedCount}</Typography>
          <Typography color="text.secondary" className="mt-2">
            Items you flagged as handled
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community signals</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {flaggedTerms.map(term => (
              <Badge key={term}>{highlightLabel(term)}</Badge>
            ))}
          </Stack>
          <Typography color="text.secondary" className="mt-2">
            Track the keywords that pulled items into the queue
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}
