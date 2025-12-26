import type { Metadata } from 'next'

import LevelsClient from './LevelsClient'

export const metadata: Metadata = {
  title: 'Permission Levels',
  description: 'Explore the five permission tiers that govern MetaBuilder.',
}

export default function LevelsPage() {
  return <LevelsClient />
}
