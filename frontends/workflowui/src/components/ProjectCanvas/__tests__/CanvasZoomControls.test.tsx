/**
 * Tests for CanvasZoomControls component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasZoomControls from '../CanvasZoomControls';

const defaultProps = {
  zoom: 1,
  onZoomIn: jest.fn(),
  onZoomOut: jest.fn(),
  onResetView: jest.fn(),
};

describe('CanvasZoomControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders zoom out button', () => {
    render(<CanvasZoomControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });

  it('renders zoom in button', () => {
    render(<CanvasZoomControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
  });

  it('renders reset view button', () => {
    render(<CanvasZoomControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: /reset view/i })).toBeInTheDocument();
  });

  it('displays zoom percentage', () => {
    render(<CanvasZoomControls {...defaultProps} zoom={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('displays 100% at zoom=1', () => {
    render(<CanvasZoomControls {...defaultProps} zoom={1} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays 50% at zoom=0.5', () => {
    render(<CanvasZoomControls {...defaultProps} zoom={0.5} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onZoomOut when zoom out clicked', () => {
    const onZoomOut = jest.fn();
    render(<CanvasZoomControls {...defaultProps} onZoomOut={onZoomOut} />);
    fireEvent.click(screen.getByRole('button', { name: /zoom out/i }));
    expect(onZoomOut).toHaveBeenCalled();
  });

  it('calls onZoomIn when zoom in clicked', () => {
    const onZoomIn = jest.fn();
    render(<CanvasZoomControls {...defaultProps} onZoomIn={onZoomIn} />);
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }));
    expect(onZoomIn).toHaveBeenCalled();
  });

  it('calls onResetView when reset clicked', () => {
    const onResetView = jest.fn();
    render(<CanvasZoomControls {...defaultProps} onResetView={onResetView} />);
    fireEvent.click(screen.getByRole('button', { name: /reset view/i }));
    expect(onResetView).toHaveBeenCalled();
  });
});
