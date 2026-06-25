/**
 * Tests for ErrorBoundary component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// A component that throws during render
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Safe content</div>;
};

// Suppress expected console.error output during tests
const suppressError = () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  return spy;
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders default fallback UI when a child throws', () => {
    const spy = suppressError();
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('uses custom fallback render prop when provided', () => {
    const spy = suppressError();
    const fallback = (error: Error, reset: () => void) => (
      <div>
        <span>Custom: {error.message}</span>
        <button onClick={reset}>Retry</button>
      </div>
    );
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom: Test error')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('resets error state when "Try Again" is clicked', async () => {
    const spy = suppressError();
    let throwError = true;

    const ToggleBomb = () => {
      if (throwError) throw new Error('Oops');
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleBomb />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    throwError = false;
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    rerender(
      <ErrorBoundary>
        <ToggleBomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders "Go Home" button in default fallback', () => {
    const spy = suppressError();
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    spy.mockRestore();
  });
});
