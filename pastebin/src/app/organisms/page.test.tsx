import { render, screen } from '@testing-library/react';
import OrganismsPage from './page';

jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

jest.mock('@/components/organisms/OrganismsSection', () => ({
  OrganismsSection: () => <div data-testid="organisms-section">Organisms</div>,
}));

jest.mock('@/lib/db');
jest.mock('sonner');

describe('OrganismsPage', () => {
  test('renders page layout', () => {
    render(<OrganismsPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Organisms heading', () => {
    render(<OrganismsPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Organisms');
  });

  test('renders description text', () => {
    render(<OrganismsPage />);
    expect(screen.getByText(/complex UI components composed/i)).toBeInTheDocument();
  });

  test('renders OrganismsSection component', () => {
    render(<OrganismsPage />);
    expect(screen.getByTestId('organisms-section')).toBeInTheDocument();
  });

  test('heading has correct styling', () => {
    render(<OrganismsPage />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  test('description has muted foreground color', () => {
    render(<OrganismsPage />);
    const description = screen.getByText(/complex UI components/i);
    expect(description).toBeInTheDocument();
  });

  test('motion div is rendered', () => {
    render(<OrganismsPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('renders within motion animation wrapper', () => {
    render(<OrganismsPage />);
    const motionDiv = screen.getByTestId('motion-div');
    const organismsSection = screen.getByTestId('organisms-section');
    expect(motionDiv).toContainElement(organismsSection);
  });

  test('has proper page layout structure', () => {
    render(<OrganismsPage />);
    const layout = screen.getByTestId('page-layout');
    const motionDiv = screen.getByTestId('motion-div');
    expect(layout).toContainElement(motionDiv);
  });

  test('molecules and atoms description is present', () => {
    render(<OrganismsPage />);
    expect(screen.getByText(/molecules and atoms/i)).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<OrganismsPage />);
    expect(container).toBeInTheDocument();
  });
});
