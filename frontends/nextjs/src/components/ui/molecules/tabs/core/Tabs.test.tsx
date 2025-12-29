import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

describe('Tabs', () => {
  it('switches active tab and hides inactive panels', () => {
    render(
      <Tabs defaultValue="alpha">
        <TabsList>
          <TabsTrigger value="alpha">Alpha</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="alpha">Alpha content</TabsContent>
        <TabsContent value="beta">Beta content</TabsContent>
      </Tabs>
    )

    const alphaPanel = screen.getByText('Alpha content').closest('[role="tabpanel"]')
    const betaPanel = screen.getByText('Beta content').closest('[role="tabpanel"]')

    expect(alphaPanel?.hasAttribute('hidden')).toBe(false)
    expect(betaPanel?.hasAttribute('hidden')).toBe(true)

    const betaTab = screen.getByRole('tab', { name: 'Beta' })
    fireEvent.click(betaTab)

    expect(alphaPanel?.hasAttribute('hidden')).toBe(true)
    expect(betaPanel?.hasAttribute('hidden')).toBe(false)

    const alphaTab = screen.getByRole('tab', { name: 'Alpha' })
    expect(alphaTab.getAttribute('aria-selected')).toBe('false')
    expect(betaTab.getAttribute('aria-selected')).toBe('true')
  })
})
