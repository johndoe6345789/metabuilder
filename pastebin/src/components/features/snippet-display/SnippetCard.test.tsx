import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetCard } from './SnippetCard'
import { Snippet } from '@/lib/types'

const mockSnippet: Snippet = {
  id: '1',
  title: 'Test Snippet',
  description: 'A test snippet',
  code: 'console.log("hello")',
  language: 'JavaScript',
  category: 'Test',
  hasPreview: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  namespaceId: 'default',
}

describe('SnippetCard', () => {
  it('renders snippet card with correct test id', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByTestId(`snippet-card-${mockSnippet.id}`)).toBeInTheDocument()
  })

  it('displays snippet title and description', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByText('Test Snippet')).toBeInTheDocument()
    expect(screen.getByText('A test snippet')).toBeInTheDocument()
  })

  it('has proper semantic role', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    const card = screen.getByTestId(`snippet-card-${mockSnippet.id}`)
    expect(card).toHaveAttribute('role', 'article')
  })

  it('has view button with proper test id', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByTestId('snippet-card-view-btn')).toBeInTheDocument()
  })

  it('has copy button with proper test id', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByTestId('snippet-card-copy-btn')).toBeInTheDocument()
  })

  it('has edit button with proper test id', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByTestId('snippet-card-edit-btn')).toBeInTheDocument()
  })

  it('has actions menu with proper test id', () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByTestId('snippet-card-actions')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn()
    const user = userEvent.setup()

    render(
      <SnippetCard
        snippet={mockSnippet}
        onEdit={onEdit}
        onDelete={jest.fn()}
        onCopy={jest.fn()}
        onView={jest.fn()}
      />
    )

    await user.click(screen.getByTestId('snippet-card-edit-btn'))
    expect(onEdit).toHaveBeenCalledWith(mockSnippet)
  })
})
