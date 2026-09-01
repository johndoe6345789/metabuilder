import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection', () => {
  it('renders the headline and sub copy', () => {
    render(<HeroSection />)
    expect(screen.getByText('Your community.')).toBeTruthy()
    expect(screen.getByText('Your platform.')).toBeTruthy()
    expect(screen.getByText('No platform lock-in')).toBeTruthy()
  })

  it('links "Start free trial" to the signup page', () => {
    render(<HeroSection />)
    const link = screen.getByText('Start free trial').closest('a')
    expect(link?.getAttribute('href')).toBe('/ui/signup')
  })

  it('links "See what\'s included" to the packages anchor', () => {
    render(<HeroSection />)
    const link = screen
      .getByText("See what's included")
      .closest('a')
    expect(link?.getAttribute('href')).toBe('#packages')
  })
})
