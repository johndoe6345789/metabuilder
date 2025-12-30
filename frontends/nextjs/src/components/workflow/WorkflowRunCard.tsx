import { Box, Card, CardContent, Stack, Typography } from '@/fakemui'

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
      variant="outlined"
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': onClick ? { boxShadow: 3, borderColor: 'primary.light' } : undefined,
      }}
    >
      <CardContent sx={{ pt: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <WorkflowRunStatus status={status} conclusion={conclusion} />
          <Box sx={{ color: 'text.secondary' }}>
            <Typography variant="caption" display="block">
              Branch: {branch}
            </Typography>
            <Typography variant="caption" display="block">
              Created: {new Date(createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
