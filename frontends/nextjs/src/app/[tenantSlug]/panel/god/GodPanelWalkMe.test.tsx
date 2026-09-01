import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GodPanelWalkMe } from './GodPanelWalkMe'
import type { WalkStep } from './tabs/walk-me-steps'
import type { GodPanelTab } from '@/lib/packages/navigation'

const steps: WalkStep[] = [
  { tabId: 'overview', title: 'Step one', body: 'First body' },
  { tabId: 'plan', title: 'Step two', body: 'Second body' },
]
const tabs: GodPanelTab[] = []

type WalkMeProps = Parameters<typeof GodPanelWalkMe>[0]

const walkProps = (over: Partial<WalkMeProps> = {}): WalkMeProps => ({
  open: true,
  currentStep: 0,
  steps,
  tabs,
  onClose: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
  onSelectStep: vi.fn(),
  ...over,
})

describe('GodPanelWalkMe', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <GodPanelWalkMe {...walkProps({ open: false })} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when currentStep is past the last step', () => {
    const { container } = render(
      <GodPanelWalkMe {...walkProps({ currentStep: 99 })} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows the current step\'s title and body', () => {
    render(<GodPanelWalkMe {...walkProps({ currentStep: 1 })} />)
    expect(screen.getByRole('heading', { name: 'Step two' })).toBeTruthy()
    expect(screen.getByText('Second body')).toBeTruthy()
  })

  it('calls onClose from the close button', () => {
    const p = walkProps()
    render(<GodPanelWalkMe {...p} />)
    screen.getByLabelText('Close Walk Me').click()
    expect(p.onClose).toHaveBeenCalledOnce()
  })

  it('disables Back on the first step', () => {
    render(<GodPanelWalkMe {...walkProps({ currentStep: 0 })} />)
    const back = screen.getByText('Back').closest('button')
    expect(back?.disabled).toBe(true)
  })

  it('enables Back on a later step', () => {
    render(<GodPanelWalkMe {...walkProps({ currentStep: 1 })} />)
    const back = screen.getByText('Back').closest('button')
    expect(back?.disabled).toBe(false)
  })

  it('shows "Next" before the last step', () => {
    render(<GodPanelWalkMe {...walkProps({ currentStep: 0 })} />)
    expect(screen.getByText('Next')).toBeTruthy()
  })

  it('shows "Stay here" on the last step', () => {
    render(<GodPanelWalkMe {...walkProps({ currentStep: 1 })} />)
    expect(screen.getByText('Stay here')).toBeTruthy()
  })
})
