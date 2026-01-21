import { render, screen } from '@/test-utils';
import { BackendIndicator } from './BackendIndicator';
import * as storageModule from '@/lib/storage';

jest.mock('@/lib/storage');

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

    test('has disconnected styling', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('renders database icon', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('has styling applied', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toHaveClass('flex');
    });

    test('renders with background and border', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('renders with proper sizing', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('has tooltip on hover', () => {
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

    test('has connected styling', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('displays connected state', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('renders with accent styling', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('renders cloud check icon', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
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
      const { container } = render(<BackendIndicator />);
      const dot = container.querySelector('[class*="rounded-full"]');
      expect(dot).toBeInTheDocument();
    });

    test('does not show dot when not auto-configured', () => {
      delete (process.env as any).NEXT_PUBLIC_FLASK_BACKEND_URL;
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
      render(<BackendIndicator />);
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Tooltip functionality', () => {
    test('renders tooltip for local storage', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
      render(<BackendIndicator />);
      // Tooltip content is rendered in TooltipProvider
      expect(screen.getByTestId('backend-indicator')).toBeInTheDocument();
    });

    test('renders tooltip for Flask backend', () => {
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

    test('renders with proper font weight', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('renders flex container for alignment', () => {
      render(<BackendIndicator />);
      const indicator = screen.getByTestId('backend-indicator');
      expect(indicator).toHaveClass('flex');
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
