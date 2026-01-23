/**
 * HelpButton Component
 * Reusable button to open help modal or show contextual help
 */

import React from 'react';
import { Button, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
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

  const button = (
    <Button
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId.button('help')}
      size={size}
      variant={variant === 'contained' ? 'contained' : 'text'}
    >
      {variant === 'icon' ? (
        <HelpIcon />
      ) : (
        <>
          <HelpIcon sx={{ mr: 1 }} />
          Help
        </>
      )}
    </Button>
  );

  if (variant === 'icon') {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};

export default HelpButton;
