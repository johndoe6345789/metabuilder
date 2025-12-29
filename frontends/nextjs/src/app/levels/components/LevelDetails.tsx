import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import type { PermissionLevel } from '../levels-data'
import { highlightColor } from '../utils/highlightColor'

type LevelDetailsProps = {
  selectedLevel: PermissionLevel
  nextLevel: PermissionLevel | null
  maxCapabilityCount: number
  note: string
  onPromote: () => void
}

export const LevelDetails = ({
  selectedLevel,
  nextLevel,
  maxCapabilityCount,
  note,
  onPromote,
}: LevelDetailsProps) => (
  <Paper
    sx={{
      p: 4,
      border: theme => `1px dashed ${theme.palette.divider}`,
      bgcolor: 'background.paper',
    }}
  >
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5">Selected level details</Typography>
        <Chip label={selectedLevel.badge} size="small" color="secondary" />
      </Stack>
      <Typography variant="body1" color="text.secondary">
        {selectedLevel.description}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {selectedLevel.capabilities.map(capability => (
          <Chip
            key={capability}
            label={capability}
            size="small"
            sx={{ borderColor: highlightColor(selectedLevel) }}
          />
        ))}
      </Stack>
      <Stack spacing={1}>
        <LinearProgress
          variant="determinate"
          value={(selectedLevel.capabilities.length / maxCapabilityCount) * 100}
          sx={{ height: 10, borderRadius: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          {selectedLevel.capabilities.length} of {maxCapabilityCount} capability tiers unlocked
        </Typography>
      </Stack>
      <Divider />
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Next move
        </Typography>
        {nextLevel ? (
          <Typography variant="body2" color="text.secondary">
            Promote into <strong>{nextLevel.title}</strong> to unlock{' '}
            {nextLevel.capabilities.length} controls.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Super God reigns supreme. You already own every privilege.
          </Typography>
        )}
      </Box>
      <Box>
        <Button variant="contained" onClick={onPromote}>
          {nextLevel ? `Promote to ${nextLevel.title}` : 'Hold the crown'}
        </Button>
      </Box>
      {note && <Alert severity="info">{note}</Alert>}
    </Stack>
  </Paper>
)
