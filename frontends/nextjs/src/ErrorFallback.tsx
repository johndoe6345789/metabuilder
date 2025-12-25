import { Alert, AlertTitle, Button, Box, Typography, Paper } from '@mui/material'
import { Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material'

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 'md' }}>
        <Alert 
          severity="error" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <AlertTitle>This spark has encountered a runtime error</AlertTitle>
          Something unexpected happened while running the application. The error details are shown below. Contact the spark author and let them know about this issue.
        </Alert>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Error Details:
          </Typography>
          <Box
            component="pre"
            sx={{
              fontSize: '0.75rem',
              color: 'error.main',
              bgcolor: 'action.hover',
              p: 1.5,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 128,
              fontFamily: 'monospace',
            }}
          >
            {error.message}
          </Box>
        </Paper>
        
        <Button 
          onClick={resetErrorBoundary} 
          fullWidth
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    </Box>
  );
}
