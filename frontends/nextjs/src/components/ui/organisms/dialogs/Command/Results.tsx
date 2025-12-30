'use client'

import { Box } from '@/fakemui/fakemui/layout'
import { Typography } from '@/fakemui/fakemui/data-display'
import { ReactNode } from 'react'

import { CommandDialog } from '../command'
import type { CommandGroup, CommandItem } from '../command/command.types'
import styles from './Results.module.scss'

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
                <Box className={styles.itemContent}>
                  <Typography variant="body2" as="span" className={styles.itemLabel}>
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" as="span" className={styles.itemDescription}>
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
