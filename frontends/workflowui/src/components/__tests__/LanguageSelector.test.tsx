/**
 * Tests for LanguageSelector component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock @metabuilder/translations
jest.mock('@metabuilder/translations', () => ({
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr'],
  localeNames: { en: 'English', es: 'Spanish', fr: 'French' },
}));

// Mock I18nContext
const mockSetLocale = jest.fn();
jest.mock('../../hooks/I18nContext', () => ({
  useI18n: jest.fn(() => ({
    locale: 'en',
    setLocale: mockSetLocale,
    localeNames: { en: 'English', es: 'Spanish', fr: 'French' },
    supportedLocales: ['en', 'es', 'fr'],
    t: (key: string) => key,
  })),
}));

import { LanguageSelector } from '../UI/LanguageSelector';

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the language select', () => {
    render(<LanguageSelector />);
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('renders language options', () => {
    render(<LanguageSelector />);
    const select = screen.getByTestId('language-selector') as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it('shows locale codes by default', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('shows full names when showFullName is true', () => {
    render(<LanguageSelector showFullName />);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('calls setLocale when selection changes', () => {
    render(<LanguageSelector />);
    fireEvent.change(screen.getByTestId('language-selector'), {
      target: { value: 'es' },
    });
    expect(mockSetLocale).toHaveBeenCalledWith('es');
  });

  it('has the current locale selected', () => {
    render(<LanguageSelector />);
    const select = screen.getByTestId('language-selector') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('accepts custom className', () => {
    const { container } = render(<LanguageSelector className="my-class" />);
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });
});

describe('LanguageSelector compact mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders compact button', () => {
    render(<LanguageSelector compact />);
    expect(screen.getByTestId('language-selector-compact')).toBeInTheDocument();
  });

  it('renders compact dropdown', () => {
    render(<LanguageSelector compact />);
    expect(screen.getByTestId('language-selector-dropdown')).toBeInTheDocument();
  });

  it('renders full names in compact dropdown', () => {
    render(<LanguageSelector compact />);
    const dropdown = screen.getByTestId('language-selector-dropdown') as HTMLSelectElement;
    expect(dropdown.options.length).toBe(3);
    expect(dropdown.options[0].text).toBe('English');
  });

  it('calls setLocale when compact dropdown changes', () => {
    render(<LanguageSelector compact />);
    fireEvent.change(screen.getByTestId('language-selector-dropdown'), {
      target: { value: 'fr' },
    });
    expect(mockSetLocale).toHaveBeenCalledWith('fr');
  });
});
