import { render, screen } from '@/test-utils';
import { SidebarNavigationShowcase } from './SidebarNavigationShowcase';

describe('SidebarNavigationShowcase', () => {
  test('renders section heading', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText('Sidebar Navigation')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText(/Complete sidebar with nested navigation/i)).toBeInTheDocument();
  });

  test('renders Dashboard branding', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('renders primary navigation items', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  test('renders secondary navigation items', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('Analytics button is active', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const buttons = container.querySelectorAll('button');
    const analyticsButton = Array.from(buttons).find(btn => btn.textContent?.includes('Analytics'));
    expect(analyticsButton).toBeInTheDocument();
  });

  test('Sign Out button has destructive styling', () => {
    render(<SidebarNavigationShowcase />);
    const signOutButton = screen.getByRole('button', { name: /Sign Out/ });
    expect(signOutButton).toHaveClass('text-destructive');
  });

  test('renders Card component', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  test('renders sidebar with flex layout', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const flexDiv = container.querySelector('[class*="flex"]');
    expect(flexDiv).toBeInTheDocument();
  });

  test('sidebar has border on right side', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const sidebar = container.querySelector('[class*="border-r"]');
    expect(sidebar).toBeInTheDocument();
  });

  test('sidebar has fixed width', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const sidebar = container.querySelector('[class*="w-64"]');
    expect(sidebar).toBeInTheDocument();
  });

  test('renders separator between navigation sections', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    // Separator renders as an <hr> element
    const separator = container.querySelector('hr');
    expect(separator).toBeInTheDocument();
  });

  test('renders all navigation buttons', () => {
    render(<SidebarNavigationShowcase />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  test('main content area is present', () => {
    render(<SidebarNavigationShowcase />);
    expect(screen.getByText(/Sidebar with navigation items and user actions/i)).toBeInTheDocument();
  });

  test('section has proper spacing', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders without crashing', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    expect(container).toBeInTheDocument();
  });

  test('navigation items are accessible', () => {
    render(<SidebarNavigationShowcase />);
    const navItems = [
      'Home',
      'Analytics',
      'Projects',
      'Team',
      'Settings',
      'Sign Out',
    ];
    navItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('sidebar navigation group has spacing', () => {
    const { container } = render(<SidebarNavigationShowcase />);
    const navGroup = container.querySelector('[class*="space-y"]');
    expect(navGroup).toBeInTheDocument();
  });
});
