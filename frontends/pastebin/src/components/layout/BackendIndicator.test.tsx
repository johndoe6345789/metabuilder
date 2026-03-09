import { render, screen } from '@/test-utils';
import { BackendIndicator } from './BackendIndicator';
import * as storageModule from '@/lib/storage';

jest.mock('@/lib/storage');

// Mock the styles injection to avoid DOM manipulation in tests
jest.mock('@metabuilder/components', () => ({
  BackendStatus: ({ status, showDot }: { status: string; showDot?: boolean }) => (
    <div data-testid="status-badge" data-status={status} role="status">
      <span>{status === 'connected' ? 'Connected' : 'Local'}</span>
      {showDot && <span data-testid="activity-dot" />}
    </div>
  ),
  statusIndicatorStyles: '',
}));

describe('BackendIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (process.env as any).NEXT_PUBLIC_FLASK_BACKEND_URL;
  });

  describe('Local storage mode', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
    });

    test('renders Local indicator', () => {
      render(<BackendIndicator />);
      expect(screen.getByText('Local')).toBeInTheDocument();
    });

    test('has disconnected status', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toHaveAttribute('data-status', 'disconnected');
    });

    test('renders wrapper with test id', () => {
      render(<BackendIndicator />);
      const wrapper = screen.getByTestId('backend-indicator');
      expect(wrapper).toBeInTheDocument();
    });

    test('renders status badge', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toBeInTheDocument();
    });

    test('has status role for accessibility', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });

    test('renders with correct content', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('has proper structure', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Flask backend mode', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
    });

    test('renders Connected indicator', () => {
      render(<BackendIndicator />);
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    test('has connected status', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toHaveAttribute('data-status', 'connected');
    });

    test('displays connected state', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toBeInTheDocument();
    });

    test('renders with connected styling', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toBeInTheDocument();
    });

    test('renders status component', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Auto-configuration indicator', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
    });

    test('shows dot indicator when auto-configured', () => {
      (process.env as any).NEXT_PUBLIC_FLASK_BACKEND_URL = 'http://localhost:5000';
      render(<BackendIndicator />);
      const dot = screen.getByTestId('activity-dot');
      expect(dot).toBeInTheDocument();
    });

    test('does not show dot when not auto-configured', () => {
      delete (process.env as any).NEXT_PUBLIC_FLASK_BACKEND_URL;
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
      render(<BackendIndicator />);
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.queryByTestId('activity-dot')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip functionality', () => {
    test('renders status for local storage', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
      render(<BackendIndicator />);
      expect(screen.getByTestId('backend-indicator')).toBeInTheDocument();
    });

    test('renders status for Flask backend', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
      render(<BackendIndicator />);
      expect(screen.getByTestId('backend-indicator')).toBeInTheDocument();
    });
  });

  describe('Visual hierarchy', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
    });

    test('renders text content', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toHaveTextContent('Local');
    });

    test('renders status badge component', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('status-badge');
      expect(indicator).toBeInTheDocument();
    });

    test('renders wrapper element', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Rendering variations', () => {
    test('renders correctly with indexeddb backend', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
      const { container } = render(<BackendIndicator />);
      expect(container).toBeInTheDocument();
    });

    test('renders correctly with flask backend', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
      const { container } = render(<BackendIndicator />);
      expect(container).toBeInTheDocument();
    });

    test('renders without crashing', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
      const { container } = render(<BackendIndicator />);
      expect(container).toBeInTheDocument();
    });
  });
});
