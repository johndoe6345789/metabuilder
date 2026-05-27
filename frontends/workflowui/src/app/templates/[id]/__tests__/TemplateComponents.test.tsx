/**
 * Tests for template detail page sub-components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import TemplateNotFound from '../TemplateNotFound';
import TemplateTagsSection from '../TemplateTagsSection';
import TemplateWorkflowsList from '../TemplateWorkflowsList';

// ── TemplateNotFound ─────────────────────────────────────────────────────────
describe('TemplateNotFound', () => {
  it('renders "Template not found" heading', () => {
    render(<TemplateNotFound />);
    expect(screen.getByText('Template not found')).toBeInTheDocument();
  });

  it('renders descriptive text', () => {
    render(<TemplateNotFound />);
    expect(
      screen.getByText(/The template you.*re looking for/i)
    ).toBeInTheDocument();
  });

  it('renders a "Back to Templates" link/button', () => {
    render(<TemplateNotFound />);
    expect(
      screen.getByRole('button', { name: /back to templates/i })
    ).toBeInTheDocument();
  });
});

// ── TemplateTagsSection ──────────────────────────────────────────────────────
describe('TemplateTagsSection', () => {
  it('renders all provided tags', () => {
    render(<TemplateTagsSection tags={['automation', 'http', 'crm']} />);
    expect(screen.getByText('automation')).toBeInTheDocument();
    expect(screen.getByText('http')).toBeInTheDocument();
    expect(screen.getByText('crm')).toBeInTheDocument();
  });

  it('renders the "Tags" heading', () => {
    render(<TemplateTagsSection tags={['tag1']} />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('renders nothing extra for empty tags array', () => {
    render(<TemplateTagsSection tags={[]} />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
    // No tag boxes
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

// ── TemplateWorkflowsList ────────────────────────────────────────────────────
describe('TemplateWorkflowsList', () => {
  const workflows = [
    { id: 'wf-1', name: 'Email Notify', description: 'Send email on trigger' },
    { id: 'wf-2', name: 'Data Sync', description: 'Sync data between services' },
  ];

  it('renders all workflow names', () => {
    render(<TemplateWorkflowsList workflows={workflows} />);
    expect(screen.getByText('Email Notify')).toBeInTheDocument();
    expect(screen.getByText('Data Sync')).toBeInTheDocument();
  });

  it('renders workflow descriptions', () => {
    render(<TemplateWorkflowsList workflows={workflows} />);
    expect(screen.getByText('Send email on trigger')).toBeInTheDocument();
  });

  it('renders the heading with count', () => {
    render(<TemplateWorkflowsList workflows={workflows} />);
    expect(screen.getByText('Included Workflows (2)')).toBeInTheDocument();
  });

  it('renders "(0)" for empty workflows', () => {
    render(<TemplateWorkflowsList workflows={[]} />);
    expect(screen.getByText('Included Workflows (0)')).toBeInTheDocument();
  });
});
