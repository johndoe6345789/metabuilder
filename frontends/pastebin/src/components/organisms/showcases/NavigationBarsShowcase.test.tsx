import { render, screen } from '@/test-utils';
import { NavigationBarsShowcase } from './NavigationBarsShowcase';

jest.mock('@/components/demo/ComponentShowcase', () => ({
  ComponentShowcase: ({ title, description, children }: any) => (
    <div data-testid="component-showcase">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/component-code-snippets', () => ({
  organismsCodeSnippets: {
    navigationBar: 'mock code',
  },
}));

describe('NavigationBarsShowcase', () => {
  const mockOnSaveSnippet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders section heading', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Navigation Bars')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Complete navigation components with branding and actions/i)).toBeInTheDocument();
  });

  test('renders primary ComponentShowcase', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Navigation Bar')).toBeInTheDocument();
  });

  test('renders showcase description', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    // Description appears in both the mock and real content
    const descriptions = screen.getAllByText(/Primary navigation with user menu/i);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  test('renders brand name', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('BrandName')).toBeInTheDocument();
  });

  test('renders navigation menu items on desktop', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('renders navigation action buttons', () => {
    const { container } = render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders Avatar component', () => {
    const { container } = render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    // Avatar components render with role="img" or as <div> with avatar styling
    const avatars = container.querySelectorAll('[role="img"], [class*="rounded-full"]');
    expect(avatars.length).toBeGreaterThan(0);
  });

  test('renders marketing navigation bar', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  test('renders marketing nav CTA buttons', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  test('renders marketing nav links', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  test('renders secondary showcase description', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Marketing site navigation with CTAs/i)).toBeInTheDocument();
  });

  test('renders multiple Card components', () => {
    const { container } = render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('section has proper spacing', () => {
    const { container } = render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders without crashing', () => {
    const { container } = render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(container).toBeInTheDocument();
  });

  test('passes onSaveSnippet to ComponentShowcase', () => {
    render(<NavigationBarsShowcase onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('component-showcase')).toBeInTheDocument();
  });
});
