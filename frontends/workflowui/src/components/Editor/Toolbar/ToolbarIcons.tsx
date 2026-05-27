/**
 * ToolbarIcons - SVG icon components for the editor toolbar
 */

import React from 'react';

export const SaveIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const ExecuteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const ValidateIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <polyline
      points="20 6 9 17 4 12"
      strokeWidth="2"
    />
  </svg>
);
