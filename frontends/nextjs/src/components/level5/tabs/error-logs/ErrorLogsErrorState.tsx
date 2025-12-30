import { Warning } from '@/fakemui/icons'

import { Button, Card, CardContent } from '@/components/ui'

interface ErrorLogsErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorLogsErrorState({ message, onRetry }: ErrorLogsErrorStateProps) {
  return (
    <Card className="bg-red-500/10 border-red-500/40 text-white">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Warning className="w-5 h-5 text-red-300" weight="fill" />
          <div>
            <p className="font-semibold">Unable to load error logs</p>
            <p className="text-sm text-red-200/80">{message}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-white/20" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
