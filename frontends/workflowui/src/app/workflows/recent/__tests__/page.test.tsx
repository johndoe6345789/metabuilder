/**
 * Tests for Recent Workflows Page
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock @metabuilder/hooks to avoid ESM/nanoid import errors
jest.mock('@metabuilder/hooks', () => ({
  useWorkflows: jest.fn(() => ({
    workflows: [
      {
        id: 'wf-1',
        name: 'API Integration',
        description: 'REST API workflow',
        status: 'active',
        version: '1.0.0',
        updatedAt: Date.now() - 60000,
        nodes: [{ id: 'n1' }, { id: 'n2' }],
      },
      {
        id: 'wf-2',
        name: 'Slack Notifier',
        description: 'Sends Slack notifications',
        status: 'active',
        version: '1.0.0',
        updatedAt: Date.now() - 120000,
        nodes: [{ id: 'n3' }],
      },
    ],
    isLoading: false,
    listWorkflows: jest.fn(),
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
  })),
}))

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>)

import RecentWorkflowsPage from '../page'

describe('RecentWorkflowsPage', () => {
  it('should render the recent workflows page container', () => {
    render(<RecentWorkflowsPage />)
    expect(screen.getByTestId('recent-page')).toBeInTheDocument()
  })

  it('should render "Recent Workflows" title', () => {
    render(<RecentWorkflowsPage />)
    expect(screen.getByText('Recent Workflows')).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<RecentWorkflowsPage />)
    expect(screen.getByText('Your recently updated workflows')).toBeInTheDocument()
  })

  describe('Workflow List', () => {
    it('should render workflow names', () => {
      render(<RecentWorkflowsPage />)
      expect(screen.getByText('API Integration')).toBeInTheDocument()
      expect(screen.getByText('Slack Notifier')).toBeInTheDocument()
    })

    it('should render workflow descriptions', () => {
      render(<RecentWorkflowsPage />)
      expect(screen.getByText('REST API workflow')).toBeInTheDocument()
      expect(screen.getByText('Sends Slack notifications')).toBeInTheDocument()
    })

    it('should render Edit buttons for workflows', () => {
      render(<RecentWorkflowsPage />)
      const editButtons = screen.getAllByText('Edit')
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('should render edit links to editor', () => {
      render(<RecentWorkflowsPage />)
      const editLinks = screen.getAllByRole('link')
      const editorLinks = editLinks.filter((link) =>
        link.getAttribute('href')?.startsWith('/editor/')
      )
      expect(editorLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Metadata', () => {
    it('should render time ago text for workflows', () => {
      render(<RecentWorkflowsPage />)
      // formatTimeAgo converts timestamp, recent timestamps show "X minutes ago"
      const timeTexts = screen.getAllByText(/ago|Just now/i)
      expect(timeTexts.length).toBeGreaterThan(0)
    })

    it('should render node count for each workflow', () => {
      render(<RecentWorkflowsPage />)
      // RecentWorkflowMeta shows node count
      expect(screen.getByText(/2 nodes/i)).toBeInTheDocument()
    })

    it('should render version numbers', () => {
      render(<RecentWorkflowsPage />)
      const versionTexts = screen.getAllByText(/v1\.0\.0/)
      expect(versionTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State', () => {
    it('should not render the page container when loading with no workflows', () => {
      const { useWorkflows } = require('@metabuilder/hooks')
      useWorkflows.mockReturnValueOnce({
        workflows: [],
        isLoading: true,
        listWorkflows: jest.fn(),
      })
      render(<RecentWorkflowsPage />)
      // In loading+empty state, the recent-page testid is not shown (loading spinner shown instead)
      expect(screen.queryByTestId('recent-page')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render empty state message when no workflows', () => {
      const { useWorkflows } = require('@metabuilder/hooks')
      useWorkflows.mockReturnValueOnce({
        workflows: [],
        isLoading: false,
        listWorkflows: jest.fn(),
      })
      render(<RecentWorkflowsPage />)
      expect(screen.getByText('No recent workflows')).toBeInTheDocument()
    })

    it('should show helpful message in empty state', () => {
      const { useWorkflows } = require('@metabuilder/hooks')
      useWorkflows.mockReturnValueOnce({
        workflows: [],
        isLoading: false,
        listWorkflows: jest.fn(),
      })
      render(<RecentWorkflowsPage />)
      expect(screen.getByText('Create or edit a workflow to see it here')).toBeInTheDocument()
    })
  })
})
