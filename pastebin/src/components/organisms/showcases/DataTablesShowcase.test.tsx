import { render, screen } from '@/test-utils';
import { DataTablesShowcase } from './DataTablesShowcase';

describe('DataTablesShowcase', () => {
  test('renders section heading', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Data Tables')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText(/Structured data display with actions/i)).toBeInTheDocument();
  });

  test('renders table title', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  test('renders Export button', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  test('renders table headers', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  test('renders transaction rows', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.getByText('Processing payment')).toBeInTheDocument();
    expect(screen.getByText('Refund issued')).toBeInTheDocument();
    expect(screen.getByText('Payment declined')).toBeInTheDocument();
  });

  test('renders status badges', () => {
    render(<DataTablesShowcase />);
    expect(screen.getAllByText('Completed')).toHaveLength(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  test('renders transaction dates', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 14, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 13, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 12, 2024')).toBeInTheDocument();
  });

  test('renders transaction amounts', () => {
    render(<DataTablesShowcase />);
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('-$75.00')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('renders Card component', () => {
    const { container } = render(<DataTablesShowcase />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  test('renders Table component', () => {
    const { container } = render(<DataTablesShowcase />);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  test('renders TableHeader component', () => {
    const { container } = render(<DataTablesShowcase />);
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
  });

  test('renders TableBody with multiple rows', () => {
    const { container } = render(<DataTablesShowcase />);
    const tbody = container.querySelector('tbody');
    const rows = tbody?.querySelectorAll('tr');
    expect(rows?.length).toBe(4);
  });

  test('section has proper spacing', () => {
    const { container } = render(<DataTablesShowcase />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders without crashing', () => {
    const { container } = render(<DataTablesShowcase />);
    expect(container).toBeInTheDocument();
  });

  test('renders all transaction data correctly', () => {
    const { container } = render(<DataTablesShowcase />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
  });

  test('has border styling for table header', () => {
    const { container } = render(<DataTablesShowcase />);
    const headerDiv = container.querySelector('[class*="border-b"]');
    expect(headerDiv).toBeInTheDocument();
  });
});
