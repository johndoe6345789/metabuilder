/**
 * PreferencesAppearance - Theme and language selectors
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
} from '@metabuilder/m3';
import PREFS from './settings-options.json';

interface PreferencesAppearanceProps {
  theme: string;
  setTheme: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
}

export default function PreferencesAppearance({
  theme,
  setTheme,
  language,
  setLanguage,
}: PreferencesAppearanceProps) {
  return (
    <>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Theme
        </Typography>
        <Select
          fullWidth
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          data-testid="theme-select"
        >
          {PREFS.themes.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary">
          Choose your preferred color scheme
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Language
        </Typography>
        <Select
          fullWidth
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          data-testid="language-select"
        >
          {PREFS.languages.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary">
          Select your preferred language
        </Typography>
      </Box>
    </>
  );
}
