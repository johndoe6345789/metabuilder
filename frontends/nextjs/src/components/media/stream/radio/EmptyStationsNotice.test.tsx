import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EmptyStationsNotice } from './EmptyStationsNotice'

describe('EmptyStationsNotice', () => {
  it('points to the API for creating a station', () => {
    render(<EmptyStationsNotice />)
    expect(screen.getByText('POST /api/radio/channels')).toBeTruthy()
  })
})
