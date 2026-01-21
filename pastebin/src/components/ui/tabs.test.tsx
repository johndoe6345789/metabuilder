import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

describe('Tabs Component', () => {
  // Basic rendering tests
  it('renders tabs container', () => {
    const { container } = render(
      <Tabs>
        <div>Content</div>
      </Tabs>
    )
    expect(container.querySelector('.mat-mdc-tab-group')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Tabs className="custom-class">
        <div>Content</div>
      </Tabs>
    )
    const tabsContainer = container.querySelector('.mat-mdc-tab-group')
    expect(tabsContainer).toHaveClass('custom-class')
  })

  it('renders TabsList with correct class', () => {
    const { container } = render(
      <TabsList>Tab 1</TabsList>
    )
    expect(container.querySelector('.mat-mdc-tab-header')).toBeInTheDocument()
  })

  it('renders TabsTrigger with correct class', () => {
    const { container } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(container.querySelector('.mdc-tab')).toBeInTheDocument()
  })

  // Tab switching tests
  it('switches tabs when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

    const tab2Button = screen.getByRole('button', { name: 'Tab 2' })
    await user.click(tab2Button)

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('renders only active tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('hides inactive tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  // Controlled component tests
  it('uses controlled value when provided', async () => {
    const user = userEvent.setup()
    const handleValueChange = jest.fn()

    render(
      <Tabs value="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    const tab2Button = screen.getByRole('button', { name: 'Tab 2' })
    await user.click(tab2Button)

    expect(handleValueChange).toHaveBeenCalledWith('tab2')
  })

  it('calls onValueChange callback when tab changes', async () => {
    const user = userEvent.setup()
    const handleValueChange = jest.fn()

    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    const tab2Button = screen.getByRole('button', { name: 'Tab 2' })
    await user.click(tab2Button)

    expect(handleValueChange).toHaveBeenCalledWith('tab2')
  })

  // Active state tests
  it('applies active class to active tab', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons[0]).toHaveClass('mdc-tab--active')
    expect(buttons[1]).not.toHaveClass('mdc-tab--active')
  })

  it('updates active class when tab changes', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons[0]).toHaveClass('mdc-tab--active')

    await user.click(buttons[1])

    expect(buttons[0]).not.toHaveClass('mdc-tab--active')
    expect(buttons[1]).toHaveClass('mdc-tab--active')
  })

  // Multiple tabs test
  it('handles multiple tabs with independent content', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
          <TabsTrigger value="third">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First content</TabsContent>
        <TabsContent value="second">Second content</TabsContent>
        <TabsContent value="third">Third content</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('First content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getByText('Second content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Third' }))
    expect(screen.getByText('Third content')).toBeInTheDocument()
  })

  // Tab content rendering tests
  it('renders TabsContent with correct classes', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )

    const content = container.querySelector('.mat-mdc-tab-body')
    expect(content).toHaveClass('mat-mdc-tab-body-active')
  })

  it('applies custom className to TabsContent', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
      </Tabs>
    )

    const content = container.querySelector('.mat-mdc-tab-body')
    expect(content).toHaveClass('custom-content')
  })

  // Edge case tests
  it('handles tabs with no defaultValue', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('switches to correct tab when multiple clicks happen', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    )

    await user.click(screen.getByRole('button', { name: 'Tab 2' }))
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tab 3' }))
    expect(screen.getByText('Content 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tab 1' }))
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  // Tab trigger keyboard test
  it('renders tab trigger as button with correct role', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument()
  })
})
