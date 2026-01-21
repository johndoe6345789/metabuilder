import { render, screen } from '@testing-library/react';
import TemplatesPage from './page';

jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

jest.mock('@/components/templates/TemplatesSection', () => ({
  TemplatesSection: () => <div data-testid="templates-section">Templates</div>,
}));

jest.mock('@/lib/db');
jest.mock('sonner');

describe('TemplatesPage', () => {
  test('renders page layout', () => {
    render(<TemplatesPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Templates heading', () => {
    render(<TemplatesPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Templates');
  });

  test('renders description text', () => {
    render(<TemplatesPage />);
    expect(screen.getByText(/page-level layouts/i)).toBeInTheDocument();
  });

  test('renders TemplatesSection component', () => {
    render(<TemplatesPage />);
    expect(screen.getByTestId('templates-section')).toBeInTheDocument();
  });

  test('heading has correct styling', () => {
    render(<TemplatesPage />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  test('description has muted foreground color', () => {
    render(<TemplatesPage />);
    const description = screen.getByText(/page-level layouts/i);
    expect(description).toBeInTheDocument();
  });

  test('motion div is rendered', () => {
    render(<TemplatesPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('renders within motion animation wrapper', () => {
    render(<TemplatesPage />);
    const motionDiv = screen.getByTestId('motion-div');
    const templatesSection = screen.getByTestId('templates-section');
    expect(motionDiv).toContainElement(templatesSection);
  });

  test('has proper page layout structure', () => {
    render(<TemplatesPage />);
    const layout = screen.getByTestId('page-layout');
    const motionDiv = screen.getByTestId('motion-div');
    expect(layout).toContainElement(motionDiv);
  });

  test('complete interfaces description is present', () => {
    render(<TemplatesPage />);
    expect(screen.getByText(/complete interfaces/i)).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<TemplatesPage />);
    expect(container).toBeInTheDocument();
  });
});
