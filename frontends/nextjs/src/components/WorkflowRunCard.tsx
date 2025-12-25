import { Card, CardContent } from '@/components/ui/card'
import { WorkflowRunStatus } from './WorkflowRunStatus'

export { WorkflowRunStatus } from './WorkflowRunStatus'

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
