/**
 * Tests for workspace components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WorkspaceCreateProjectForm from '../WorkspaceCreateProjectForm';
import WorkspaceProjectsBody from '../WorkspaceProjectsBody';

// ── WorkspaceCreateProjectForm ────────────────────────────────────────────────
describe('WorkspaceCreateProjectForm', () => {
  const props = {
    newProjectName: '',
    setNewProjectName: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders "Create New Project" heading', () => {
    render(<WorkspaceCreateProjectForm {...props} />);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('renders the project name text field', () => {
    render(<WorkspaceCreateProjectForm {...props} />);
    const input = screen.getByPlaceholderText('Project name');
    expect(input).toBeInTheDocument();
  });

  it('calls setNewProjectName when input changes', async () => {
    const setNewProjectName = jest.fn();
    render(<WorkspaceCreateProjectForm {...props} setNewProjectName={setNewProjectName} />);
    await userEvent.type(screen.getByPlaceholderText('Project name'), 'My Project');
    expect(setNewProjectName).toHaveBeenCalled();
  });

  it('Create button is disabled when name is empty', () => {
    render(<WorkspaceCreateProjectForm {...props} newProjectName="" />);
    const createBtn = screen.getByRole('button', { name: 'Create' });
    expect(createBtn).toBeDisabled();
  });

  it('Create button is enabled when name is provided', () => {
    render(<WorkspaceCreateProjectForm {...props} newProjectName="New Project" />);
    const createBtn = screen.getByRole('button', { name: 'Create' });
    expect(createBtn).not.toBeDisabled();
  });

  it('renders Cancel button', () => {
    render(<WorkspaceCreateProjectForm {...props} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = jest.fn();
    render(<WorkspaceCreateProjectForm {...props} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn();
    render(<WorkspaceCreateProjectForm {...props} newProjectName="Test" onSubmit={onSubmit} />);
    fireEvent.submit(document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

// ── WorkspaceProjectsBody ─────────────────────────────────────────────────────
describe('WorkspaceProjectsBody', () => {
  const baseProps = {
    starredProjects: [],
    regularProjects: [],
    showCreateForm: false,
    newProjectName: '',
    setNewProjectName: jest.fn(),
    onSubmitCreate: jest.fn(),
    onCancelCreate: jest.fn(),
  };

  it('renders "Projects" section heading', () => {
    render(<WorkspaceProjectsBody {...baseProps} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders empty state when no projects', () => {
    render(<WorkspaceProjectsBody {...baseProps} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('renders "Starred Projects" section when there are starred projects', () => {
    render(
      <WorkspaceProjectsBody
        {...baseProps}
        starredProjects={[{ id: 'p1', name: 'Starred' }]}
      />
    );
    expect(screen.getByText('⭐ Starred Projects')).toBeInTheDocument();
  });

  it('renders "All Projects" label when starred projects exist', () => {
    render(
      <WorkspaceProjectsBody
        {...baseProps}
        starredProjects={[{ id: 'p1', name: 'Starred' }]}
      />
    );
    expect(screen.getByText('All Projects')).toBeInTheDocument();
  });

  it('shows create form when showCreateForm is true', () => {
    render(<WorkspaceProjectsBody {...baseProps} showCreateForm={true} />);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('does not show create form when showCreateForm is false', () => {
    render(<WorkspaceProjectsBody {...baseProps} showCreateForm={false} />);
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });
});
