'use client'

import { Typography } from '@/m3'

/**
 * What a visitor sees at a community that has not published a home page.
 *
 * Deliberately plain and deliberately not a sign-in prompt: this is a
 * public URL, and whoever followed it is being told the site is not ready,
 * not asked to prove who they are.
 */
export function NothingPublishedYet() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5">Nothing here yet</Typography>
      <Typography variant="body1">
        This community has not published a home page.
      </Typography>
    </main>
  )
}
