/**
 * Tests for CurrentDbCard component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import CurrentDbCard from '../CurrentDbCard'

describe('CurrentDbCard', () => {
  it('should render the card with title', () => {
    render(<CurrentDbCard config={null} />)
    expect(screen.getByTestId('current-db-card')).toBeInTheDocument()
    expect(screen.getByText('Current Database')).toBeInTheDocument()
  })

  it('should show warning alert when config is null', () => {
    render(<CurrentDbCard config={null} />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Could not connect to DBAL daemon')
  })

  it('should show adapter when config is provided', () => {
    render(
      <CurrentDbCard
        config={{
          adapter: 'postgres',
          status: 'connected',
          database_url: 'postgres://localhost:5432/db',
        }}
      />
    )
    expect(screen.getByText('postgres')).toBeInTheDocument()
  })

  it('should show status chip when config is provided', () => {
    render(
      <CurrentDbCard
        config={{
          adapter: 'sqlite',
          status: 'connected',
          database_url: 'sqlite:///db.sqlite',
        }}
      />
    )
    expect(screen.getByText('connected')).toBeInTheDocument()
  })

  it('should show error status chip for disconnected', () => {
    render(
      <CurrentDbCard
        config={{
          adapter: 'sqlite',
          status: 'error',
          database_url: 'sqlite:///db.sqlite',
        }}
      />
    )
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('should display the database URL', () => {
    const url = 'postgres://user:pass@localhost:5432/mydb'
    render(
      <CurrentDbCard
        config={{
          adapter: 'postgres',
          status: 'connected',
          database_url: url,
        }}
      />
    )
    expect(screen.getByText(url)).toBeInTheDocument()
  })

  it('should show Adapter and URL labels', () => {
    render(
      <CurrentDbCard
        config={{
          adapter: 'mysql',
          status: 'connected',
          database_url: 'mysql://localhost:3306/db',
        }}
      />
    )
    expect(screen.getByText('Adapter:')).toBeInTheDocument()
    expect(screen.getByText('URL:')).toBeInTheDocument()
  })

  it('should not show warning when config is provided', () => {
    render(
      <CurrentDbCard
        config={{
          adapter: 'memory',
          status: 'connected',
          database_url: ':memory:',
        }}
      />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
