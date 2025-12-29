'use client'

import { useMemo, useState } from 'react'

import type { CommandGroup, CommandItem } from '../command/command.types'

interface UseCommandStateOptions {
  groups: CommandGroup[]
  defaultOpen?: boolean
}

interface UseCommandStateResult {
  filteredGroups: CommandGroup[]
  open: boolean
  search: string
  setOpen: (open: boolean) => void
  setSearch: (value: string) => void
  close: () => void
}

const filterItems = (items: CommandItem[], query: string) => {
  if (!query) return items
  const lowered = query.toLowerCase()
  return items.filter(item => {
    const labelMatch = item.label.toLowerCase().includes(lowered)
    const keywordsMatch = item.keywords?.some(keyword => keyword.toLowerCase().includes(lowered))
    const descriptionMatch = item.description?.toLowerCase().includes(lowered)

    return labelMatch || keywordsMatch || descriptionMatch
  })
}

const useCommandState = ({
  groups,
  defaultOpen = false,
}: UseCommandStateOptions): UseCommandStateResult => {
  const [open, setOpen] = useState(defaultOpen)
  const [search, setSearch] = useState('')

  const filteredGroups = useMemo(() => {
    if (!search) return groups

    return groups
      .map(group => ({
        ...group,
        items: filterItems(group.items, search),
      }))
      .filter(group => group.items.length > 0)
  }, [groups, search])

  return {
    filteredGroups,
    open,
    search,
    setOpen,
    setSearch,
    close: () => setOpen(false),
  }
}

export { useCommandState }
export type { UseCommandStateOptions, UseCommandStateResult }
