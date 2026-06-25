/**
 * Tests for CreateWorkspaceForm component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateWorkspaceForm from '../CreateWorkspaceForm';

// WorkspacePreviewPanel is tested separately; mock it to isolate the form
jest.mock('../WorkspacePreviewPanel', () => {
  return function MockPreviewPanel({ name, color, onColorChange }: any) {
    return (
      <div data-testid="preview-panel">
        <span>{name}</span>
        <button onClick={() => onColorChange('#ff0000')}>Change Color</button>
      </div>
    );
  };
});

const defaultProps = {
  name: '',
  onNameChange: jest.fn(),
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
};

describe('CreateWorkspaceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the workspace name input', () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/marketing automation/i)
    ).toBeInTheDocument();
  });

  it('renders the description textarea', () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/what will this workspace/i)
    ).toBeInTheDocument();
  });

  it('renders the "Create Workspace" submit button', () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /create workspace/i })
    ).toBeInTheDocument();
  });

  it('renders the "Cancel" button', () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it('submit button is disabled when name is empty', () => {
    render(<CreateWorkspaceForm {...defaultProps} name="" />);
    const submitBtn = screen.getByRole('button', { name: /create workspace/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button is enabled when name has content', () => {
    render(<CreateWorkspaceForm {...defaultProps} name="My Workspace" />);
    const submitBtn = screen.getByRole('button', { name: /create workspace/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onNameChange when name field changes', async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    const input = screen.getByPlaceholderText(/marketing automation/i);
    await userEvent.type(input, 'A');
    expect(defaultProps.onNameChange).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when the form is submitted', () => {
    render(<CreateWorkspaceForm {...defaultProps} name="Test" />);
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders the WorkspacePreviewPanel', () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });
});
