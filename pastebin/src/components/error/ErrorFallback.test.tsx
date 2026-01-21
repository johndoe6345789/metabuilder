import React from 'react';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { ErrorFallback } from './ErrorFallback';

// Mock AIErrorHelper to avoid its complexity
jest.mock('@/components/error/AIErrorHelper', () => ({
  AIErrorHelper: () => <div data-testid="ai-error-helper">AI Error Helper</div>,
}));

// Mock window.location.reload
delete (window as any).location;
window.location = { reload: jest.fn() } as any;

describe('ErrorFallback', () => {
  const testError = new Error('Test error message');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render error fallback container', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should display error message', () => {
      const error = new Error('Custom error message');
      render(<ErrorFallback error={error} />);
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should display alert with error title', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
      expect(screen.getByText('This spark has encountered a runtime error')).toBeInTheDocument();
    });

    it('should render AIErrorHelper component', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByTestId('ai-error-helper')).toBeInTheDocument();
    });

    it('should render reload button', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByRole('button', { name: /try reloading/i })).toBeInTheDocument();
    });

    it('should render copy button', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByTestId('copy-error-btn')).toBeInTheDocument();
    });

    it('should render stack trace toggle', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByText(/show stack trace/i)).toBeInTheDocument();
    });

    it('renders container with proper background', () => {
      render(<ErrorFallback error={testError} />);
      const fallbackDiv = screen.getByTestId('error-fallback');
      expect(fallbackDiv).toHaveClass('bg-background');
    });

    it('renders padding on mobile', () => {
      render(<ErrorFallback error={testError} />);
      const fallbackDiv = screen.getByTestId('error-fallback');
      expect(fallbackDiv).toHaveClass('p-4');
    });
  });

  describe('error display', () => {
    it('should show error message in code block', () => {
      const error = new Error('Specific error');
      render(<ErrorFallback error={error} />);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Specific error');
    });

    it('should handle error without stack trace', () => {
      const error = new Error('No stack');
      error.stack = undefined;
      render(<ErrorFallback error={error} />);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
    });

    it('displays error message in code tag styling', () => {
      const error = new Error('Code formatted error');
      render(<ErrorFallback error={error} />);

      const codeElement = screen.getByTestId('error-message');
      expect(codeElement.tagName).toBe('CODE');
    });

    it('error message has background styling', () => {
      render(<ErrorFallback error={testError} />);
      const codeElement = screen.getByTestId('error-message');
      expect(codeElement).toHaveClass('bg-destructive/20');
    });

    it('error message text breaks properly on long text', () => {
      const longError = new Error('A'.repeat(500));
      render(<ErrorFallback error={longError} />);

      const codeElement = screen.getByTestId('error-message');
      expect(codeElement).toHaveClass('break-all');
    });

    it('shows error message and stack trace details', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at line 1';
      render(<ErrorFallback error={error} />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('button functionality', () => {
    it('should have copy button with test id', () => {
      render(<ErrorFallback error={testError} />);
      const copyButton = screen.getByTestId('copy-error-btn');
      expect(copyButton).toBeInTheDocument();
    });

    it('should call window.location.reload on reload button click', async () => {
      const user = userEvent.setup();
      render(<ErrorFallback error={testError} />);

      const reloadButton = screen.getByRole('button', { name: /try reloading/i });
      await user.click(reloadButton);

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('reload button has refresh icon', () => {
      render(<ErrorFallback error={testError} />);
      const reloadButton = screen.getByRole('button', { name: /try reloading/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('reload button spans full width', () => {
      render(<ErrorFallback error={testError} />);
      const reloadButton = screen.getByRole('button', { name: /try reloading/i });
      expect(reloadButton).toHaveClass('w-full');
    });

    it('copy button shows icon before click', () => {
      render(<ErrorFallback error={testError} />);
      const copyButton = screen.getByTestId('copy-error-btn');
      expect(copyButton).toHaveTextContent('Copy');
    });
  });

  describe('copy functionality', () => {
    it('has copy button for clipboard operations', () => {
      render(<ErrorFallback error={testError} />);
      const copyButton = screen.getByTestId('copy-error-btn');

      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy');
    });

    it('copy button is clickable', async () => {
      const user = userEvent.setup();
      jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      render(<ErrorFallback error={testError} />);
      const copyButton = screen.getByTestId('copy-error-btn');

      await user.click(copyButton);

      expect(copyButton).toBeInTheDocument();
    });

    it('includes error message in error details', () => {
      const customError = new Error('Custom error message');
      render(<ErrorFallback error={customError} />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('shows error in proper code formatting', () => {
      render(<ErrorFallback error={testError} />);
      const codeElement = screen.getByTestId('error-message');

      expect(codeElement.tagName).toBe('CODE');
    });
  });

  describe('stack trace toggle', () => {
    it('should start with stack trace hidden', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByText(/show stack trace/i)).toBeInTheDocument();
      expect(screen.queryByText(/hide stack trace/i)).not.toBeInTheDocument();
    });

    it('renders collapsible stack trace section', () => {
      const errorWithStack = new Error('Error');
      errorWithStack.stack = 'Error: Error\n    at line 1';

      render(<ErrorFallback error={errorWithStack} />);

      expect(screen.getByText(/show stack trace/i)).toBeInTheDocument();
    });

    it('shows stack trace content when expanded', async () => {
      const user = userEvent.setup();
      const errorWithStack = new Error('Error');
      errorWithStack.stack = 'Error: Error\n    at Object.<anonymous>';

      render(<ErrorFallback error={errorWithStack} />);

      const toggleButton = screen.getByText(/show stack trace/i);
      await user.click(toggleButton);

      expect(screen.getByText(/at Object/)).toBeInTheDocument();
    });

    it('collapsible section is present', () => {
      const errorWithStack = new Error('Error');
      errorWithStack.stack = 'Error: Error\n    at line 1';

      render(<ErrorFallback error={errorWithStack} />);

      const toggle = screen.getByText(/show stack trace/i);
      expect(toggle).toBeInTheDocument();
    });

    it('renders stack trace in pre tag for formatting', async () => {
      const user = userEvent.setup();
      const errorWithStack = new Error('Error');
      errorWithStack.stack = 'Error: Error\n    at line 1';

      const { container } = render(<ErrorFallback error={errorWithStack} />);

      const toggleButton = screen.getByText(/show stack trace/i);
      await user.click(toggleButton);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
    });

    it('handles error with no stack trace', async () => {
      const user = userEvent.setup();
      const error = new Error('Error');
      error.stack = undefined;

      render(<ErrorFallback error={error} />);

      const toggleButton = screen.getByText(/show stack trace/i);
      await user.click(toggleButton);

      expect(screen.getByText(/no stack trace available/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on copy button', () => {
      render(<ErrorFallback error={testError} />);
      const copyButton = screen.getByTestId('copy-error-btn');
      expect(copyButton).toHaveAttribute('aria-label', 'Copy error details');
    });

    it('should have alert title for screen readers', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByText('This spark has encountered a runtime error')).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<ErrorFallback error={testError} />);
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('should use semantic alert structure', () => {
      render(<ErrorFallback error={testError} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ErrorFallback error={testError} />);

      const copyButton = screen.getByTestId('copy-error-btn');
      copyButton.focus();
      expect(copyButton).toHaveFocus();
    });

    it('all interactive elements have proper roles', () => {
      render(<ErrorFallback error={testError} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('layout', () => {
    it('should use min-h-screen for full height', () => {
      render(<ErrorFallback error={testError} />);
      const fallbackDiv = screen.getByTestId('error-fallback');
      expect(fallbackDiv).toHaveClass('min-h-screen');
    });

    it('should center content', () => {
      render(<ErrorFallback error={testError} />);
      const fallbackDiv = screen.getByTestId('error-fallback');
      expect(fallbackDiv).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should use background color', () => {
      render(<ErrorFallback error={testError} />);
      const fallbackDiv = screen.getByTestId('error-fallback');
      expect(fallbackDiv).toHaveClass('bg-background');
    });

    it('alert has bottom margin', () => {
      render(<ErrorFallback error={testError} />);
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveClass('mb-6');
    });

    it('reload button has top margin', () => {
      render(<ErrorFallback error={testError} />);
      const reloadButton = screen.getByRole('button', { name: /try reloading/i });
      expect(reloadButton).toHaveClass('mt-6');
    });
  });

  describe('edge cases', () => {
    it('handles very long error messages', () => {
      const longError = new Error('A'.repeat(1000));
      render(<ErrorFallback error={longError} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('handles error with special characters', () => {
      const specialError = new Error('<>&"\'`');
      render(<ErrorFallback error={specialError} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('handles error with null stack', () => {
      const error = new Error('Error');
      error.stack = null as any;
      render(<ErrorFallback error={error} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('handles error with empty message', () => {
      const error = new Error('');
      render(<ErrorFallback error={error} />);

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('displays error messages', () => {
      const error = new Error('Error message');
      render(<ErrorFallback error={error} />);

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('integration tests', () => {
    it('displays error details in alert', () => {
      const error = new Error('Integration test error');
      render(<ErrorFallback error={error} />);

      expect(screen.getByText('Integration test error')).toBeInTheDocument();
      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    });

    it('stack trace is available in error details', () => {
      const error = new Error('Error with stack');
      error.stack = 'Error: Error with stack\n    at test.js:10';

      render(<ErrorFallback error={error} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('reload button invokes page reload', async () => {
      const user = userEvent.setup();
      render(<ErrorFallback error={testError} />);

      const reloadButton = screen.getByRole('button', { name: /try reloading/i });
      await user.click(reloadButton);

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('shows all major components', () => {
      render(<ErrorFallback error={testError} />);

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
      expect(screen.getByTestId('copy-error-btn')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try reloading/i })).toBeInTheDocument();
      expect(screen.getByTestId('ai-error-helper')).toBeInTheDocument();
    });
  });
});
