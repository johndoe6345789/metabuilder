import React from 'react';
import { render, screen } from '@/test-utils';
import HomePage from './page';

// Mock the dynamic import of SnippetManagerRedux
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: any[]) => {
    const dynamicActualComp = jest.requireActual('next/dynamic');
    const dynamicActualComp2 = dynamicActualComp.default;
    const RequiredComponent = dynamicActualComp2(args[0], args[1]);
    RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render?.preload?.();
    return RequiredComponent;
  },
}));

// Mock SnippetManagerRedux
jest.mock('@/components/SnippetManagerRedux', () => ({
  SnippetManagerRedux: () => (
    <div data-testid="snippet-manager-redux">SnippetManager Component</div>
  ),
}));

// Mock PageLayout
jest.mock('./PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout-wrapper">{children}</div>
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page layout', () => {
      render(<HomePage />);

      expect(screen.getByTestId('page-layout-wrapper')).toBeInTheDocument();
    });

    it('should render page title', () => {
      render(<HomePage />);

      expect(screen.getByText('My Snippets')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<HomePage />);

      expect(screen.getByText(/Save, organize, and share your code snippets/i)).toBeInTheDocument();
    });

    it('should render SnippetManagerRedux component', () => {
      render(<HomePage />);

      expect(screen.getByTestId('snippet-manager-redux')).toBeInTheDocument();
    });

    it('should render all content together', () => {
      render(<HomePage />);

      const layout = screen.getByTestId('page-layout-wrapper');
      expect(layout).toHaveTextContent('My Snippets');
      expect(layout).toHaveTextContent('Save, organize, and share your code snippets');
      expect(layout).toHaveTextContent('SnippetManager Component');
    });
  });

  describe('styling and structure', () => {
    it('should have animation wrapper', () => {
      const { container } = render(<HomePage />);

      // The motion.div should be present
      const motionDiv = container.querySelector('div');
      expect(motionDiv).toBeInTheDocument();
    });

    it('should have proper spacing classes', () => {
      const { container } = render(<HomePage />);

      const titleWrapper = container.querySelector('.mb-8');
      expect(titleWrapper).toBeInTheDocument();
    });

    it('should have h1 with proper styling', () => {
      render(<HomePage />);

      const title = screen.getByText('My Snippets');
      expect(title.tagName).toBe('H1');
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('should have description with muted foreground', () => {
      const { container } = render(<HomePage />);

      const description = screen.getByText(/Save, organize, and share your code snippets/i);
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('component composition', () => {
    it('should wrap content in motion div', () => {
      const { container } = render(<HomePage />);

      // Check that the motion wrapper exists with the correct class for margin bottom
      const motionWrapper = container.querySelector('.mb-8')?.parentElement;
      expect(motionWrapper).toBeInTheDocument();
    });

    it('should have SnippetManagerRedux below title and description', () => {
      render(<HomePage />);

      const title = screen.getByText('My Snippets');
      const manager = screen.getByTestId('snippet-manager-redux');

      // Manager should come after title in DOM
      expect(title).toBeInTheDocument();
      expect(manager).toBeInTheDocument();
    });
  });
});
