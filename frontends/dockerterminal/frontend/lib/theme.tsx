'use client';

import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <div className="dockerterminal-theme">
      {children}
    </div>
  );
}

export const theme = {
  name: 'm3-scss',
  colorScheme: 'dark',
};
