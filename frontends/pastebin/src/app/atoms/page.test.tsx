import { render, screen } from '@testing-library/react';
import AtomsPage from './page';

// Mock PageLayout to avoid provider issues
jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

// Mock AtomsSection
jest.mock('@/components/atoms/AtomsSection', () => ({
  AtomsSection: () => <div data-testid="atoms-section">Atoms</div>,
}));

// Mock db and sonner
jest.mock('@/lib/db');
jest.mock('sonner');

describe('AtomsPage', () => {
  test('renders page layout', () => {
    render(<AtomsPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Atoms heading', () => {
    render(<AtomsPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Atoms');
  });

  test('renders description text', () => {
    render(<AtomsPage />);
    expect(screen.getByText(/fundamental building blocks/i)).toBeInTheDocument();
  });

  test('renders AtomsSection component', () => {
    render(<AtomsPage />);
    expect(screen.getByTestId('atoms-section')).toBeInTheDocument();
  });


  test('description has muted foreground color', () => {
    render(<AtomsPage />);
    const description = screen.getByText(/fundamental building blocks/i);
    expect(description).toHaveClass('text-muted-foreground');
  });

  test('motion div is rendered', () => {
    render(<AtomsPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('renders within motion animation wrapper', () => {
    render(<AtomsPage />);
    const motionDiv = screen.getByTestId('motion-div');
    const atomsSection = screen.getByTestId('atoms-section');
    expect(motionDiv).toContainElement(atomsSection);
  });

  test('has proper page layout structure', () => {
    render(<AtomsPage />);
    const layout = screen.getByTestId('page-layout');
    const motionDiv = screen.getByTestId('motion-div');
    expect(layout).toContainElement(motionDiv);
  });

  test('heading and description are present', () => {
    render(<AtomsPage />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Atoms');
  });

  test('component renders without crashing', () => {
    const { container } = render(<AtomsPage />);
    expect(container).toBeInTheDocument();
  });
});
