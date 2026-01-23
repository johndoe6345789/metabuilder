/**
 * ViewportSettings Component
 * Viewport zoom defaults
 */

import React from 'react';

interface ViewportSettingsProps {
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  onSettingChange: (key: string, value: any) => void;
}

export const ViewportSettings: React.FC<ViewportSettingsProps> = ({
  defaultZoom,
  minZoom,
  maxZoom,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Viewport Defaults</h3>

      <div >
        <label htmlFor="defaultZoom" >
          Default Zoom: <span >{defaultZoom}%</span>
        </label>
        <input
          id="defaultZoom"
          type="range"
          min="50"
          max="200"
          step="10"
          value={defaultZoom}
          onChange={(e) => onSettingChange('defaultZoom', parseInt(e.target.value))}
          
        />
      </div>

      <div >
        <label htmlFor="minZoom" >
          Minimum Zoom: <span >{minZoom}%</span>
        </label>
        <input
          id="minZoom"
          type="range"
          min="5"
          max="100"
          step="5"
          value={minZoom}
          onChange={(e) => onSettingChange('minZoom', parseInt(e.target.value))}
          
        />
      </div>

      <div >
        <label htmlFor="maxZoom" >
          Maximum Zoom: <span >{maxZoom}%</span>
        </label>
        <input
          id="maxZoom"
          type="range"
          min="200"
          max="500"
          step="50"
          value={maxZoom}
          onChange={(e) => onSettingChange('maxZoom', parseInt(e.target.value))}
          
        />
      </div>
    </div>
  );
};

export default ViewportSettings;
