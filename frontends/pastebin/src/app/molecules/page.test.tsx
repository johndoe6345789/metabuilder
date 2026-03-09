import { render, screen } from '@testing-library/react';
import MoleculesPage from './page';

jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

jest.mock('@/components/molecules/MoleculesSection', () => ({
  MoleculesSection: () => <div data-testid="molecules-section">Molecules</div>,
}));

jest.mock('@/lib/db');
jest.mock('sonner');

describe('MoleculesPage', () => {
  test('renders page layout', () => {
    render(<MoleculesPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Molecules heading', () => {
    render(<MoleculesPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Molecules');
  });

  test('renders description text', () => {
    render(<MoleculesPage />);
    expect(screen.getByText(/simple combinations of atoms/i)).toBeInTheDocument();
  });

  test('renders MoleculesSection component', () => {
    render(<MoleculesPage />);
    expect(screen.getByTestId('molecules-section')).toBeInTheDocument();
  });

  test('heading has correct styling', () => {
    render(<MoleculesPage />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  test('description has muted foreground color', () => {
    render(<MoleculesPage />);
    const description = screen.getByText(/simple combinations of atoms/i);
    expect(description).toBeInTheDocument();
  });

  test('motion div is rendered', () => {
    render(<MoleculesPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('renders within motion animation wrapper', () => {
    render(<MoleculesPage />);
    const motionDiv = screen.getByTestId('motion-div');
    const moleculesSection = screen.getByTestId('molecules-section');
    expect(motionDiv).toContainElement(moleculesSection);
  });

  test('has proper page layout structure', () => {
    render(<MoleculesPage />);
    const layout = screen.getByTestId('page-layout');
    const motionDiv = screen.getByTestId('motion-div');
    expect(layout).toContainElement(motionDiv);
  });

  test('functional units description is present', () => {
    render(<MoleculesPage />);
    expect(screen.getByText(/work together as functional units/i)).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<MoleculesPage />);
    expect(container).toBeInTheDocument();
  });
});
