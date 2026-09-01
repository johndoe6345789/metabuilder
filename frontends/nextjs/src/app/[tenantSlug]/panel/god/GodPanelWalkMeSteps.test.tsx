import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GodPanelWalkMeSteps } from './GodPanelWalkMeSteps'
import type { WalkStep } from './tabs/walk-me-steps'
import type { GodPanelTab } from '@/lib/packages/navigation'

const steps: WalkStep[] = [
  { tabId: 'overview', title: 'Fallback title', body: 'b' },
  { tabId: 'no-tab', title: 'No matching tab', body: 'b' },
]

const tabs: GodPanelTab[] = [
  { id: 'overview', label: 'Overview', icon: 'i', description: 'd' },
]

describe('GodPanelWalkMeSteps', () => {
  it('prefers the matching tab label over the step title', () => {
    render(
      <GodPanelWalkMeSteps
        steps={steps}
        tabs={tabs}
        currentStep={0}
        onSelectStep={vi.fn()}
      />
    )
    expect(screen.getByText('Overview')).toBeTruthy()
    expect(screen.queryByText('Fallback title')).toBeNull()
  })

  it('falls back to the step title with no matching tab', () => {
    render(
      <GodPanelWalkMeSteps
        steps={steps}
        tabs={tabs}
        currentStep={0}
        onSelectStep={vi.fn()}
      />
    )
    expect(screen.getByText('No matching tab')).toBeTruthy()
  })

  it('numbers each step from 1', () => {
    render(
      <GodPanelWalkMeSteps
        steps={steps}
        tabs={tabs}
        currentStep={0}
        onSelectStep={vi.fn()}
      />
    )
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('marks only the current step active', () => {
    render(
      <GodPanelWalkMeSteps
        steps={steps}
        tabs={tabs}
        currentStep={1}
        onSelectStep={vi.fn()}
      />
    )
    expect(screen.getByText('Overview').closest('button')?.className).not
      .toContain('walkStepActive')
    expect(
      screen.getByText('No matching tab').closest('button')?.className
    ).toContain('walkStepActive')
  })

  it('calls onSelectStep with the clicked index', () => {
    const onSelectStep = vi.fn()
    render(
      <GodPanelWalkMeSteps
        steps={steps}
        tabs={tabs}
        currentStep={0}
        onSelectStep={onSelectStep}
      />
    )
    screen.getByText('No matching tab').click()
    expect(onSelectStep).toHaveBeenCalledWith(1)
  })
})
