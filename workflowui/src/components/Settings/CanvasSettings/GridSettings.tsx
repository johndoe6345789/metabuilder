/**
 * GridSettings Component
 * Grid appearance and snapping preferences
 */

import React from 'react';

interface GridSettingsProps {
  gridVisible: boolean;
  gridSnapping: boolean;
  gridSize: number;
  gridStyle: 'dots' | 'lines';
  onSettingChange: (key: string, value: any) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridVisible,
  gridSnapping,
  gridSize,
  gridStyle,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Canvas Appearance</h3>

      <div >
        <label >
          <input
            type="checkbox"
            checked={gridVisible}
            onChange={(e) => onSettingChange('gridVisible', e.target.checked)}
          />
          <span>Show Grid</span>
        </label>
        <p >Display grid background on canvas</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={gridSnapping}
            onChange={(e) => onSettingChange('gridSnapping', e.target.checked)}
          />
          <span>Enable Grid Snapping</span>
        </label>
        <p >Snap workflow cards to grid</p>
      </div>

      {gridSnapping && (
        <>
          <div >
            <label htmlFor="gridSize" >
              Grid Size: <span >{gridSize}px</span>
            </label>
            <input
              id="gridSize"
              type="range"
              min="5"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => onSettingChange('gridSize', parseInt(e.target.value))}
              
            />
          </div>

          <div >
            <label htmlFor="gridStyle" >
              Grid Style
            </label>
            <select
              id="gridStyle"
              value={gridStyle}
              onChange={(e) => onSettingChange('gridStyle', e.target.value)}
              
            >
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default GridSettings;
