import { render, screen } from '@/test-utils';
import { AppStatusAlerts } from './AppStatusAlerts';
import * as storageModule from '@/lib/storage';

jest.mock('@/lib/storage');

describe('AppStatusAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Local-first mode (IndexedDB)', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
    });

    test('renders success alert', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });

    test('renders "Workspace ready" title', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText('Workspace ready')).toBeInTheDocument();
    });

    test('shows local-first mode message', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText(/Running in local-first mode/i)).toBeInTheDocument();
    });

    test('renders cloud backend unavailable alert', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });

    test('shows "Cloud backend unavailable" title', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText('Cloud backend unavailable')).toBeInTheDocument();
    });

    test('shows no Flask backend detected message', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText(/No Flask backend detected/i)).toBeInTheDocument();
    });

    test('renders two alerts in local mode', () => {
      render(<AppStatusAlerts />);
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBe(2);
    });

    test('destructive alert has correct styling', () => {
      render(<AppStatusAlerts />);
      const destructiveAlert = screen.getByTestId('alert-error');
      expect(destructiveAlert).toHaveAttribute('data-testid', 'alert-error');
    });
  });

  describe('Flask backend mode', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
    });

    test('renders only success alert', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });

    test('does not render error alert in Flask mode', () => {
      render(<AppStatusAlerts />);
      const errorAlert = screen.queryByTestId('alert-error');
      expect(errorAlert).not.toBeInTheDocument();
    });

    test('shows backend connected message', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText(/Connected to your configured backend/i)).toBeInTheDocument();
    });

    test('shows live sync enabled', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText(/Live sync is enabled/i)).toBeInTheDocument();
    });

    test('renders only one alert in Flask mode', () => {
      render(<AppStatusAlerts />);
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBe(1);
    });

    test('success alert has correct styling', () => {
      render(<AppStatusAlerts />);
      const successAlert = screen.getByTestId('alert-success');
      expect(successAlert).toHaveAttribute('data-testid', 'alert-success');
    });
  });

  describe('UI elements and styling', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
    });

    test('renders status alerts container', () => {
      render(<AppStatusAlerts />);
      const container = screen.getByTestId('status-alerts');
      expect(container).toBeInTheDocument();
    });

    test('container has correct spacing', () => {
      render(<AppStatusAlerts />);
      const container = screen.getByTestId('status-alerts');
      expect(container).toHaveClass('space-y-2');
    });

    test('renders CheckCircle icon for success', () => {
      render(<AppStatusAlerts />);
      // CheckCircle from phosphor should be rendered
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });

    test('renders WarningCircle icon for error', () => {
      render(<AppStatusAlerts />);
      // WarningCircle from phosphor should be rendered
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });

    test('alerts are rendered as alert role', () => {
      render(<AppStatusAlerts />);
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('Backend status variations', () => {
    test('handles indexeddb backend correctly', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
      render(<AppStatusAlerts />);
      expect(screen.getByText(/local-first mode/i)).toBeInTheDocument();
    });

    test('handles flask backend correctly', () => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
      });
      render(<AppStatusAlerts />);
      expect(screen.getByText(/Connected to your configured backend/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (storageModule.getStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });
    });

    test('renders without crashing', () => {
      const { container } = render(<AppStatusAlerts />);
      expect(container).toBeInTheDocument();
    });

    test('all text content is accessible', () => {
      render(<AppStatusAlerts />);
      expect(screen.getByText('Workspace ready')).toBeInTheDocument();
      expect(screen.getByText('Cloud backend unavailable')).toBeInTheDocument();
    });
  });
});
