import { Card, CardContent } from '@/components/ui/card'
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

interface WorkflowRunCardProps {
  name: string
  status: string
  conclusion: string | null
  branch: string
  createdAt: string
  onClick?: () => void
}

export function WorkflowRunCard({
  name,
  status,
  conclusion,
  branch,
  createdAt,
  onClick,
}: WorkflowRunCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">{name}</h3>
          <WorkflowRunStatus status={status} conclusion={conclusion} />
          <div className="text-xs text-gray-500 space-y-1">
            <p>Branch: {branch}</p>
            <p>Created: {new Date(createdAt).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
