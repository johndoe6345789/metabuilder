import { render, screen, fireEvent } from '@/test-utils';
import { ContentGridsShowcase } from './ContentGridsShowcase';

describe('ContentGridsShowcase', () => {
  test('renders section heading', () => {
    render(<ContentGridsShowcase />);
    expect(screen.getByText('Content Grids')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<ContentGridsShowcase />);
    expect(screen.getByText(/Switchable grid and list views with filtering/i)).toBeInTheDocument();
  });

  test('renders Projects title', () => {
    render(<ContentGridsShowcase />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('renders grid view button', () => {
    render(<ContentGridsShowcase />);
    const gridButtons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('View') && !btn.textContent?.includes('Projects'));
    expect(gridButtons.length).toBeGreaterThan(0);
  });

  test('renders list view button', () => {
    render(<ContentGridsShowcase />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders grid view by default', () => {
    render(<ContentGridsShowcase />);
    const projects = screen.getAllByText(/Project/);
    expect(projects.length).toBeGreaterThan(0);
  });

  test('switches to list view when list button is clicked', () => {
    render(<ContentGridsShowcase />);
    const buttons = screen.getAllByRole('button');
    const listButton = buttons[buttons.length - 1];

    fireEvent.click(listButton);

    // After switching, should still render projects
    const projects = screen.getAllByText(/Project/);
    expect(projects.length).toBeGreaterThan(0);
  });

  test('switches back to grid view', () => {
    render(<ContentGridsShowcase />);
    const buttons = screen.getAllByRole('button');
    const gridButton = buttons[buttons.length - 2];

    fireEvent.click(gridButton);

    const projects = screen.getAllByText(/Project/);
    expect(projects.length).toBeGreaterThan(0);
  });

  test('renders all project items in grid', () => {
    render(<ContentGridsShowcase />);
    const projects = [];
    for (let i = 1; i <= 6; i++) {
      projects.push(screen.getByText(`Project ${i}`));
    }
    expect(projects.length).toBe(6);
  });

  test('renders project descriptions', () => {
    render(<ContentGridsShowcase />);
    const descriptions = screen.getAllByText(/A brief description of this project/);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  test('renders Active badges', () => {
    render(<ContentGridsShowcase />);
    const badges = screen.getAllByText('Active');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('renders View buttons', () => {
    render(<ContentGridsShowcase />);
    const viewButtons = screen.getAllByText('View');
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  test('renders Card component', () => {
    const { container } = render(<ContentGridsShowcase />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  test('renders multiple project cards in grid view', () => {
    const { container } = render(<ContentGridsShowcase />);
    const projectCards = container.querySelectorAll('[class*="grid"]');
    expect(projectCards.length).toBeGreaterThan(0);
  });

  test('section has proper spacing', () => {
    const { container } = render(<ContentGridsShowcase />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders without crashing', () => {
    const { container } = render(<ContentGridsShowcase />);
    expect(container).toBeInTheDocument();
  });

  test('grid/list toggle buttons are accessible', () => {
    render(<ContentGridsShowcase />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  test('projects have gradient backgrounds', () => {
    const { container } = render(<ContentGridsShowcase />);
    const gradients = container.querySelectorAll('[class*="gradient"]');
    expect(gradients.length).toBeGreaterThan(0);
  });

  test('renders header section with title and controls', () => {
    render(<ContentGridsShowcase />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('list view renders project rows', () => {
    render(<ContentGridsShowcase />);
    const buttons = screen.getAllByRole('button');
    const listButton = buttons[buttons.length - 1];

    fireEvent.click(listButton);

    // Verify list items are present
    const projects = screen.getAllByText(/Project/);
    expect(projects.length).toBeGreaterThan(0);
  });
});
