import { Box, Stack, Typography } from '@mui/material'
import { Description as FileTextIcon, SmartToy as RobotIcon } from '@mui/icons-material'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
} from '@/components/ui'

import { Job } from '../types'

interface RunDetailsProps {
  runLogs: string | null
  runJobs: Job[]
  selectedRunId: number | null
  onAnalyzeLogs: () => void
  isAnalyzing: boolean
}

export function RunDetails({
  runLogs,
  runJobs,
  selectedRunId,
  onAnalyzeLogs,
  isAnalyzing,
}: RunDetailsProps) {
  if (!runLogs) return null

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" spacing={1} alignItems="center">
          <FileTextIcon sx={{ fontSize: 24 }} />
          <CardTitle>Workflow Logs</CardTitle>
          {selectedRunId && (
            <Badge variant="secondary" sx={{ fontSize: '0.75rem' }}>
              Run #{selectedRunId}
            </Badge>
          )}
        </Stack>
        <CardDescription>
          Complete logs from workflow run including all jobs and steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stack spacing={3}>
          {runJobs.length > 0 && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Jobs Summary</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {runJobs.map(job => (
                  <Badge
                    key={job.id}
                    variant={
                      job.conclusion === 'success'
                        ? 'default'
                        : job.conclusion === 'failure'
                          ? 'destructive'
                          : 'outline'
                    }
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {job.name}: {job.conclusion || job.status}
                  </Badge>
                ))}
              </Stack>
            </Stack>
          )}

          <ScrollArea
            sx={{
              height: 600,
              width: '100%',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {runLogs}
            </Box>
          </ScrollArea>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              onClick={() => {
                if (!runLogs) return
                navigator.clipboard.writeText(runLogs)
              }}
              variant="outline"
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={onAnalyzeLogs}
              disabled={isAnalyzing}
              startIcon={<RobotIcon sx={{ fontSize: 20 }} />}
            >
              {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Logs with AI'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
