/**
 * PerformanceSettings Component
 * Canvas performance optimization preferences
 */

import React from 'react';

interface PerformanceSettingsProps {
  enableVirtualization: boolean;
  maxConcurrentRenders: number;
  onSettingChange: (key: string, value: any) => void;
}

export const ZoomSettings: React.FC<PerformanceSettingsProps> = ({
  enableVirtualization,
  maxConcurrentRenders,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Performance</h3>

      <div >
        <label >
          <input
            type="checkbox"
            checked={enableVirtualization}
            onChange={(e) => onSettingChange('enableVirtualization', e.target.checked)}
          />
          <span>Enable Virtualization</span>
        </label>
        <p >
          Only render visible cards (recommended for 100+ workflows)
        </p>
      </div>

      {enableVirtualization && (
        <div >
          <label htmlFor="maxRenders" >
            Max Concurrent Renders:{' '}
            <span >{maxConcurrentRenders}</span>
          </label>
          <input
            id="maxRenders"
            type="range"
            min="10"
            max="200"
            step="10"
            value={maxConcurrentRenders}
            onChange={(e) => onSettingChange('maxConcurrentRenders', parseInt(e.target.value))}
            
          />
        </div>
      )}
    </div>
  );
};

export default ZoomSettings;
