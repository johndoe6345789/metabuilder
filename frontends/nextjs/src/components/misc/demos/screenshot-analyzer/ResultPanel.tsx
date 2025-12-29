import { Box, Card, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material'
import { Visibility as EyeIcon } from '@mui/icons-material'
import type { ScreenshotAnalysisResult } from '@/lib/screenshot/types'

interface ResultPanelProps {
  analysisReport: string
  analysisResult: ScreenshotAnalysisResult | null
}

export function ResultPanel({ analysisReport, analysisResult }: ResultPanelProps) {
  if (!analysisReport) return null

  return (
    <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
      <CardHeader
        avatar={<EyeIcon />}
        title="Heuristic Analysis"
        titleTypographyProps={{ variant: 'subtitle1' }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {analysisResult && (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={`Words: ${analysisResult.metrics.wordCount}`} />
            <Chip size="small" label={`Headings: ${analysisResult.metrics.headingCount}`} />
            <Chip size="small" label={`Links: ${analysisResult.metrics.linkCount}`} />
            <Chip size="small" label={`Buttons: ${analysisResult.metrics.buttonCount}`} />
            <Chip size="small" label={`Images: ${analysisResult.metrics.imgCount}`} />
            <Chip
              size="small"
              label={`Missing alt: ${analysisResult.metrics.imgMissingAltCount}`}
            />
          </Stack>
        )}

        {analysisResult?.warnings.length ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Warnings
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {analysisResult.warnings.map(warning => (
                <li key={warning}>
                  <Typography variant="body2">{warning}</Typography>
                </li>
              ))}
            </Box>
          </Box>
        ) : null}

        <Typography
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
          }}
        >
          {analysisReport}
        </Typography>
      </CardContent>
    </Card>
  )
}
