import React from 'react';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { OpenAISettingsCard } from './OpenAISettingsCard';

describe('OpenAISettingsCard', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render card with title', () => {
      render(<OpenAISettingsCard />);

      expect(screen.getByTestId('openai-settings-card')).toBeInTheDocument();
      expect(screen.getByText('OpenAI API Settings')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<OpenAISettingsCard />);

      expect(
        screen.getByText(/Configure your OpenAI API key/i)
      ).toBeInTheDocument();
    });

    it('should render API key input', () => {
      render(<OpenAISettingsCard />);

      expect(screen.getByTestId('openai-api-key-input')).toBeInTheDocument();
    });

    it('should render visibility toggle button', () => {
      render(<OpenAISettingsCard />);

      expect(screen.getByTestId('toggle-api-key-visibility')).toBeInTheDocument();
    });

    it('should render Save button', () => {
      render(<OpenAISettingsCard />);

      expect(screen.getByTestId('save-api-key-btn')).toBeInTheDocument();
    });

    it('should render Clear button when API key present', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      await user.type(input, 'sk-test', { delay: 1 });

      expect(screen.getByTestId('clear-api-key-btn')).toBeInTheDocument();
    });

    it('should have proper labels and accessibility', () => {
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      expect(input).toHaveAttribute('aria-label', 'OpenAI API key');

      const toggle = screen.getByTestId('toggle-api-key-visibility');
      expect(toggle).toHaveAttribute('aria-label');
    });
  });

  describe('API key initialization', () => {
    it('should load API key from localStorage on mount', () => {
      localStorage.setItem('openai_api_key', 'sk-test-key');
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input') as HTMLInputElement;
      expect(input.value).toBe('sk-test-key');
    });

    it('should have empty input if no key in localStorage', () => {
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('API key input changes', () => {
    it('should update input value on user input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      await user.type(input, 'sk-test', { delay: 1 });

      expect((input as HTMLInputElement).value).toContain('sk-test');
    });

    it('should handle input placeholder', () => {
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      expect(input).toHaveAttribute('placeholder', 'sk-...');
    });
  });

  describe('visibility toggle', () => {
    it('should start with password input type', () => {
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should toggle visibility on button click', async () => {
      const user = userEvent.setup();
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      const toggle = screen.getByTestId('toggle-api-key-visibility');

      expect(input).toHaveAttribute('type', 'password');
      await user.click(toggle);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should update aria-pressed on toggle', async () => {
      const user = userEvent.setup();
      render(<OpenAISettingsCard />);

      const toggle = screen.getByTestId('toggle-api-key-visibility');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update aria-label on toggle', async () => {
      const user = userEvent.setup();
      render(<OpenAISettingsCard />);

      const toggle = screen.getByTestId('toggle-api-key-visibility');
      expect(toggle).toHaveAttribute('aria-label', 'Show API key');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-label', 'Hide API key');
    });
  });

  describe('save functionality', () => {
    it('should have save button with testid', () => {
      render(<OpenAISettingsCard />);
      const saveButton = screen.getByTestId('save-api-key-btn');
      expect(saveButton).toBeInTheDocument();
    });

    it('should save API key on save button click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      await user.type(input, 'sk-testkey123', { delay: 1 });

      const saveButton = screen.getByTestId('save-api-key-btn');
      await user.click(saveButton);

      expect(localStorage.getItem('openai_api_key')).toBe('sk-testkey123');
    });

    it('should disable save button when no API key', () => {
      render(<OpenAISettingsCard />);
      const saveButton = screen.getByTestId('save-api-key-btn');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when API key present', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      await user.type(input, 'sk-test', { delay: 1 });

      const saveButton = screen.getByTestId('save-api-key-btn');
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('clear functionality', () => {
    it('should clear input and localStorage on clear', async () => {
      localStorage.setItem('openai_api_key', 'sk-test-key');
      const user = userEvent.setup();

      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      const clearButton = screen.getByTestId('clear-api-key-btn');

      expect((input as HTMLInputElement).value).toBe('sk-test-key');

      await user.click(clearButton);

      expect((input as HTMLInputElement).value).toBe('');
      expect(localStorage.getItem('openai_api_key')).toBeNull();
    });

    it('should show clear button only when API key present', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OpenAISettingsCard />);

      const input = screen.getByTestId('openai-api-key-input');
      expect(screen.queryByTestId('clear-api-key-btn')).not.toBeInTheDocument();

      await user.type(input, 'sk-test', { delay: 1 });
      expect(screen.getByTestId('clear-api-key-btn')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have label for input', () => {
      render(<OpenAISettingsCard />);
      expect(screen.getByLabelText('OpenAI API key')).toBeInTheDocument();
    });

    it('should have decorative icons hidden from screen readers', () => {
      const { container } = render(<OpenAISettingsCard />);
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('should display API key platform link', () => {
      render(<OpenAISettingsCard />);
      const link = screen.getByRole('link', { name: /openai platform/i });
      expect(link).toHaveAttribute('href', 'https://platform.openai.com/api-keys');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
