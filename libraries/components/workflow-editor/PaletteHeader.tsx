/**
 * PaletteHeader Component
 * Header section with title, controls, language filters, and search
 */

'use client';

import React from 'react';
import styles from '../../scss/atoms/workflow-editor.module.scss';

interface PaletteHeaderProps {
  isLoading: boolean;
  unhealthyLanguages: string[];
  nodeSearch: string;
  onSearchChange: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  languages: string[];
  languageHealth: Record<string, boolean>;
  selectedLanguage: string | null;
  onLanguageChange?: (lang: string | null) => void;
  filteredCount: number;
}

export function PaletteHeader(props: PaletteHeaderProps): React.ReactElement {
  const { isLoading, unhealthyLanguages, nodeSearch, onSearchChange, onExpandAll, onCollapseAll,
    languages, languageHealth, selectedLanguage, onLanguageChange, filteredCount } = props;

  return (
    <div className={styles.paletteHeader}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className={styles.paletteTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Nodes {isLoading && <span style={{ fontSize: 11, opacity: 0.6 }}>Loading...</span>}
          {unhealthyLanguages.length > 0 && (
            <span title={`Backend unavailable for: ${unhealthyLanguages.join(', ').toUpperCase()}`}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%',
                background: 'var(--mat-sys-error-container)', color: 'var(--mat-sys-on-error-container)', fontSize: 12, cursor: 'help' }}>⚠</span>
          )}
        </h2>
        <div className={styles.paletteControls}>
          <button className={styles.paletteControlBtn} onClick={onExpandAll} title="Expand all">+</button>
          <button className={styles.paletteControlBtn} onClick={onCollapseAll} title="Collapse all">−</button>
        </div>
      </div>

      {languages.length > 1 && (
        <div className={styles.languageFilters}>
          <button className={`${styles.languageChip} ${selectedLanguage === null ? styles.languageChipActive : ''}`} onClick={() => onLanguageChange?.(null)}>All</button>
          {languages.map(lang => {
            const isHealthy = languageHealth[lang] !== false;
            return (
              <button key={lang} className={`${styles.languageChip} ${selectedLanguage === lang ? styles.languageChipActive : ''} ${!isHealthy ? styles.languageChipUnhealthy : ''}`}
                onClick={() => onLanguageChange?.(lang)} title={isHealthy ? `Show ${lang.toUpperCase()} nodes` : `${lang.toUpperCase()} backend unavailable`}>
                {lang}{!isHealthy && <span className={styles.languageChipBadge} />}
              </button>
            );
          })}
        </div>
      )}

      <input type="text" placeholder="Search nodes..." value={nodeSearch} onChange={(e) => onSearchChange(e.target.value)}
        className={styles.propertiesInput} style={{ margin: 0, padding: '8px 12px' }} />
      <div style={{ fontSize: 11, color: 'var(--mat-sys-on-surface-variant)', marginTop: 4 }}>
        {filteredCount} nodes{selectedLanguage && ` (${selectedLanguage})`}
      </div>
    </div>
  );
}
