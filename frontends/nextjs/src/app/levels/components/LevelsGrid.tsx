import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material'

import type { PermissionLevel } from '../levels-data'

type LevelsGridProps = {
  levels: PermissionLevel[]
  selectedLevelId: number
  onSelect: (levelId: number) => void
}

export const LevelsGrid = ({ levels, selectedLevelId, onSelect }: LevelsGridProps) => (
  <Grid container spacing={3}>
    {levels.map(level => (
      <Grid item xs={12} md={6} lg={4} key={level.id} component="div">
        <Paper
          onClick={() => onSelect(level.id)}
          sx={{
            border: theme =>
              `2px solid ${selectedLevelId === level.id ? theme.palette.primary.main : theme.palette.divider}`,
            p: 3,
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
          elevation={selectedLevelId === level.id ? 6 : 1}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Chip label={level.badge} />
          </Box>
          <Typography variant="h6">
            Level {level.id} · {level.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {level.tagline}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {level.description}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {level.capabilities.slice(0, 3).map(capability => (
              <Chip key={capability} label={capability} size="small" variant="outlined" />
            ))}
          </Stack>
        </Paper>
      </Grid>
    ))}
  </Grid>
)
