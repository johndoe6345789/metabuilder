/**
 * Tests for project canvas components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CanvasZoomControls from '../CanvasZoomControls';
import CanvasAppBar from '../CanvasAppBar';

// ── CanvasZoomControls ────────────────────────────────────────────────────────
describe('CanvasZoomControls', () => {
  const props = {
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onReset: jest.fn(),
  };

  it('renders zoom in button', () => {
    render(<CanvasZoomControls {...props} />);
    // Tooltip title="Zoom In" wraps the button
    expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
  });

  it('renders zoom out button', () => {
    render(<CanvasZoomControls {...props} />);
    expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
  });

  it('renders reset zoom button', () => {
    render(<CanvasZoomControls {...props} />);
    expect(screen.getByTitle('Reset Zoom')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button clicked', async () => {
    render(<CanvasZoomControls {...props} />);
    // The Tooltip mock renders a div[title]; the inner button is a child
    const btns = screen.getAllByRole('button');
    await userEvent.click(btns[0]);
    expect(props.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when reset button clicked', async () => {
    render(<CanvasZoomControls {...props} />);
    const btns = screen.getAllByRole('button');
    await userEvent.click(btns[1]);
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onZoomOut when zoom out button clicked', async () => {
    render(<CanvasZoomControls {...props} />);
    const btns = screen.getAllByRole('button');
    await userEvent.click(btns[2]);
    expect(props.onZoomOut).toHaveBeenCalledTimes(1);
  });
});

// ── CanvasAppBar ──────────────────────────────────────────────────────────────
describe('CanvasAppBar', () => {
  it('renders the project name', () => {
    render(<CanvasAppBar projectId="p1" projectName="My Project" workflowCount={5} />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('renders fallback "Project Canvas" when projectName is undefined', () => {
    render(<CanvasAppBar projectId="p1" projectName={undefined} workflowCount={0} />);
    expect(screen.getByText('Project Canvas')).toBeInTheDocument();
  });

  it('renders workflow count', () => {
    render(<CanvasAppBar projectId="p1" projectName="Test" workflowCount={3} />);
    expect(screen.getByText(/3 workflows/)).toBeInTheDocument();
  });

  it('renders project id in text', () => {
    render(<CanvasAppBar projectId="proj-xyz" projectName="Test" workflowCount={0} />);
    expect(screen.getByText(/proj-xyz/)).toBeInTheDocument();
  });

  it('renders "Add" button', () => {
    render(<CanvasAppBar projectId="p1" projectName="Test" workflowCount={0} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
