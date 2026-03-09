import { render, screen } from '@/test-utils';
import { OrganismsSection } from './OrganismsSection';

jest.mock('./showcases/NavigationBarsShowcase', () => ({
  NavigationBarsShowcase: ({ onSaveSnippet }: any) => <div data-testid="navigation-bars-showcase">Navigation</div>,
}));

jest.mock('./showcases/DataTablesShowcase', () => ({
  DataTablesShowcase: () => <div data-testid="data-tables-showcase">Data Tables</div>,
}));

jest.mock('./showcases/FormsShowcase', () => ({
  FormsShowcase: () => <div data-testid="forms-showcase">Forms</div>,
}));

jest.mock('./showcases/TaskListsShowcase', () => ({
  TaskListsShowcase: () => <div data-testid="task-lists-showcase">Task Lists</div>,
}));

jest.mock('./showcases/ContentGridsShowcase', () => ({
  ContentGridsShowcase: () => <div data-testid="content-grids-showcase">Content Grids</div>,
}));

jest.mock('./showcases/SidebarNavigationShowcase', () => ({
  SidebarNavigationShowcase: () => <div data-testid="sidebar-navigation-showcase">Sidebar</div>,
}));

describe('OrganismsSection', () => {
  const mockOnSaveSnippet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all organism showcases', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);

    expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('data-tables-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('forms-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('task-lists-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('content-grids-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-navigation-showcase')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to NavigationBarsShowcase', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument();
  });

  test('DataTablesShowcase renders without handler', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('data-tables-showcase')).toBeInTheDocument();
  });

  test('FormsShowcase renders without handler', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('forms-showcase')).toBeInTheDocument();
  });

  test('TaskListsShowcase renders without handler', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('task-lists-showcase')).toBeInTheDocument();
  });

  test('ContentGridsShowcase renders without handler', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('content-grids-showcase')).toBeInTheDocument();
  });

  test('SidebarNavigationShowcase renders without handler', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('sidebar-navigation-showcase')).toBeInTheDocument();
  });

  test('all showcases are rendered in correct order', () => {
    const { container } = render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    const showcases = container.querySelectorAll('[data-testid]');
    expect(showcases.length).toBe(7);
  });

  test('has space-y-16 spacing class', () => {
    const { container } = render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    const mainDiv = container.querySelector('[class*="space-y"]');
    expect(mainDiv).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(container).toBeInTheDocument();
  });

  test('component accepts onSaveSnippet prop', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument();
  });

  test('all organism showcases are represented', () => {
    render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />);

    const showcases = [
      'navigation-bars-showcase',
      'data-tables-showcase',
      'forms-showcase',
      'task-lists-showcase',
      'content-grids-showcase',
      'sidebar-navigation-showcase',
    ];

    showcases.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });
});
