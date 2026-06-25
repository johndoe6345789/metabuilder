/**
 * Tests for ValidationResults component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import ValidationResults from '../ValidationResults'

describe('ValidationResults', () => {
  it('should show success message when validation is valid', () => {
    render(<ValidationResults validation={{ valid: true, errors: [], warnings: [] }} />)
    expect(screen.getByText('Workflow is valid and ready to execute')).toBeInTheDocument()
  })

  it('should not show errors section when valid', () => {
    render(<ValidationResults validation={{ valid: true, errors: [], warnings: [] }} />)
    expect(screen.queryByText('Errors:')).not.toBeInTheDocument()
  })

  it('should not show warnings section when valid', () => {
    render(<ValidationResults validation={{ valid: true, errors: [], warnings: [] }} />)
    expect(screen.queryByText('Warnings:')).not.toBeInTheDocument()
  })

  it('should show errors when validation has errors', () => {
    render(
      <ValidationResults
        validation={{
          valid: false,
          errors: ['Missing required input', 'Invalid node type'],
          warnings: [],
        }}
      />
    )
    expect(screen.getByText('Errors:')).toBeInTheDocument()
    expect(screen.getByText('Missing required input')).toBeInTheDocument()
    expect(screen.getByText('Invalid node type')).toBeInTheDocument()
  })

  it('should show warnings when validation has warnings', () => {
    render(
      <ValidationResults
        validation={{
          valid: false,
          errors: [],
          warnings: ['Deprecated node used', 'Large workflow may be slow'],
        }}
      />
    )
    expect(screen.getByText('Warnings:')).toBeInTheDocument()
    expect(screen.getByText('Deprecated node used')).toBeInTheDocument()
    expect(screen.getByText('Large workflow may be slow')).toBeInTheDocument()
  })

  it('should show both errors and warnings', () => {
    render(
      <ValidationResults
        validation={{
          valid: false,
          errors: ['Error 1'],
          warnings: ['Warning 1'],
        }}
      />
    )
    expect(screen.getByText('Errors:')).toBeInTheDocument()
    expect(screen.getByText('Warnings:')).toBeInTheDocument()
    expect(screen.getByText('Error 1')).toBeInTheDocument()
    expect(screen.getByText('Warning 1')).toBeInTheDocument()
  })

  it('should not show success when invalid', () => {
    render(
      <ValidationResults
        validation={{
          valid: false,
          errors: ['An error'],
          warnings: [],
        }}
      />
    )
    expect(screen.queryByText('Workflow is valid and ready to execute')).not.toBeInTheDocument()
  })

  it('should handle empty errors and warnings when invalid', () => {
    render(
      <ValidationResults
        validation={{ valid: false, errors: [], warnings: [] }}
      />
    )
    // Should not throw even when invalid with no errors/warnings
    expect(screen.queryByText('Errors:')).not.toBeInTheDocument()
    expect(screen.queryByText('Warnings:')).not.toBeInTheDocument()
  })
})
