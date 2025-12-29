'use client'

import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

import { CommandDialog } from '../command'
import type { CommandGroup, CommandItem } from '../command/command.types'

interface CommandResultsProps {
  groups: CommandGroup[]
  emptyMessage?: ReactNode
  onSelect?: (item: CommandItem) => void
}

const CommandResults = ({
  groups,
  emptyMessage = 'No results found.',
  onSelect,
}: CommandResultsProps) => {
  const hasResults = groups.some(group => group.items.length > 0)

  return (
    <CommandDialog.List>
      {hasResults ? (
        groups.map((group, index) => (
          <CommandDialog.Group key={group.heading ?? index} heading={group.heading}>
            {group.items.map(item => (
              <CommandDialog.Item
                key={item.id}
                icon={item.icon}
                shortcut={item.shortcut}
                disabled={item.disabled}
                onSelect={() => {
                  item.onSelect?.()
                  onSelect?.(item)
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" component="span">
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="text.secondary" component="span">
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </CommandDialog.Item>
            ))}
          </CommandDialog.Group>
        ))
      ) : (
        <CommandDialog.Empty>{emptyMessage}</CommandDialog.Empty>
      )}
    </CommandDialog.List>
  )
}

export { CommandResults }
export type { CommandResultsProps }
