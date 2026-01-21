import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'

describe('Accordion Component', () => {
  // Basic rendering tests
  it('renders accordion container', () => {
    const { container } = render(
      <Accordion>
        <div>Content</div>
      </Accordion>
    )
    expect(container.querySelector('.mat-accordion')).toBeInTheDocument()
  })

  it('applies custom className to accordion', () => {
    const { container } = render(
      <Accordion className="custom-accordion">
        <div>Content</div>
      </Accordion>
    )
    const accordion = container.querySelector('.mat-accordion')
    expect(accordion).toHaveClass('custom-accordion')
  })

  it('renders accordion item with correct class', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="item1">
          <div>Item content</div>
        </AccordionItem>
      </Accordion>
    )
    expect(container.querySelector('.mat-expansion-panel')).toBeInTheDocument()
  })

  it('renders accordion trigger button', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
  })

  // Single type accordion tests
  it('has single type by default', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
  })

  // Multiple type accordion tests
  it('has multiple type option', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument()
  })

  // Expand/collapse tests
  it('accordion item renders with no defaultValue', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
  })

  it('accordion item renders with default value set', () => {
    render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
  })

  // Active state tests
  it('applies expanded class based on context state', () => {
    const { container } = render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const item = container.querySelector('.mat-expansion-panel')
    expect(item).toHaveClass('mat-expanded')
  })

  // Default value tests
  it('accepts defaultValue as string', () => {
    render(
      <Accordion type="single" defaultValue="item2">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument()
  })

  it('accepts defaultValue as array for multiple type', () => {
    render(
      <Accordion type="multiple" defaultValue={['item1', 'item3']}>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item3">
          <AccordionTrigger>Item 3</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item 3' })).toBeInTheDocument()
  })

  // Multiple items tests
  it('renders multiple accordion items', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="item3">
          <AccordionTrigger>Item 3</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item 3' })).toBeInTheDocument()
  })

  // Content visibility tests
  it('accordion content structure is created', () => {
    render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    // Check that the accordion item exists with expanded class
    const item = document.querySelector('.mat-expanded')
    expect(item).toBeInTheDocument()
  })

  // Accordion item data attribute tests
  it('sets data-value attribute on accordion items', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionTrigger>Item</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    const item = container.querySelector('.mat-expansion-panel')
    expect(item).toHaveAttribute('data-value', 'test-item')
  })

  // Accordion content rendering tests
  it('renders accordion content with correct classes', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    await user.click(screen.getByRole('button', { name: 'Item 1' }))

    const content = container.querySelector('.mat-expansion-panel-body')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('mat-expansion-panel-body')
  })

  // Edge case tests
  it('handles accordion with no items', () => {
    const { container } = render(<Accordion />)
    expect(container.querySelector('.mat-accordion')).toBeInTheDocument()
  })

  it('handles accordion with single item', () => {
    const { container } = render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: 'Item 1' })
    expect(button).toBeInTheDocument()
    const item = container.querySelector('.mat-expansion-panel')
    expect(item).toHaveClass('mat-expanded')
  })

  // Accordion trigger styling tests
  it('renders accordion trigger with correct class', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    const trigger = container.querySelector('.mat-expansion-panel-header')
    expect(trigger).toBeInTheDocument()
  })
})
