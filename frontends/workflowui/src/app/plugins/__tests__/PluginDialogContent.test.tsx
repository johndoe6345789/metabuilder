/**
 * Tests for PluginDialogContent component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import PluginDialogContent from '../PluginDialogContent';

const makePlugin = (overrides = {}) => ({
  id: 'p1',
  name: 'HTTP Request',
  description: 'Make HTTP requests from your workflow.',
  version: '2.1.0',
  author: 'MetaBuilder',
  icon: '🌐',
  color: '#4CAF50',
  category: 'Integrations',
  rating: 4.5,
  downloads: 12500,
  installed: false,
  features: ['GET/POST/PUT/DELETE', 'JSON parsing', 'Auth headers'],
  tags: ['http', 'api'],
  ...overrides,
});

describe('PluginDialogContent', () => {
  it('renders plugin icon', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('renders plugin version', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
  });

  it('renders plugin author', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('By MetaBuilder')).toBeInTheDocument();
  });

  it('renders plugin description', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('Make HTTP requests from your workflow.')).toBeInTheDocument();
  });

  it('renders rating', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('⭐ 4.5/5.0')).toBeInTheDocument();
  });

  it('renders download count', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('⬇️ 12,500')).toBeInTheDocument();
  });

  it('renders category', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('Integrations')).toBeInTheDocument();
  });

  it('renders Features section', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('renders feature items', () => {
    render(<PluginDialogContent plugin={makePlugin()} />);
    expect(screen.getByText('GET/POST/PUT/DELETE')).toBeInTheDocument();
    expect(screen.getByText('JSON parsing')).toBeInTheDocument();
    expect(screen.getByText('Auth headers')).toBeInTheDocument();
  });

  it('does not show Installed chip when not installed', () => {
    render(<PluginDialogContent plugin={makePlugin({ installed: false })} />);
    expect(screen.queryByText('Installed')).not.toBeInTheDocument();
  });

  it('shows Installed chip when installed', () => {
    render(<PluginDialogContent plugin={makePlugin({ installed: true })} />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
  });
});
