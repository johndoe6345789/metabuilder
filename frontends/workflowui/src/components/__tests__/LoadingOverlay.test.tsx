/**
 * Tests for LoadingOverlay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the hooks index (which re-exports @metabuilder/hooks and local hooks)
jest.mock('../../hooks', () => ({
  useUI: jest.fn(),
}));

import { useUI } from '../../hooks';
import LoadingOverlay from '../UI/LoadingOverlay';

const mockUseUI = useUI as jest.Mock;

describe('LoadingOverlay', () => {
  it('renders nothing when loading is false', () => {
    mockUseUI.mockReturnValue({ loading: false, loadingMessage: null });
    const { container } = render(<LoadingOverlay />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the overlay when loading is true', () => {
    mockUseUI.mockReturnValue({ loading: true, loadingMessage: null });
    render(<LoadingOverlay />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has aria-busy="true" when loading', () => {
    mockUseUI.mockReturnValue({ loading: true, loadingMessage: null });
    render(<LoadingOverlay />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders loadingMessage when provided', () => {
    mockUseUI.mockReturnValue({
      loading: true,
      loadingMessage: 'Saving workflow...',
    });
    render(<LoadingOverlay />);
    expect(screen.getByText('Saving workflow...')).toBeInTheDocument();
  });

  it('does not render message when loadingMessage is null', () => {
    mockUseUI.mockReturnValue({ loading: true, loadingMessage: null });
    render(<LoadingOverlay />);
    // No <p> elements should be in the overlay
    expect(document.querySelector('p')).not.toBeInTheDocument();
  });
});
