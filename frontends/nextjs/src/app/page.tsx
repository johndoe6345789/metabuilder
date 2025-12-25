import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to MetaBuilder - Your data-driven application platform',
}

export default function HomePage() {
  return <Level1Client />
}

// Client component wrapper for Level1
import { Level1Client } from './level1-client'
