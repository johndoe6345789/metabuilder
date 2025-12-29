'use client'

import { useMemo, useState } from 'react'

import { Container, Stack, Typography } from '@mui/material'

import { LevelDetails } from './components/LevelDetails'
import { LevelsGrid } from './components/LevelsGrid'
import { PERMISSION_LEVELS } from './levels-data'

export default function LevelsClient() {
  const [selectedLevelId, setSelectedLevelId] = useState(PERMISSION_LEVELS[0].id)
  const [note, setNote] = useState('')

  const selectedLevel = useMemo(
    () => PERMISSION_LEVELS.find(level => level.id === selectedLevelId) ?? PERMISSION_LEVELS[0],
    [selectedLevelId]
  )

  const nextLevel = useMemo(
    () => PERMISSION_LEVELS.find(level => level.id === selectedLevelId + 1) ?? null,
    [selectedLevelId]
  )

  const maxCapabilityCount = useMemo(
    () => Math.max(...PERMISSION_LEVELS.map(level => level.capabilities.length)),
    []
  )

  const handleSelect = (levelId: number) => {
    setSelectedLevelId(levelId)
    setNote(
      `Selected ${PERMISSION_LEVELS.find(l => l.id === levelId)?.title ?? 'unknown'} privileges.`
    )
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

        <LevelsGrid
          levels={PERMISSION_LEVELS}
          onSelect={handleSelect}
          selectedLevelId={selectedLevelId}
        />

        <LevelDetails
          selectedLevel={selectedLevel}
          nextLevel={nextLevel}
          maxCapabilityCount={maxCapabilityCount}
          note={note}
          onPromote={handlePromote}
        />
      </Stack>
    </Container>
  )
}
