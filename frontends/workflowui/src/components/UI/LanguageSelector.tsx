'use client';

/**
 * Language Selector Component
 * Dropdown for switching between supported locales
 */

import React from 'react';
import { useI18n } from '../../hooks/I18nContext';
import type { Locale } from '@metabuilder/translations';

export interface LanguageSelectorProps {
  /** Additional class name */
  className?: string;
  /** Show full language names instead of codes */
  showFullName?: boolean;
  /** Compact mode (icon only with dropdown) */
  compact?: boolean;
}

/**
 * Language selector dropdown for switching locales
 *
 * @example
 * ```tsx
 * // In header
 * <LanguageSelector showFullName />
 *
 * // Compact version
 * <LanguageSelector compact />
 * ```
 */
export function LanguageSelector({
  className = '',
  showFullName = false,
  compact = false,
}: LanguageSelectorProps) {
  const { locale, setLocale, localeNames, supportedLocales } = useI18n();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  };

  if (compact) {
    return (
      <div className={`language-selector language-selector--compact ${className}`}>
        <button
          type="button"
          aria-label="Select language"
          className="language-selector__button"
          data-testid="language-selector-compact"
        >
          <span className="material-symbols-outlined">language</span>
        </button>
        <select
          value={locale}
          onChange={handleChange}
          className="language-selector__select language-selector__select--overlay"
          aria-label="Select language"
          data-testid="language-selector-dropdown"
        >
          {supportedLocales.map((loc) => (
            <option key={loc} value={loc}>
              {localeNames[loc]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`language-selector ${className}`}>
      <label htmlFor="language-select" className="sr-only">
        Language
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={handleChange}
        className="language-selector__select"
        data-testid="language-selector"
      >
        {supportedLocales.map((loc) => (
          <option key={loc} value={loc}>
            {showFullName ? localeNames[loc] : loc.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
