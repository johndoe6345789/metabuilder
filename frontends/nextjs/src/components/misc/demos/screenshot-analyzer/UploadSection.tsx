import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from '@mui/material'
import {
  CameraAlt as CameraIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

interface UploadSectionProps {
  isCapturing: boolean
  isAnalyzing: boolean
  screenshotData: string | null
  onCapture: () => void
  onDownload: () => void
  onReanalyze: () => void
  previewTitle?: string
}

export function UploadSection({
  isCapturing,
  isAnalyzing,
  screenshotData,
  onCapture,
  onDownload,
  onReanalyze,
  previewTitle = 'Screenshot Preview',
}: UploadSectionProps) {
  return (
    <Card>
      <CardHeader
        title="Capture & Analyze"
        subheader="Create a DOM snapshot and run heuristic checks"
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            onClick={onCapture}
            disabled={isCapturing || isAnalyzing}
            variant="contained"
            startIcon={<CameraIcon />}
            sx={{ flex: 1 }}
          >
            {isCapturing ? 'Capturing...' : 'Capture & Analyze'}
          </Button>

          {screenshotData && (
            <>
              <Button onClick={onDownload} variant="outlined" startIcon={<DownloadIcon />}>
                Download
              </Button>

              <Button
                onClick={onReanalyze}
                variant="outlined"
                disabled={isAnalyzing}
                startIcon={<RefreshIcon />}
              >
                Re-analyze
              </Button>
            </>
          )}
        </Box>

        {isAnalyzing && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, gap: 1.5 }}
          >
            <CircularProgress size={24} />
            <Typography color="text.secondary">Analyzing with heuristics...</Typography>
          </Box>
        )}

        {screenshotData && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {previewTitle}
            </Typography>
            <Box
              sx={{
                maxHeight: 384,
                overflow: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box
                component="img"
                src={screenshotData}
                alt="Page screenshot"
                sx={{ width: '100%' }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
