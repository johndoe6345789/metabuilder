/**
 * SnapSettings Component
 * Auto-save and pan hotkey preferences
 */

import React from 'react';

interface SnapSettingsProps {
  autoSave: boolean;
  autoSaveInterval: number;
  zoomInvert: boolean;
  panDirection: 'shift' | 'space' | 'middle';
  onSettingChange: (key: string, value: any) => void;
}

export const SnapSettings: React.FC<SnapSettingsProps> = ({
  autoSave,
  autoSaveInterval,
  zoomInvert,
  panDirection,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Canvas Behavior</h3>

      <div >
        <label >
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => onSettingChange('autoSave', e.target.checked)}
          />
          <span>Auto-Save</span>
        </label>
        <p >Automatically save canvas state</p>
      </div>

      {autoSave && (
        <div >
          <label htmlFor="autoSaveInterval" >
            Save Interval: <span >{autoSaveInterval}s</span>
          </label>
          <input
            id="autoSaveInterval"
            type="range"
            min="10"
            max="120"
            step="10"
            value={autoSaveInterval}
            onChange={(e) => onSettingChange('autoSaveInterval', parseInt(e.target.value))}
            
          />
        </div>
      )}

      <div >
        <label >
          <input
            type="checkbox"
            checked={zoomInvert}
            onChange={(e) => onSettingChange('zoomInvert', e.target.checked)}
          />
          <span>Invert Zoom Direction</span>
        </label>
        <p >Reverse scroll wheel zoom direction</p>
      </div>

      <div >
        <label htmlFor="panDirection" >
          Pan Hotkey
        </label>
        <select
          id="panDirection"
          value={panDirection}
          onChange={(e) => onSettingChange('panDirection', e.target.value)}
          
        >
          <option value="shift">Shift + Drag</option>
          <option value="space">Space + Drag</option>
          <option value="middle">Middle Mouse Button</option>
        </select>
      </div>
    </div>
  );
};

export default SnapSettings;
