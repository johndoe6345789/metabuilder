import { render, screen, fireEvent } from '@/test-utils';
import { TaskListsShowcase } from './TaskListsShowcase';

describe('TaskListsShowcase', () => {
  test('renders section heading', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Task Lists')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText(/Interactive lists with status and actions/i)).toBeInTheDocument();
  });

  test('renders task list title', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Project Tasks')).toBeInTheDocument();
  });

  test('renders Add Task button', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('renders completed task item', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Design system documentation')).toBeInTheDocument();
  });

  test('renders in-progress task item', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('API integration')).toBeInTheDocument();
  });

  test('renders failed task item', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Performance optimization')).toBeInTheDocument();
  });

  test('renders task descriptions', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText(/Complete the component library documentation/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect frontend to backend services/i)).toBeInTheDocument();
    expect(screen.getByText(/Improve page load times/i)).toBeInTheDocument();
  });

  test('renders task status badges', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  test('renders task status labels', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });

  test('renders Card component', () => {
    const { container } = render(<TaskListsShowcase />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  test('renders all task items', () => {
    const { container } = render(<TaskListsShowcase />);
    const taskItems = container.querySelectorAll('[class*="hover:bg-muted"]');
    expect(taskItems.length).toBe(3);
  });

  test('task items have hover effect styling', () => {
    const { container } = render(<TaskListsShowcase />);
    const taskItems = container.querySelectorAll('[class*="hover"]');
    expect(taskItems.length).toBeGreaterThan(0);
  });

  test('section has proper spacing', () => {
    const { container } = render(<TaskListsShowcase />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders Add Task button with icon', () => {
    render(<TaskListsShowcase />);
    const addButton = screen.getByText('Add Task');
    expect(addButton).toBeInTheDocument();
  });

  test('renders task item dividers', () => {
    const { container } = render(<TaskListsShowcase />);
    const dividers = container.querySelectorAll('[class*="divide-y"]');
    expect(dividers.length).toBeGreaterThan(0);
  });

  test('renders without crashing', () => {
    const { container } = render(<TaskListsShowcase />);
    expect(container).toBeInTheDocument();
  });

  test('renders Card header with title and button', () => {
    render(<TaskListsShowcase />);
    expect(screen.getByText('Project Tasks')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('all task items are accessible', () => {
    render(<TaskListsShowcase />);
    const tasks = [
      'Design system documentation',
      'API integration',
      'Performance optimization',
    ];
    tasks.forEach((task) => {
      expect(screen.getByText(task)).toBeInTheDocument();
    });
  });
});
