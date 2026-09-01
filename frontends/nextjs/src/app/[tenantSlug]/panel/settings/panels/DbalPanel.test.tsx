import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DbalPanel } from './DbalPanel'

const ORIGINAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL

describe('DbalPanel', () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_DBAL_API_URL = ORIGINAL_URL
  })

  it('renders the heading and the persistence blurb', () => {
    render(<DbalPanel />)
    expect(screen.getByText('DBAL Connection')).toBeTruthy()
    expect(
      screen.getByText(/Data is persisted client-side via Redux/)
    ).toBeTruthy()
  })

  it('falls back to localhost:8080 when the env var is unset', () => {
    delete process.env.NEXT_PUBLIC_DBAL_API_URL
    render(<DbalPanel />)
    expect(
      screen.getByText(/API URL:\s*http:\/\/localhost:8080/)
    ).toBeTruthy()
  })

  it('renders the configured API URL when the env var is set', () => {
    process.env.NEXT_PUBLIC_DBAL_API_URL = 'https://dbal.example.com'
    render(<DbalPanel />)
    expect(
      screen.getByText(/API URL:\s*https:\/\/dbal\.example\.com/)
    ).toBeTruthy()
  })
})
