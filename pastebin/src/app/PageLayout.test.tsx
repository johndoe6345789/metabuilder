import React from 'react';
import { render, screen } from '@/test-utils';
import { PageLayout } from './PageLayout';

// Mock the navigation hook
jest.mock('@/components/layout/navigation/useNavigation', () => ({
  useNavigation: jest.fn(() => ({ menuOpen: false })),
}));

// Mock components to avoid rendering complex nested components
jest.mock('@/components/layout/navigation/NavigationSidebar', () => ({
  NavigationSidebar: () => <div data-testid="nav-sidebar">Navigation Sidebar</div>,
}));

jest.mock('@/components/layout/navigation/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

jest.mock('@/components/layout/BackendIndicator', () => ({
  BackendIndicator: () => <div data-testid="backend-indicator">Backend Indicator</div>,
}));

jest.mock('@/components/layout/AppStatusAlerts', () => ({
  AppStatusAlerts: () => <div data-testid="app-status-alerts">Status Alerts</div>,
}));

describe('PageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page layout container', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <PageLayout>
          <div data-testid="child-content">Test Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render NavigationSidebar', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('nav-sidebar')).toBeInTheDocument();
    });

    it('should render header with logo', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByTestId('logo-text')).toBeInTheDocument();
      expect(screen.getByText('CodeSnippet')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      render(
        <PageLayout>
          <div>Main Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('should render Navigation component in header', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should render BackendIndicator in header', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('backend-indicator')).toBeInTheDocument();
    });

    it('should render AppStatusAlerts in main content', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(screen.getByTestId('app-status-alerts')).toBeInTheDocument();
    });

    it('should render footer with information text', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const footerText = screen.getByText(/Save, organize, and share your code snippets/i);
      expect(footerText).toBeInTheDocument();

      const pyodideText = screen.getByText(/Supports React preview and Python execution via Pyodide/i);
      expect(pyodideText).toBeInTheDocument();
    });

    it('should render grid pattern background', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const gridPattern = container.querySelector('.grid-pattern');
      expect(gridPattern).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should have correct CSS classes for styling', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const layout = screen.getByTestId('page-layout');
      expect(layout).toHaveClass('min-h-screen', 'bg-background');
    });

    it('should have header with sticky positioning', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const header = screen.getByTestId('page-header');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('should structure main content properly', () => {
      const { container } = render(
        <PageLayout>
          <div data-testid="test-child">Content</div>
        </PageLayout>
      );

      const main = screen.getByTestId('main-content');
      expect(main).toHaveClass('container', 'mx-auto', 'flex-1');
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should have grid pattern marked as decorative', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const gridPattern = container.querySelector('.grid-pattern');
      expect(gridPattern).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have logo with aria-label', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      );

      const logo = screen.getByTestId('logo-text');
      expect(logo).toHaveAttribute('aria-label', 'CodeSnippet');
    });
  });
});
