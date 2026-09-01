import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomePage } from './WelcomePage'

describe('WelcomePage', () => {
  it('renders the brand name (nav and footer) and nav links', () => {
    render(<WelcomePage />)
    expect(screen.getAllByText('MetaBuilder')).toHaveLength(2)
    expect(screen.getByText('Features')).toBeTruthy()
    expect(screen.getByText('Pricing')).toBeTruthy()
  })

  it('links Sign In and Start free to the right routes', () => {
    render(<WelcomePage />)
    expect(screen.getByText('Sign In').closest('a')?.getAttribute('href')).toBe(
      '/login'
    )
    expect(
      screen.getByText('Start free').closest('a')?.getAttribute('href')
    ).toBe('/ui/signup')
  })

  it('anchors Features and Pricing to their sections', () => {
    render(<WelcomePage />)
    expect(screen.getByText('Features').getAttribute('href')).toBe('#packages')
    expect(screen.getByText('Pricing').getAttribute('href')).toBe('#pricing')
  })

  it('renders the landing sections', () => {
    render(<WelcomePage />)
    expect(screen.getByText('Your community.')).toBeTruthy()
    expect(screen.getByText('No platform lock-in')).toBeTruthy()
  })

  it('renders the current year in the footer copyright', () => {
    render(<WelcomePage />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeTruthy()
  })
})
