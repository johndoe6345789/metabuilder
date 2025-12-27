'use client'

import { useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { PERMISSION_LEVELS, type PermissionLevel } from './levels-data'

const highlightColor = (level: PermissionLevel) => {
  if (level.id === 6) return 'warning.main'
  if (level.id === 5) return 'primary.main'
  return 'divider'
}

export default function LevelsClient() {
  const [selectedLevelId, setSelectedLevelId] = useState(PERMISSION_LEVELS[0].id)
  const [note, setNote] = useState('')

  const selectedLevel = useMemo(
    () => PERMISSION_LEVELS.find((level) => level.id === selectedLevelId) ?? PERMISSION_LEVELS[0],
    [selectedLevelId]
  )

  const nextLevel = useMemo(
    () => PERMISSION_LEVELS.find((level) => level.id === selectedLevelId + 1) ?? null,
    [selectedLevelId]
  )

  const maxCapabilityCount = useMemo(
    () => Math.max(...PERMISSION_LEVELS.map((level) => level.capabilities.length)),
    []
  )

  const handleSelect = (levelId: number) => {
    setSelectedLevelId(levelId)
    setNote(`Selected ${PERMISSION_LEVELS.find((l) => l.id === levelId)?.title ?? 'unknown'} privileges.`)
  }

  const handlePromote = () => {
    if (!nextLevel) {
      setNote('You already command the cosmos. No further promotions available.')
      return
    }
    setSelectedLevelId(nextLevel.id)
    setNote(`Upgraded to ${nextLevel.title}.`)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h1">
            The Six Permission Levels
          </Typography>
          <Typography color="text.secondary">
            Level up through Public, User, Moderator, Admin, God, and Super God to unlock the right
            controls for your role.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {PERMISSION_LEVELS.map((level) => (
            <Grid item xs={12} md={6} lg={4} key={level.id} component="div">
              <Paper
                onClick={() => handleSelect(level.id)}
                sx={{
                  border: (theme) => `2px solid ${selectedLevel.id === level.id ? theme.palette.primary.main : theme.palette.divider}`,
                  p: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                elevation={selectedLevel.id === level.id ? 6 : 1}
              >
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Chip label={level.badge} />
                </Box>
                <Typography variant="h6">Level {level.id} · {level.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {level.tagline}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {level.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {level.capabilities.slice(0, 3).map((capability) => (
                    <Chip key={capability} label={capability} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 4, border: (theme) => `1px dashed ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5">Selected level details</Typography>
              <Chip label={selectedLevel.badge} size="small" color="secondary" />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {selectedLevel.description}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedLevel.capabilities.map((capability) => (
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
                  Promote into <strong>{nextLevel.title}</strong> to unlock {nextLevel.capabilities.length} controls.
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Super God reigns supreme. You already own every privilege.
                </Typography>
              )}
            </Box>
            <Box>
              <Button variant="contained" onClick={handlePromote}>
                {nextLevel ? `Promote to ${nextLevel.title}` : 'Hold the crown'}
              </Button>
            </Box>
            {note && <Alert severity="info">{note}</Alert>}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
