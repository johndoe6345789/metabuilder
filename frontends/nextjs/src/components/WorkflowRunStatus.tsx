import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from '@phosphor-icons/react'

interface WorkflowRunStatusProps {
  status: string
  conclusion: string | null
}

export function WorkflowRunStatus({ status, conclusion }: WorkflowRunStatusProps) {
  const isSuccess = conclusion === 'success'
  const isFailure = conclusion === 'failure'
  const isInProgress = status === 'in_progress'

  return (
    <div className="flex items-center gap-2">
      {isSuccess && <CheckCircle size={20} className="text-green-500" />}
      {isFailure && <XCircle size={20} className="text-red-500" />}
      {isInProgress && <Badge variant="outline">Running...</Badge>}
      <span className="text-sm font-medium capitalize">{conclusion || status}</span>
    </div>
  )
}
