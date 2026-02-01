import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetToolbar } from './SnippetToolbar'
import { SnippetTemplate } from '@/lib/types'

const mockTemplates: SnippetTemplate[] = [
  {
    id: '1',
    title: 'React Hook',
    description: 'Custom React hook',
    code: 'export const useCustom = () => {}',
    language: 'TypeScript',
    category: 'react',
    hasPreview: true,
  },
]

describe('SnippetToolbar', () => {
  it('renders search input with proper test id', () => {
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    expect(screen.getByTestId('snippet-search-input')).toBeInTheDocument()
  })

  it('renders selection mode button with proper test id', () => {
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    expect(screen.getByTestId('snippet-selection-mode-btn')).toBeInTheDocument()
  })

  it('renders create menu trigger with proper test id', () => {
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    expect(screen.getByTestId('snippet-create-menu-trigger')).toBeInTheDocument()
  })

  it('has proper aria-label on search input', () => {
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    const searchInput = screen.getByTestId('snippet-search-input')
    expect(searchInput).toHaveAttribute('aria-label', 'Search snippets')
  })

  it('calls onSearchChange when search input changes', async () => {
    const onSearchChange = jest.fn()
    const user = userEvent.setup()

    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={onSearchChange}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    const searchInput = screen.getByTestId('snippet-search-input') as HTMLInputElement
    await user.type(searchInput, 'test')

    expect(onSearchChange).toHaveBeenCalled()
  })

  it('selection mode button has aria-pressed attribute', () => {
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={true}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    const selectionBtn = screen.getByTestId('snippet-selection-mode-btn')
    expect(selectionBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders blank snippet menu item with proper test id', async () => {
    const user = userEvent.setup()
    render(
      <SnippetToolbar
        searchQuery=""
        onSearchChange={jest.fn()}
        selectionMode={false}
        onToggleSelectionMode={jest.fn()}
        onCreateNew={jest.fn()}
        onCreateFromTemplate={jest.fn()}
        templates={mockTemplates}
      />
    )

    const trigger = screen.getByTestId('snippet-create-menu-trigger')
    await user.click(trigger)

    expect(screen.getByTestId('snippet-create-blank-item')).toBeInTheDocument()
  })
})
