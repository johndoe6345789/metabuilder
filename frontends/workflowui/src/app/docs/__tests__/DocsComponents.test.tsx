/**
 * Tests for docs page components and hooks
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';

import DocsContentArea from '../DocsContentArea';
import DocsSidebar from '../DocsSidebar';
import { useDocs } from '../hooks/useDocs';

const sampleCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    sections: [
      { id: 'intro', title: 'Introduction' },
      { id: 'install', title: 'Installation' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    sections: [
      { id: 'custom-nodes', title: 'Custom Nodes' },
    ],
  },
];

// ── DocsContentArea ───────────────────────────────────────────────────────────
describe('DocsContentArea', () => {
  const category = sampleCategories[0];
  const section = category.sections[0];

  it('renders the docs content area', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={false} />);
    expect(screen.getByTestId('docs-content')).toBeInTheDocument();
  });

  it('renders the section title', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={false} />);
    // Multiple occurrences of "Introduction" is expected (breadcrumb + heading)
    const titles = screen.getAllByText('Introduction');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders the category breadcrumb', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={false} />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders Previous and Next buttons', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={false} />);
    expect(screen.getByTestId('docs-previous')).toBeInTheDocument();
    expect(screen.getByTestId('docs-next')).toBeInTheDocument();
  });

  it('Previous button is disabled when isFirst is true', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={true} />);
    expect(screen.getByTestId('docs-previous')).toBeDisabled();
  });

  it('Previous button is enabled when isFirst is false', () => {
    render(<DocsContentArea currentCategory={category} currentSection={section} isFirst={false} />);
    expect(screen.getByTestId('docs-previous')).not.toBeDisabled();
  });

  it('renders gracefully with undefined section', () => {
    render(<DocsContentArea currentCategory={category} currentSection={undefined} isFirst={true} />);
    expect(screen.getByTestId('docs-content')).toBeInTheDocument();
  });
});

// ── DocsSidebar ───────────────────────────────────────────────────────────────
describe('DocsSidebar', () => {
  it('renders the sidebar', () => {
    render(
      <DocsSidebar
        categories={sampleCategories}
        selectedCategory="getting-started"
        selectedSection="intro"
        navigate={jest.fn()}
      />
    );
    expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument();
  });

  it('renders category titles', () => {
    render(
      <DocsSidebar
        categories={sampleCategories}
        selectedCategory="getting-started"
        selectedSection="intro"
        navigate={jest.fn()}
      />
    );
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('renders section buttons', () => {
    render(
      <DocsSidebar
        categories={sampleCategories}
        selectedCategory="getting-started"
        selectedSection="intro"
        navigate={jest.fn()}
      />
    );
    expect(screen.getByTestId('doc-section-intro')).toBeInTheDocument();
    expect(screen.getByTestId('doc-section-install')).toBeInTheDocument();
    expect(screen.getByTestId('doc-section-custom-nodes')).toBeInTheDocument();
  });

  it('calls navigate when a section button is clicked', async () => {
    const navigate = jest.fn();
    render(
      <DocsSidebar
        categories={sampleCategories}
        selectedCategory="getting-started"
        selectedSection="intro"
        navigate={navigate}
      />
    );
    await userEvent.click(screen.getByTestId('doc-section-install'));
    expect(navigate).toHaveBeenCalledWith('getting-started', 'install');
  });
});

// ── useDocs ───────────────────────────────────────────────────────────────────
describe('useDocs', () => {
  it('initializes with selectedCategory = "getting-started"', () => {
    const { result } = renderHook(() => useDocs());
    expect(result.current.selectedCategory).toBe('getting-started');
  });

  it('initializes with selectedSection = "intro"', () => {
    const { result } = renderHook(() => useDocs());
    expect(result.current.selectedSection).toBe('intro');
  });

  it('navigate updates selectedCategory and selectedSection', () => {
    const { result } = renderHook(() => useDocs());
    act(() => {
      result.current.navigate('advanced', 'custom-nodes');
    });
    expect(result.current.selectedCategory).toBe('advanced');
    expect(result.current.selectedSection).toBe('custom-nodes');
  });

  it('setSearchQuery updates searchQuery', () => {
    const { result } = renderHook(() => useDocs());
    act(() => {
      result.current.setSearchQuery('API');
    });
    expect(result.current.searchQuery).toBe('API');
  });

  it('returns categories array', () => {
    const { result } = renderHook(() => useDocs());
    expect(Array.isArray(result.current.categories)).toBe(true);
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('currentCategory matches selectedCategory', () => {
    const { result } = renderHook(() => useDocs());
    expect(result.current.currentCategory?.id).toBe('getting-started');
  });

  it('setActiveTocItem updates activeTocItem', () => {
    const { result } = renderHook(() => useDocs());
    act(() => {
      result.current.setActiveTocItem('configuration');
    });
    expect(result.current.activeTocItem).toBe('configuration');
  });
});
