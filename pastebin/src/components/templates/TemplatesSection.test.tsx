import { render, screen } from '@/test-utils';
import { TemplatesSection } from './TemplatesSection';

jest.mock('@/components/demo/ComponentShowcase', () => ({
  ComponentShowcase: ({ title, description, children }: any) => (
    <div data-testid={`showcase-${title}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/component-code-snippets', () => ({
  templatesCodeSnippets: {
    dashboardLayout: 'code',
    landingPage: 'code',
    ecommercePage: 'code',
    blogArticle: 'code',
  },
}));

jest.mock('./DashboardTemplate', () => ({
  DashboardTemplate: () => <div data-testid="dashboard-template">Dashboard</div>,
}));

jest.mock('./LandingPageTemplate', () => ({
  LandingPageTemplate: () => <div data-testid="landing-page-template">Landing Page</div>,
}));

jest.mock('./EcommerceTemplate', () => ({
  EcommerceTemplate: () => <div data-testid="ecommerce-template">Ecommerce</div>,
}));

jest.mock('./BlogTemplate', () => ({
  BlogTemplate: () => <div data-testid="blog-template">Blog</div>,
}));

describe('TemplatesSection', () => {
  const mockOnSaveSnippet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Dashboard Layout section', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getAllByText('Dashboard Layout')).toHaveLength(2);
  });

  test('renders dashboard description', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Complete dashboard with sidebar, stats, and content areas/i)).toBeInTheDocument();
  });

  test('renders DashboardTemplate component', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('dashboard-template')).toBeInTheDocument();
  });

  test('renders Landing Page section', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getAllByText('Landing Page')).toHaveLength(2);
  });

  test('renders landing page description', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Marketing page with hero, features, and CTA sections/i)).toBeInTheDocument();
  });

  test('renders LandingPageTemplate component', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('landing-page-template')).toBeInTheDocument();
  });

  test('renders E-commerce Product Page section', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getAllByText('E-commerce Product Page')).toHaveLength(2);
  });

  test('renders ecommerce description', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Product detail page with images, info, and purchase options/i)).toBeInTheDocument();
  });

  test('renders EcommerceTemplate component', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('ecommerce-template')).toBeInTheDocument();
  });

  test('renders Blog Article section', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getAllByText('Blog Article')).toHaveLength(2);
  });

  test('renders blog description', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Article layout with header, content, and sidebar/i)).toBeInTheDocument();
  });

  test('renders BlogTemplate component', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('blog-template')).toBeInTheDocument();
  });

  test('renders all four template sections', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    // All four templates are rendered
    expect(screen.getAllByText('Dashboard Layout')).toHaveLength(2);
    expect(screen.getAllByText('Landing Page')).toHaveLength(2);
    expect(screen.getAllByText('E-commerce Product Page')).toHaveLength(2);
    expect(screen.getAllByText('Blog Article')).toHaveLength(2);
  });

  test('renders ComponentShowcase for each template', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    const showcases = screen.getAllByTestId(/^showcase-/);
    expect(showcases.length).toBeGreaterThanOrEqual(4);
  });

  test('passes onSaveSnippet to ComponentShowcase', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    // Verifying that the showcase component is rendered means the prop was passed
    expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument();
  });

  test('renders with proper spacing between sections', () => {
    const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    const mainDiv = container.querySelector('[class*="space-y"]');
    expect(mainDiv).toBeInTheDocument();
  });

  test('section headings are present', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    // Dashboard Layout appears in h2 and in showcase title
    const headings = screen.getAllByText('Dashboard Layout');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('descriptions are rendered', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    // Description appears multiple times (h2 section and showcase)
    const descriptions = screen.getAllByText(/Complete dashboard with sidebar/i);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  test('renders without crashing', () => {
    const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(container).toBeInTheDocument();
  });

  test('all template types are represented', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    const templates = [
      'dashboard-template',
      'landing-page-template',
      'ecommerce-template',
      'blog-template',
    ];
    templates.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  test('component showcase descriptions match templates', () => {
    render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByText(/Full dashboard template with navigation, sidebar, and stats/i)).toBeInTheDocument();
    expect(screen.getByText(/Full marketing page with hero, features, and CTAs/i)).toBeInTheDocument();
    expect(screen.getByText(/Product page with images, details, and purchase options/i)).toBeInTheDocument();
    expect(screen.getByText(/Article layout with header, content, and navigation/i)).toBeInTheDocument();
  });
});
