/**
 * Tests for CanvasGridControls component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasGridControls from '../CanvasGridControls';

const defaultProps = {
  showGrid: false,
  gridSnap: false,
  snapSize: 10,
  onToggleShowGrid: jest.fn(),
  onToggleGridSnap: jest.fn(),
  onSnapSizeChange: jest.fn(),
};

describe('CanvasGridControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Grid checkbox', () => {
    render(<CanvasGridControls {...defaultProps} />);
    expect(screen.getByRole('checkbox', { name: /toggle grid visibility/i })).toBeInTheDocument();
  });

  it('renders Snap checkbox', () => {
    render(<CanvasGridControls {...defaultProps} />);
    expect(screen.getByRole('checkbox', { name: /toggle grid snap/i })).toBeInTheDocument();
  });

  it('Grid checkbox reflects showGrid prop', () => {
    render(<CanvasGridControls {...defaultProps} showGrid={true} />);
    expect(screen.getByRole('checkbox', { name: /toggle grid visibility/i })).toBeChecked();
  });

  it('Snap checkbox reflects gridSnap prop', () => {
    render(<CanvasGridControls {...defaultProps} gridSnap={true} />);
    expect(screen.getByRole('checkbox', { name: /toggle grid snap/i })).toBeChecked();
  });

  it('calls onToggleShowGrid when Grid checkbox clicked', () => {
    const onToggleShowGrid = jest.fn();
    render(<CanvasGridControls {...defaultProps} onToggleShowGrid={onToggleShowGrid} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /toggle grid visibility/i }));
    expect(onToggleShowGrid).toHaveBeenCalled();
  });

  it('calls onToggleGridSnap when Snap checkbox clicked', () => {
    const onToggleGridSnap = jest.fn();
    render(<CanvasGridControls {...defaultProps} onToggleGridSnap={onToggleGridSnap} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /toggle grid snap/i }));
    expect(onToggleGridSnap).toHaveBeenCalled();
  });

  it('does not render snap size select when gridSnap is false', () => {
    render(<CanvasGridControls {...defaultProps} gridSnap={false} />);
    expect(screen.queryByRole('combobox', { name: /grid snap size/i })).not.toBeInTheDocument();
  });

  it('renders snap size select when gridSnap is true', () => {
    render(<CanvasGridControls {...defaultProps} gridSnap={true} />);
    expect(screen.getByRole('combobox', { name: /grid snap size/i })).toBeInTheDocument();
  });

  it('calls onSnapSizeChange with numeric value when select changes', () => {
    const onSnapSizeChange = jest.fn();
    render(<CanvasGridControls {...defaultProps} gridSnap={true} onSnapSizeChange={onSnapSizeChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: /grid snap size/i }), {
      target: { value: '20' },
    });
    expect(onSnapSizeChange).toHaveBeenCalledWith(20);
  });

  it('shows correct snap options in select', () => {
    render(<CanvasGridControls {...defaultProps} gridSnap={true} />);
    const select = screen.getByRole('combobox', { name: /grid snap size/i });
    expect(select).toHaveValue('10');
  });
});
