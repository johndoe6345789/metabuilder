/**
 * WorkspacePreviewPanel - Live preview card + color picker
 */

'use client';

import React from 'react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';

const WORKSPACE_COLORS = [
  '#6750A4',
  '#625B71',
  '#7D5260',
  '#BA1A1A',
  '#006E1C',
  '#00639B',
  '#A8541D',
  '#5C5C5C',
];

interface WorkspacePreviewPanelProps {
  name: string;
  color: string;
  description: string;
  onColorChange: (color: string) => void;
}

export default function WorkspacePreviewPanel({
  name,
  color,
  description,
  onColorChange,
}: WorkspacePreviewPanelProps) {
  const initials = name.trim()
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WS';

  return (
    <div className={styles.formPreview}>
      <div className={styles.formPreviewCard}>
        <div
          className={styles.formPreviewMedia}
          style={{ backgroundColor: color }}
        >
          <span className={styles.formPreviewInitials}>
            {initials}
          </span>
        </div>
        <div className={styles.formPreviewContent}>
          <p className={styles.formPreviewTitle}>
            {name || 'Workspace Name'}
          </p>
          <p className={styles.formPreviewDesc}>
            {description || 'No description'}
          </p>
        </div>
      </div>
      <div className={styles.formColorPicker}>
        {WORKSPACE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.formColorSwatch} ${
              c === color ? styles.active : ''
            }`}
            style={{ backgroundColor: c }}
            onClick={() => onColorChange(c)}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
