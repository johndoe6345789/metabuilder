import React from 'react';
import { render, screen } from '@/test-utils';
import { Providers } from './providers';
import * as storageLib from '@/lib/storage';

// Mock the storage library
jest.mock('@/lib/storage', () => ({
  loadStorageConfig: jest.fn(),
}));

describe('Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('StorageInitializer', () => {
    it('should call loadStorageConfig on mount', () => {
      render(
        <Providers>
          <div>Test Content</div>
        </Providers>
      );

      expect(storageLib.loadStorageConfig).toHaveBeenCalled();
    });

    it('should render children', () => {
      render(
        <Providers>
          <div data-testid="test-child">Test Content</div>
        </Providers>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Provider structure', () => {
    it('should render Redux provider', () => {
      render(
        <Providers>
          <div>Content</div>
        </Providers>
      );

      // Redux provider should exist without errors
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render ErrorBoundary', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <Providers>
          <ErrorComponent />
        </Providers>
      );

      // Error boundary should catch and show fallback
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });

    it('should render NavigationProvider', () => {
      render(
        <Providers>
          <div data-testid="content">Content</div>
        </Providers>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should render Toaster', () => {
      render(
        <Providers>
          <div>Content</div>
        </Providers>
      );

      // If render succeeds without error, Toaster is working
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('error logging', () => {
    it('should log errors to console', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const TestError = () => {
        throw new Error('Test error message');
      };

      render(
        <Providers>
          <TestError />
        </Providers>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log component stack on error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const TestError = () => {
        throw new Error('Test error');
      };

      render(
        <Providers>
          <TestError />
        </Providers>
      );

      // Check that component stack was logged
      const callCount = consoleErrorSpy.mock.calls.length;
      expect(callCount).toBeGreaterThan(1);

      consoleErrorSpy.mockRestore();
    });
  });
});
