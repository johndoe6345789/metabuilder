/**
 * HelpButton Component
 * Reusable button to open help modal or show contextual help
 */

import React from 'react';
import { useDocumentation } from '../../hooks/useDocumentation';
import { DocCategory } from '../../types/documentation';
import { testId } from '../../utils/accessibility';

interface HelpButtonProps {
  pageId?: string;
  category?: DocCategory;
  variant?: 'icon' | 'text' | 'contained';
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
  ariaLabel?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  pageId,
  category,
  variant = 'icon',
  size = 'medium',
  tooltip = 'Open Help',
  ariaLabel = 'Open Help',
}) => {
  const { openHelpModal } = useDocumentation();

  const handleClick = () => {
    openHelpModal(pageId, category);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        aria-label={ariaLabel}
        title={tooltip}
        data-testid={testId.button('help')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 600,
          minWidth: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ?
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId.button('help')}
      style={{
        padding: '8px 16px',
        backgroundColor: variant === 'contained' ? 'var(--color-primary)' : 'transparent',
        color: variant === 'contained' ? 'white' : 'inherit',
        border: variant === 'contained' ? 'none' : '1px solid var(--color-border)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      Help
    </button>
  );
};

export default HelpButton;
