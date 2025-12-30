import { Box, Stack } from '@/fakemui'

import { Info, Robot } from '@/fakemui/icons'

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'

interface AnalysisPanelProps {
  analysis: string | null
  isAnalyzing: boolean
  runLogs: string | null
  onAnalyzeWorkflows: () => void
  onAnalyzeLogs?: () => void
}

export function AnalysisPanel({
  analysis,
  isAnalyzing,
  runLogs,
  onAnalyzeLogs,
  onAnalyzeWorkflows,
}: AnalysisPanelProps) {
  return (
    <Card>
      <CardHeader>
        <Stack direction="row" spacing={1} alignItems="center">
          <Robot size={24} />
          <CardTitle>AI-Powered Workflow Analysis</CardTitle>
        </Stack>
        <CardDescription>
          {runLogs
            ? 'Deep analysis of downloaded workflow logs using GPT-4'
            : 'Deep analysis of your CI/CD pipeline using GPT-4'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stack spacing={3}>
          {runLogs ? (
            <Button
              onClick={onAnalyzeLogs}
              disabled={isAnalyzing}
              size="lg"
              fullWidth
              startIcon={<Robot size={20} />}
            >
              {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Downloaded Logs with AI'}
            </Button>
          ) : (
            <Button
              onClick={onAnalyzeWorkflows}
              disabled={isAnalyzing}
              size="lg"
              fullWidth
              startIcon={<Robot size={20} />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Workflows with AI'}
            </Button>
          )}

          {isAnalyzing && (
            <Stack spacing={2}>
              <Skeleton style={{ height: 128 }} />
              <Skeleton style={{ height: 128 }} />
              <Skeleton style={{ height: 128 }} />
            </Stack>
          )}

          {analysis && !isAnalyzing && (
            <Box
              style={{
                backgroundColor: 'var(--color-action-hover)',
                padding: 24,
                borderRadius: 8,
                border: '1px solid var(--color-divider)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {analysis}
            </Box>
          )}

          {!analysis && !isAnalyzing && (
            <Alert>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Info size={20} style={{ color: 'var(--mui-palette-info-main)' }} />
                <Box>
                  <AlertTitle>No Analysis Yet</AlertTitle>
                  <AlertDescription>
                    {runLogs
                      ? 'Click the button above to run an AI analysis of the downloaded logs. The AI will identify errors, provide root cause analysis, and suggest fixes.'
                      : 'Download logs from a specific workflow run using the "Download Logs" button, or click above to analyze overall workflow patterns.'}
                  </AlertDescription>
                </Box>
              </Stack>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
