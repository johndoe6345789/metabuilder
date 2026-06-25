/**
 * Tests for ExecutionToolbar component
 */

const mockUseWorkflow = jest.fn();
const mockUseExecution = jest.fn();
const mockUseUI = jest.fn();

jest.mock('@metabuilder/hooks-data', () => ({
  useWorkflow: () => mockUseWorkflow(),
  useExecution: () => mockUseExecution(),
}));

jest.mock('../../../../hooks', () => ({
  useUI: () => mockUseUI(),
}));

// Mock toolbarHandlers so we can spy on them
const mockDoSave = jest.fn();
const mockDoExecute = jest.fn();
const mockDoValidate = jest.fn();

jest.mock('../toolbarHandlers', () => ({
  doSave: (...args: any[]) => mockDoSave(...args),
  doExecute: (...args: any[]) => mockDoExecute(...args),
  doValidate: (...args: any[]) => mockDoValidate(...args),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutionToolbar } from '../ExecutionToolbar';

describe('ExecutionToolbar', () => {
  const makeWorkflow = (overrides = {}) => ({
    workflow: { id: 'wf-1', name: 'Test' },
    isDirty: false,
    isSaving: false,
    save: jest.fn(),
    validate: jest.fn(),
    ...overrides,
  });

  const makeExecution = (overrides = {}) => ({
    currentExecution: null,
    execute: jest.fn(),
    ...overrides,
  });

  const makeUI = () => ({
    setLoading: jest.fn(),
    setLoadingMessage: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkflow.mockReturnValue(makeWorkflow());
    mockUseExecution.mockReturnValue(makeExecution());
    mockUseUI.mockReturnValue(makeUI());
  });

  it('renders Save button', () => {
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/save workflow/i)).toBeInTheDocument();
  });

  it('renders Execute button', () => {
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/execute workflow/i)).toBeInTheDocument();
  });

  it('renders Validate button', () => {
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/validate workflow/i)).toBeInTheDocument();
  });

  it('Save button is disabled when not dirty', () => {
    mockUseWorkflow.mockReturnValue(makeWorkflow({ isDirty: false }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/save workflow/i)).toBeDisabled();
  });

  it('Save button is enabled when dirty', () => {
    mockUseWorkflow.mockReturnValue(makeWorkflow({ isDirty: true }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/save workflow/i)).not.toBeDisabled();
  });

  it('Save button is disabled when saving', () => {
    mockUseWorkflow.mockReturnValue(makeWorkflow({ isDirty: true, isSaving: true }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/save workflow/i)).toBeDisabled();
  });

  it('Execute button is disabled when no workflow', () => {
    mockUseWorkflow.mockReturnValue(makeWorkflow({ workflow: null }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/execute workflow/i)).toBeDisabled();
  });

  it('Execute button is disabled when executing', () => {
    mockUseExecution.mockReturnValue(makeExecution({
      currentExecution: { status: 'running' },
    }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    expect(screen.getByTitle(/execute workflow/i)).toBeDisabled();
  });

  it('clicking Save calls doSave', () => {
    mockUseWorkflow.mockReturnValue(makeWorkflow({ isDirty: true }));
    render(<ExecutionToolbar workflowId="wf-1" />);
    fireEvent.click(screen.getByTitle(/save workflow/i));
    expect(mockDoSave).toHaveBeenCalled();
  });

  it('clicking Execute calls doExecute', () => {
    render(<ExecutionToolbar workflowId="wf-1" />);
    fireEvent.click(screen.getByTitle(/execute workflow/i));
    expect(mockDoExecute).toHaveBeenCalled();
  });

  it('clicking Validate calls doValidate', () => {
    render(<ExecutionToolbar workflowId="wf-1" />);
    fireEvent.click(screen.getByTitle(/validate workflow/i));
    expect(mockDoValidate).toHaveBeenCalled();
  });
});
