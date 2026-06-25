/**
 * Tests for WorkspacePreviewPanel component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspacePreviewPanel from '../WorkspacePreviewPanel';

describe('WorkspacePreviewPanel', () => {
  const defaultProps = {
    name: 'My Workspace',
    color: '#6750A4',
    description: 'A description',
    onColorChange: jest.fn(),
  };

  it('displays the workspace name', () => {
    render(<WorkspacePreviewPanel {...defaultProps} />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('displays "Workspace Name" placeholder when name is empty', () => {
    render(
      <WorkspacePreviewPanel {...defaultProps} name="" />
    );
    expect(screen.getByText('Workspace Name')).toBeInTheDocument();
  });

  it('displays the description', () => {
    render(<WorkspacePreviewPanel {...defaultProps} />);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('displays "No description" when description is empty', () => {
    render(
      <WorkspacePreviewPanel {...defaultProps} description="" />
    );
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('shows "WS" initials when name is empty', () => {
    render(
      <WorkspacePreviewPanel {...defaultProps} name="" />
    );
    expect(screen.getByText('WS')).toBeInTheDocument();
  });

  it('shows initials derived from the name', () => {
    render(
      <WorkspacePreviewPanel {...defaultProps} name="Alpha Beta" />
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders 8 color swatch buttons', () => {
    render(<WorkspacePreviewPanel {...defaultProps} />);
    const swatches = screen.getAllByRole('button');
    expect(swatches).toHaveLength(8);
  });

  it('calls onColorChange when a color swatch is clicked', async () => {
    const onColorChange = jest.fn();
    render(
      <WorkspacePreviewPanel {...defaultProps} onColorChange={onColorChange} />
    );
    const swatches = screen.getAllByRole('button');
    await userEvent.click(swatches[1]);
    expect(onColorChange).toHaveBeenCalledTimes(1);
    expect(typeof onColorChange.mock.calls[0][0]).toBe('string');
  });

  it('each swatch has an accessible aria-label', () => {
    render(<WorkspacePreviewPanel {...defaultProps} />);
    const swatches = screen.getAllByRole('button');
    swatches.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-label');
    });
  });
});
