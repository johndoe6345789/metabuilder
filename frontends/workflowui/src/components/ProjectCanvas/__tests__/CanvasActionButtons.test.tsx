/**
 * Tests for CanvasActionButtons component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasActionButtons from '../CanvasActionButtons';

describe('CanvasActionButtons', () => {
  it('renders nothing when no handlers provided', () => {
    const { container } = render(<CanvasActionButtons />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders Add Workflow button when onAddWorkflow provided', () => {
    render(<CanvasActionButtons onAddWorkflow={jest.fn()} />);
    expect(screen.getByRole('button', { name: /add workflow/i })).toBeInTheDocument();
  });

  it('renders Layout button when onAutoLayout provided', () => {
    render(<CanvasActionButtons onAutoLayout={jest.fn()} />);
    expect(screen.getByRole('button', { name: /auto-layout/i })).toBeInTheDocument();
  });

  it('renders Settings button when onOpenSettings provided', () => {
    render(<CanvasActionButtons onOpenSettings={jest.fn()} />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('calls onAddWorkflow when Add Workflow button clicked', () => {
    const onAddWorkflow = jest.fn();
    render(<CanvasActionButtons onAddWorkflow={onAddWorkflow} />);
    fireEvent.click(screen.getByRole('button', { name: /add workflow/i }));
    expect(onAddWorkflow).toHaveBeenCalled();
  });

  it('calls onAutoLayout when Layout button clicked', () => {
    const onAutoLayout = jest.fn();
    render(<CanvasActionButtons onAutoLayout={onAutoLayout} />);
    fireEvent.click(screen.getByRole('button', { name: /auto-layout/i }));
    expect(onAutoLayout).toHaveBeenCalled();
  });

  it('calls onOpenSettings when Settings button clicked', () => {
    const onOpenSettings = jest.fn();
    render(<CanvasActionButtons onOpenSettings={onOpenSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('renders all three buttons when all handlers provided', () => {
    render(
      <CanvasActionButtons
        onAddWorkflow={jest.fn()}
        onAutoLayout={jest.fn()}
        onOpenSettings={jest.fn()}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
