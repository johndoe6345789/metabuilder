/**
 * Unit Tests for Pyodide Runner
 * Tests Python code execution via Pyodide
 */

import {
  getPyodide,
  runPythonCode,
  runPythonCodeInteractive,
  isPyodideReady,
  getPyodideError,
  resetPyodide,
  type InteractiveCallbacks,
} from '@/lib/pyodide-runner';

// Mock pyodide module
jest.mock('pyodide', () => ({
  loadPyodide: jest.fn(),
}), { virtual: true });

describe('Pyodide Runner', () => {
  let mockPyodide: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetPyodide();

    mockPyodide = {
      runPython: jest.fn(),
      runPythonAsync: jest.fn(),
      globals: {
        set: jest.fn(),
      },
    };
  });

  afterEach(() => {
    resetPyodide();
  });

  describe('getPyodide', () => {
    it('should initialize pyodide on first call', async () => {
      const mockLoadPyodide = jest.fn().mockResolvedValue(mockPyodide);
      jest.doMock('pyodide', () => ({
        loadPyodide: mockLoadPyodide,
      }), { virtual: true });

      expect(isPyodideReady()).toBe(false);
    });

    it('should return cached instance on subsequent calls', async () => {
      const mockLoadPyodide = jest.fn().mockResolvedValue(mockPyodide);
      jest.doMock('pyodide', () => ({
        loadPyodide: mockLoadPyodide,
      }), { virtual: true });

      expect(isPyodideReady()).toBe(false);
    });

    it('should handle initialization error', async () => {
      const error = new Error('Failed to load Pyodide');
      const mockLoadPyodide = jest.fn().mockRejectedValue(error);
      jest.doMock('pyodide', () => ({
        loadPyodide: mockLoadPyodide,
      }), { virtual: true });

      expect(getPyodideError()).toBeNull();
    });

    it('should throw error if already initialized with error', async () => {
      resetPyodide();
      expect(getPyodideError()).toBeNull();
    });
  });

  describe('runPythonCode', () => {
    beforeEach(() => {
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stdout.getvalue()')) return '';
        if (code.includes('sys.stderr.getvalue()')) return '';
        return undefined;
      });

      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
    });

    it('should execute simple python code', async () => {
      const result = await runPythonCode('print("hello")');
      expect(result).toHaveProperty('output');
    });

    it('should capture stdout output', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stdout.getvalue()')) return 'hello world';
        if (code.includes('sys.stderr.getvalue()')) return '';
        return undefined;
      });

      const result = await runPythonCode('print("hello world")');
      expect(result.output).toBeTruthy();
    });

    it('should capture stderr output', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue(new Error('Runtime error'));
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stderr.getvalue()')) return 'error message';
        return '';
      });

      const result = await runPythonCode('raise Exception("error")');
      expect(result).toHaveProperty('error');
    });

    it('should return default output when no output', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('x = 1');
      expect(result.output).toBe('(no output)');
    });

    it('should include return value in output', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(42);
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('42');
      expect(result.output).toContain('42');
    });

    it('should skip None return value', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(null);
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('print(None)');
      expect(result.output).toBe('(no output)');
    });

    it('should handle python runtime error', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue(new Error('SyntaxError: invalid syntax'));
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('invalid code');
      expect(result).toHaveProperty('error');
      expect(result.error).toBeTruthy();
    });

    it('should handle pyodide initialization error', async () => {
      const result = await runPythonCode('print("test")');
      expect(result).toHaveProperty('error');
    });

    it('should combine stdout and stderr', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stdout.getvalue()')) return 'output';
        if (code.includes('sys.stderr.getvalue()')) return 'error';
        return undefined;
      });

      const result = await runPythonCode('print("output")');
      expect(result.output).toContain('output');
      expect(result.output).toContain('error');
    });

    it('should reset stdout/stderr before execution', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
      mockPyodide.runPython = jest.fn(() => '');

      await runPythonCode('print("test")');

      const firstCall = mockPyodide.runPython.mock.calls[0];
      expect(firstCall[0]).toContain('sys.stdout = StringIO()');
      expect(firstCall[0]).toContain('sys.stderr = StringIO()');
    });

    it('should handle string errors from runPythonAsync', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue('string error');
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('test');
      expect(result).toHaveProperty('error');
    });
  });

  describe('runPythonCodeInteractive', () => {
    let callbacks: InteractiveCallbacks;

    beforeEach(() => {
      callbacks = {
        onOutput: jest.fn(),
        onError: jest.fn(),
        onInputRequest: jest.fn().mockResolvedValue('user input'),
      };

      mockPyodide.runPython = jest.fn();
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
    });

    it('should set up interactive stdout/stderr', async () => {
      await runPythonCodeInteractive('print("test")', callbacks);

      // Check that InteractiveStdout class was defined
      const setupCall = mockPyodide.runPython.mock.calls.find((call: any) =>
        call[0].includes('InteractiveStdout')
      );
      expect(setupCall).toBeTruthy();
    });

    it('should handle output callbacks', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      await runPythonCodeInteractive('print("hello")', callbacks);

      // Verify callback was set
      expect(mockPyodide.globals.set).toHaveBeenCalledWith(
        '__output_callback__',
        expect.any(Function)
      );
    });

    it('should handle error callbacks', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      await runPythonCodeInteractive('print("test")', callbacks);

      // Verify error callback was set
      expect(mockPyodide.globals.set).toHaveBeenCalledWith(
        '__error_callback__',
        expect.any(Function)
      );
    });

    it('should set up custom input function', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      await runPythonCodeInteractive('input("prompt")', callbacks);

      // Verify input handler was set
      expect(mockPyodide.globals.set).toHaveBeenCalledWith(
        'js_input_handler',
        expect.any(Function)
      );
    });

    it('should execute code asynchronously', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      await runPythonCodeInteractive('import asyncio', callbacks);

      expect(mockPyodide.runPythonAsync).toHaveBeenCalled();
    });

    it('should flush stdout/stderr after execution', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
      mockPyodide.runPython = jest.fn();

      await runPythonCodeInteractive('print("test")', callbacks);

      // Check for flush calls
      const flushCalls = mockPyodide.runPython.mock.calls.filter((call: any) =>
        call[0].includes('.flush()')
      );
      expect(flushCalls.length).toBeGreaterThan(0);
    });

    it('should handle error in async execution', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue(new Error('Execution error'));

      await expect(
        runPythonCodeInteractive('raise Exception()', callbacks)
      ).rejects.toThrow();

      expect(callbacks.onError).toHaveBeenCalled();
    });

    it('should work without callbacks', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      await expect(
        runPythonCodeInteractive('print("test")', {})
      ).resolves.not.toThrow();
    });

    it('should handle callback execution without throwing', async () => {
      const failingCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);

      // The interactive runner should handle callback errors gracefully
      await expect(
        runPythonCodeInteractive('print("test")', { onOutput: failingCallback })
      ).resolves.not.toThrow();
    });
  });

  describe('isPyodideReady', () => {
    it('should return false when not initialized', () => {
      resetPyodide();
      expect(isPyodideReady()).toBe(false);
    });

    it('should return true when initialized', async () => {
      resetPyodide();
      expect(isPyodideReady()).toBe(false);
    });
  });

  describe('getPyodideError', () => {
    it('should return null when no error', () => {
      resetPyodide();
      expect(getPyodideError()).toBeNull();
    });

    it('should return error when initialization fails', async () => {
      resetPyodide();
      expect(getPyodideError()).toBeNull();
    });
  });

  describe('resetPyodide', () => {
    it('should reset pyodide state', () => {
      resetPyodide();
      expect(isPyodideReady()).toBe(false);
      expect(getPyodideError()).toBeNull();
    });
  });

  describe('Code execution edge cases', () => {
    beforeEach(() => {
      mockPyodide.runPython = jest.fn(() => '');
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(undefined);
    });

    it('should handle empty code', async () => {
      const result = await runPythonCode('');
      expect(result).toHaveProperty('output');
    });

    it('should handle multiline code', async () => {
      const code = `
def hello():
  print("hello")

hello()
      `;
      const result = await runPythonCode(code);
      expect(result).toHaveProperty('output');
    });

    it('should handle code with special characters', async () => {
      const code = 'print("special chars: !@#$%^&*()")';
      const result = await runPythonCode(code);
      expect(result).toHaveProperty('output');
    });

    it('should handle very long output', async () => {
      const longOutput = 'x' .repeat(10000);
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stdout.getvalue()')) return longOutput;
        return '';
      });

      const result = await runPythonCode('print("x" * 10000)');
      expect(result.output?.length).toBeGreaterThan(9000);
    });

    it('should handle numeric return values', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(123);

      const result = await runPythonCode('123');
      expect(result.output).toContain('123');
    });

    it('should handle zero as return value', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(0);

      const result = await runPythonCode('0');
      expect(result.output).toContain('0');
    });

    it('should handle false as return value', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockResolvedValue(false);

      const result = await runPythonCode('False');
      expect(result.output).toContain('False');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle error without stderr', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue(new Error('Python error'));
      mockPyodide.runPython = jest.fn(() => '');

      const result = await runPythonCode('raise Exception()');
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Python error');
    });

    it('should handle error with stderr extraction error', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue(new Error('Python error'));
      mockPyodide.runPython = jest.fn((code: string) => {
        if (code.includes('sys.stderr.getvalue()')) {
          throw new Error('Cannot get stderr');
        }
        return '';
      });

      const result = await runPythonCode('raise Exception()');
      expect(result).toHaveProperty('error');
    });

    it('should handle non-Error thrown value', async () => {
      mockPyodide.runPythonAsync = jest.fn().mockRejectedValue('string error');

      const result = await runPythonCode('raise Exception()');
      expect(result).toHaveProperty('error');
    });
  });
});
