'use client'

import { useState } from 'react'

/**
 * Which palette block type is chosen but not yet placed.
 *
 * Clicking a palette item used to insert it immediately, guessing at a
 * target from whatever was already selected in the tree -- clicking with a
 * leaf selected, then again, could land two blocks in two different
 * places with no visible reason why. Staging the choice here instead means
 * placement is always a deliberate, visible step (the Add dialog, or a
 * drag onto a specific row), never a guess.
 */
export function usePendingAdd() {
  const [pendingType, setPendingType] = useState<string | null>(null)
  return {
    pendingType,
    select: (type: string) => {
      setPendingType(type)
    },
    clear: () => {
      setPendingType(null)
    },
  }
}
