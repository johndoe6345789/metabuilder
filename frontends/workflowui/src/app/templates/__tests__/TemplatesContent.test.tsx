/**
 * Tests for TemplatesContent component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TemplatesContent from '../TemplatesContent';

const templates = [
  { id: 't1', name: 'Email Template', category: 'communication' },
  { id: 't2', name: 'HTTP Request', category: 'api' },
];

describe('TemplatesContent', () => {
  it('renders results count', () => {
    render(
      <TemplatesContent
        filteredTemplates={templates}
        allTemplatesCount={10}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    expect(screen.getByText('Showing 2 of 10 templates')).toBeInTheDocument();
  });

  it('renders grid view', () => {
    render(
      <TemplatesContent
        filteredTemplates={templates}
        allTemplatesCount={2}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    // Grid view renders a list with role="list"
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders list view', () => {
    render(
      <TemplatesContent
        filteredTemplates={templates}
        allTemplatesCount={2}
        viewMode="list"
        onResetFilters={jest.fn()}
      />
    );
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders empty state when no templates', () => {
    render(
      <TemplatesContent
        filteredTemplates={[]}
        allTemplatesCount={5}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });

  it('renders "Reset Filters" button when empty', () => {
    render(
      <TemplatesContent
        filteredTemplates={[]}
        allTemplatesCount={5}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });

  it('calls onResetFilters when reset button clicked', async () => {
    const onResetFilters = jest.fn();
    render(
      <TemplatesContent
        filteredTemplates={[]}
        allTemplatesCount={5}
        viewMode="grid"
        onResetFilters={onResetFilters}
      />
    );
    await userEvent.click(screen.getByText('Reset Filters'));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it('renders 0 of N when empty', () => {
    render(
      <TemplatesContent
        filteredTemplates={[]}
        allTemplatesCount={3}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    expect(screen.getByText('Showing 0 of 3 templates')).toBeInTheDocument();
  });

  it('shows emoji search icon in empty state', () => {
    render(
      <TemplatesContent
        filteredTemplates={[]}
        allTemplatesCount={5}
        viewMode="grid"
        onResetFilters={jest.fn()}
      />
    );
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});
