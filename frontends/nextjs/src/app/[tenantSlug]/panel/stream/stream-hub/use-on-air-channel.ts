'use client'

import { useMemo } from 'react'
import { useTvChannels } from '@/components/media/stream/useTvChannels'
import type { ScheduledChannel } from '@/components/media/stream/useTvChannels'

/** The one channel currently airing something, if any. */
export function useOnAirChannel(): ScheduledChannel | undefined {
  const { channels } = useTvChannels()
  return useMemo(() => channels.find(c => c.epgNow !== undefined), [channels])
}
