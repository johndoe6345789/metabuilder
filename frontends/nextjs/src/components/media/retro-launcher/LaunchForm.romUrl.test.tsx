import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { LaunchForm } from './LaunchForm'

/**
 * The form took any non-empty string, so a typo or a bare filename went
 * to the daemon and came back as an error the player had no way to
 * connect to what they had typed.
 */
describe('a ROM address that will not work', () => {
  const form = (romUrl: string) =>
    render(
      <LaunchForm
        system="nes"
        onSystemChange={vi.fn()}
        romUrl={romUrl}
        onRomUrlChange={vi.fn()}
        loading={false}
        error={null}
        onLaunch={vi.fn()}
      />
    )

  it('says what is wrong with it', () => {
    form('mario.nes')
    expect(screen.getByText(/not a web address/)).toBeTruthy()
  })

  it('will not launch until it is fixed', () => {
    form('mario.nes')
    expect(screen.getByRole('button', { name: /Launch/ })).toHaveProperty(
      'disabled',
      true
    )
  })

  it('says nothing about an empty box', () => {
    form('')
    expect(screen.queryByText(/not a web address/)).toBeNull()
  })

  it('is happy with a real address', () => {
    form('https://roms.example/mario.nes')
    expect(screen.queryByText(/not a web address/)).toBeNull()
    expect(screen.getByRole('button', { name: /Launch/ })).toHaveProperty(
      'disabled',
      false
    )
  })
})
