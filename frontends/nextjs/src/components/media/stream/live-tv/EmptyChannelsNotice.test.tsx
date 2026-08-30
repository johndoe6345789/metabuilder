import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EmptyChannelsNotice } from './EmptyChannelsNotice'

describe('EmptyChannelsNotice', () => {
  it('points to the API for creating a channel', () => {
    render(<EmptyChannelsNotice />)
    expect(screen.getByText('POST /api/tv/channels')).toBeTruthy()
  })
})
