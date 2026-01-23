/**
 * LayoutSettings Component
 * Workflow card appearance preferences
 */

import React from 'react';

interface LayoutSettingsProps {
  cardPreviewSize: 'small' | 'medium' | 'large';
  showCardDescriptions: boolean;
  cardAnimations: boolean;
  onSettingChange: (key: string, value: any) => void;
}

export const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  cardPreviewSize,
  showCardDescriptions,
  cardAnimations,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Workflow Cards</h3>

      <div >
        <label htmlFor="cardPreviewSize" >
          Preview Size
        </label>
        <select
          id="cardPreviewSize"
          value={cardPreviewSize}
          onChange={(e) => onSettingChange('cardPreviewSize', e.target.value)}
          
        >
          <option value="small">Small (200x150)</option>
          <option value="medium">Medium (300x200)</option>
          <option value="large">Large (400x250)</option>
        </select>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={showCardDescriptions}
            onChange={(e) => onSettingChange('showCardDescriptions', e.target.checked)}
          />
          <span>Show Card Descriptions</span>
        </label>
        <p >Display workflow descriptions in cards</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={cardAnimations}
            onChange={(e) => onSettingChange('cardAnimations', e.target.checked)}
          />
          <span>Enable Animations</span>
        </label>
        <p >Smooth transitions and hover effects</p>
      </div>
    </div>
  );
};

export default LayoutSettings;
