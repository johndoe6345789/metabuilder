import { Box, Typography } from '@/fakemui'

import { ResultsPane } from '../sections/ResultsPane'

export function ChatTabContent() {
  return (
    <ResultsPane
      title="Webchat"
      description="Collaborate with other builders in real-time via the IRC channel."
    >
      <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="h6">IRC Webchat</Typography>
        <Typography variant="body2" color="text.secondary">
          This component is now a Lua package. See packages/irc_webchat/
        </Typography>
      </Box>
    </ResultsPane>
  )
}
