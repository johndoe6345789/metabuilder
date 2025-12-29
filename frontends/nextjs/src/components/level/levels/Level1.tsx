'use client'

import { useState } from 'react'
import { NavigationBar } from '../../level1/NavigationBar'
import { AppFooter } from '../../shared/AppFooter'
import { CredentialsSection } from '../level1/CredentialsSection'
import { Level1Tabs } from '../level1/Level1Tabs'

interface Level1Props {
  onNavigate: (level: number) => void
}

export function Level1({ onNavigate }: Level1Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <NavigationBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <CredentialsSection />
        <Level1Tabs onNavigate={onNavigate} />
      </div>

      <AppFooter />
    </div>
  )
}
