'use client'

import { useState } from 'react'
import type { SectionId } from './sections'

/** Which section is showing, and the hero's "jump to this channel in the
 *  TV tab" flow -- a fresh nonce each time so the same channel can be
 *  re-triggered by a second click. */
export function useStreamHub() {
  const [active, setActive] = useState<SectionId>('tv')
  const [watchTrigger, setWatchTrigger] = useState<{
    channelId: string
    nonce: number
  } | null>(null)

  const handleHeroWatch = (channelId: string) => {
    setActive('tv')
    setWatchTrigger({ channelId, nonce: Date.now() })
  }

  return { active, setActive, watchTrigger, handleHeroWatch }
}
