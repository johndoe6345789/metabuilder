/**
 * Tests for ErrorDetails component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorDetails from '../ErrorDetails';

const makeError = (message = 'Test error', stack = 'Error: Test\n  at Comp'): Error => {
  const err = new Error(message);
  err.stack = stack;
  return err;
};

describe('ErrorDetails', () => {
  describe('in production environment', () => {
    const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: ORIGINAL_NODE_ENV,
        writable: true,
        configurable: true,
      });
    });

    it('renders nothing in production', () => {
      const { container } = render(
        <ErrorDetails error={makeError()} errorInfo={null} />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('in development environment', () => {
    const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: ORIGINAL_NODE_ENV,
        writable: true,
        configurable: true,
      });
    });

    it('renders the error message', () => {
      render(
        <ErrorDetails error={makeError('Something failed')} errorInfo={null} />
      );
      expect(screen.getByText('Something failed')).toBeInTheDocument();
    });

    it('renders the error stack trace', () => {
      const stack = 'Error: Test\n  at Something (foo.ts:1:2)';
      render(
        <ErrorDetails error={makeError('X', stack)} errorInfo={null} />
      );
      // The stack is inside the second <pre> element
      const pres = document.querySelectorAll('pre');
      const allText = Array.from(pres).map((p) => p.textContent ?? '').join(' ');
      expect(allText).toContain('at Something');
    });

    it('renders component stack when errorInfo is provided', () => {
      render(
        <ErrorDetails
          error={makeError()}
          errorInfo={{ componentStack: '\n  in MyComponent\n  in App' } as any}
        />
      );
      expect(screen.getByText(/in MyComponent/)).toBeInTheDocument();
    });

    it('does not render component stack when errorInfo is null', () => {
      render(
        <ErrorDetails error={makeError()} errorInfo={null} />
      );
      expect(screen.queryByText(/Component Stack/)).not.toBeInTheDocument();
    });

    it('renders "Error Details" summary text', () => {
      render(
        <ErrorDetails error={makeError()} errorInfo={null} />
      );
      expect(screen.getByText('Error Details')).toBeInTheDocument();
    });
  });
});
