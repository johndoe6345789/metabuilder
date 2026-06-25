import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Alert,
  LoadingSpinner,
  EmptyState,
  ErrorDisplay,
  SuccessDisplay,
} from './feedback';

describe('feedback atoms', () => {
  describe('Alert', () => {
    it('should render with a message', () => {
      render(<Alert severity="info">Info message</Alert>);
      expect(screen.getAllByText('Info message').length).toBeGreaterThan(0);
    });

    it('should render error severity', () => {
      render(<Alert severity="error">Error occurred</Alert>);
      expect(screen.getAllByText('Error occurred').length).toBeGreaterThan(0);
    });
  });

  describe('LoadingSpinner', () => {
    it('should render without crashing', () => {
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeDefined();
    });

    it('should render a circular progress element', () => {
      const { container } = render(<LoadingSpinner />);
      // MUI CircularProgress renders an SVG with role="progressbar"
      const spinner = container.querySelector('[role="progressbar"]');
      expect(spinner).not.toBeNull();
    });
  });

  describe('EmptyState', () => {
    it('should render with default message', () => {
      render(<EmptyState />);
      expect(
        screen.getAllByText('No data available').length,
      ).toBeGreaterThan(0);
    });

    it('should render with custom message', () => {
      render(<EmptyState message="No results found" />);
      expect(
        screen.getAllByText('No results found').length,
      ).toBeGreaterThan(0);
    });

    it('should render an icon when provided', () => {
      const icon = <span data-testid="test-icon">icon</span>;
      render(<EmptyState icon={icon} />);
      expect(screen.getAllByTestId('test-icon').length).toBeGreaterThan(0);
    });

    it('should render an action when provided', () => {
      const action = <button>Add Item</button>;
      render(<EmptyState action={action} />);
      expect(screen.getAllByText('Add Item').length).toBeGreaterThan(0);
    });
  });

  describe('ErrorDisplay', () => {
    it('should render null when error is null', () => {
      const { container } = render(<ErrorDisplay error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render the error message when error is provided', () => {
      render(<ErrorDisplay error="Something went wrong" />);
      expect(
        screen.getAllByText('Something went wrong').length,
      ).toBeGreaterThan(0);
    });

    it('should render a Retry button when onRetry is provided', () => {
      render(<ErrorDisplay error="Error" onRetry={vi.fn()} />);
      expect(screen.getAllByText('Retry').length).toBeGreaterThan(0);
    });

    it('should call onRetry when Retry is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const { container } = render(
        <ErrorDisplay error="Error" onRetry={onRetry} />,
      );
      const btn = container.querySelector('button');
      expect(btn).not.toBeNull();
      await user.click(btn!);
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe('SuccessDisplay', () => {
    it('should render null when message is null', () => {
      const { container } = render(<SuccessDisplay message={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render the success message', () => {
      render(<SuccessDisplay message="Operation completed!" />);
      expect(
        screen.getAllByText('Operation completed!').length,
      ).toBeGreaterThan(0);
    });

    it('should have a close button when onClose is provided', () => {
      const onClose = vi.fn();
      const { container } = render(
        <SuccessDisplay message="Done" onClose={onClose} />,
      );
      // MUI Alert with onClose renders a close button
      const closeBtn = container.querySelector('button[aria-label="Close"]');
      expect(closeBtn).not.toBeNull();
    });
  });
});
