/**
 * Tests for TemplatesStats component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TemplatesStats from '../TemplatesStats';

describe('TemplatesStats', () => {
  it('renders the total templates count', () => {
    render(
      <TemplatesStats
        totalTemplates={42}
        totalDownloads={1000}
        averageRating={4.5}
      />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders downloads with locale formatting', () => {
    render(
      <TemplatesStats
        totalTemplates={10}
        totalDownloads={12345}
        averageRating={3.7}
      />
    );
    // toLocaleString() output is locale-dependent, but some number should be there
    expect(screen.getByText(/12[,.]?345/)).toBeInTheDocument();
  });

  it('renders average rating with one decimal place', () => {
    render(
      <TemplatesStats
        totalTemplates={5}
        totalDownloads={500}
        averageRating={4.123}
      />
    );
    expect(screen.getByText(/4\.1/)).toBeInTheDocument();
  });

  it('renders the stat labels', () => {
    render(
      <TemplatesStats
        totalTemplates={1}
        totalDownloads={1}
        averageRating={5}
      />
    );
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Avg Rating')).toBeInTheDocument();
  });

  it('renders a star emoji next to rating', () => {
    render(
      <TemplatesStats
        totalTemplates={1}
        totalDownloads={1}
        averageRating={4.0}
      />
    );
    expect(screen.getByText(/⭐/)).toBeInTheDocument();
  });
});
