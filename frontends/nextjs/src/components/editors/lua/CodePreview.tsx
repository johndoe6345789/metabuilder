import { Box, Button, Card, CardContent, CardHeader, Stack, Tooltip } from '@mui/material'
import { ContentCopy, Refresh as RefreshIcon, Save as SaveIcon } from '@mui/icons-material'
import type { LuaScript } from '@/lib/level-types'
import styles from './LuaBlocksEditor.module.scss'

interface CodePreviewProps {
  generatedCode: string
  onApplyCode: () => void
  onCopyCode: () => void
  onReloadFromCode: () => void
  selectedScript: LuaScript | null
}

export function CodePreview({
  generatedCode,
  onApplyCode,
  onCopyCode,
  onReloadFromCode,
  selectedScript,
}: CodePreviewProps) {
  return (
    <Card>
      <CardHeader
        title="Lua preview"
        subheader="Generated code from your blocks"
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Reload blocks from script">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon fontSize="small" />}
                  onClick={onReloadFromCode}
                  disabled={!selectedScript}
                >
                  Reload
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Copy code">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopy fontSize="small" />}
                  onClick={onCopyCode}
                  disabled={!selectedScript}
                >
                  Copy
                </Button>
              </span>
            </Tooltip>
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
              onClick={onApplyCode}
              disabled={!selectedScript}
            >
              Apply to script
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Box className={styles.codePreview}>
          <pre>{generatedCode}</pre>
        </Box>
      </CardContent>
    </Card>
  )
}
