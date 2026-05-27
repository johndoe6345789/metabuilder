/**
 * Tests for settings tab components: WorkflowsTab, AccountTab, DangerZoneTab,
 * WorkflowExecutorSettings
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WorkflowsTab from '../WorkflowsTab';
import AccountTab from '../AccountTab';
import DangerZoneTab from '../DangerZoneTab';
import WorkflowExecutorSettings from '../WorkflowExecutorSettings';

// ── WorkflowExecutorSettings ─────────────────────────────────────────────────
describe('WorkflowExecutorSettings', () => {
  const props = {
    defaultExecutor: 'typescript',
    workflowTimeout: '300',
    setDefaultExecutor: jest.fn(),
    setWorkflowTimeout: jest.fn(),
  };

  it('renders the executor select', () => {
    render(<WorkflowExecutorSettings {...props} />);
    expect(screen.getByTestId('default-executor-select')).toBeInTheDocument();
  });

  it('renders the timeout input', () => {
    render(<WorkflowExecutorSettings {...props} />);
    expect(screen.getByTestId('workflow-timeout-input')).toBeInTheDocument();
  });

  it('calls setDefaultExecutor when executor changes', () => {
    render(<WorkflowExecutorSettings {...props} />);
    fireEvent.change(screen.getByTestId('default-executor-select'), {
      target: { value: 'python' },
    });
    expect(props.setDefaultExecutor).toHaveBeenCalledWith('python');
  });

  it('calls setWorkflowTimeout when timeout changes', () => {
    render(<WorkflowExecutorSettings {...props} />);
    fireEvent.change(screen.getByTestId('workflow-timeout-input'), {
      target: { value: '600' },
    });
    expect(props.setWorkflowTimeout).toHaveBeenCalledWith('600');
  });

  it('renders "Default Executor" label', () => {
    render(<WorkflowExecutorSettings {...props} />);
    expect(screen.getByText('Default Executor')).toBeInTheDocument();
  });

  it('renders "Workflow Timeout (seconds)" label', () => {
    render(<WorkflowExecutorSettings {...props} />);
    expect(screen.getByText('Workflow Timeout (seconds)')).toBeInTheDocument();
  });
});

// ── WorkflowsTab ─────────────────────────────────────────────────────────────
describe('WorkflowsTab', () => {
  const props = {
    autoSave: false,
    setAutoSave: jest.fn(),
    defaultExecutor: 'typescript',
    setDefaultExecutor: jest.fn(),
    workflowTimeout: '300',
    setWorkflowTimeout: jest.fn(),
    onSave: jest.fn(),
  };

  it('renders the workflows card', () => {
    render(<WorkflowsTab {...props} />);
    expect(screen.getByTestId('workflows-card')).toBeInTheDocument();
  });

  it('renders the auto-save switch', () => {
    render(<WorkflowsTab {...props} />);
    expect(screen.getByTestId('auto-save-switch')).toBeInTheDocument();
  });

  it('renders the save button', () => {
    render(<WorkflowsTab {...props} />);
    expect(screen.getByTestId('save-workflow-settings-btn')).toBeInTheDocument();
  });

  it('renders "Auto-save workflows" label', () => {
    render(<WorkflowsTab {...props} />);
    expect(screen.getByText('Auto-save workflows')).toBeInTheDocument();
  });

  it('calls setAutoSave when switch is toggled', () => {
    render(<WorkflowsTab {...props} />);
    fireEvent.click(screen.getByTestId('auto-save-switch'));
    expect(props.setAutoSave).toHaveBeenCalled();
  });

  it('calls onSave when save button is clicked', async () => {
    render(<WorkflowsTab {...props} />);
    await userEvent.click(screen.getByTestId('save-workflow-settings-btn'));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });
});

// ── AccountTab ───────────────────────────────────────────────────────────────
describe('AccountTab', () => {
  it('renders the account card', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('account-card')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });

  it('renders display name input', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('display-name-input')).toBeInTheDocument();
  });

  it('renders current password input', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('current-password-input')).toBeInTheDocument();
  });

  it('renders new password input', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('new-password-input')).toBeInTheDocument();
  });

  it('renders confirm password input', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
  });

  it('renders save changes button', () => {
    render(<AccountTab />);
    expect(screen.getByTestId('save-account-btn')).toBeInTheDocument();
  });

  it('renders "Change Password" heading', () => {
    render(<AccountTab />);
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });
});

// ── DangerZoneTab ─────────────────────────────────────────────────────────────
describe('DangerZoneTab', () => {
  it('renders the danger zone card', () => {
    render(<DangerZoneTab onDeleteClick={jest.fn()} />);
    expect(screen.getByTestId('danger-zone-card')).toBeInTheDocument();
  });

  it('renders the delete account button', () => {
    render(<DangerZoneTab onDeleteClick={jest.fn()} />);
    expect(screen.getByTestId('delete-account-btn')).toBeInTheDocument();
  });

  it('renders warning text about caution', () => {
    render(<DangerZoneTab onDeleteClick={jest.fn()} />);
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it('renders "Danger Zone" heading', () => {
    render(<DangerZoneTab onDeleteClick={jest.fn()} />);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('calls onDeleteClick when delete button is clicked', async () => {
    const onDelete = jest.fn();
    render(<DangerZoneTab onDeleteClick={onDelete} />);
    await userEvent.click(screen.getByTestId('delete-account-btn'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
