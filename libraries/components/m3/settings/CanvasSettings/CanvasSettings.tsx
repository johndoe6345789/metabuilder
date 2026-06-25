/**
 * CanvasSettings Component
 * Canvas appearance and behavior preferences (main composer)
 */

import React, { useState, useCallback } from 'react';
import { GridSettings } from './GridSettings';
import { SnapSettings } from './SnapSettings';
import { LayoutSettings } from './LayoutSettings';
import { ZoomSettings } from './ZoomSettings';
import { ViewportSettings } from './ViewportSettings';
import { testId, aria } from '../accessibility';

interface CanvasSettingsState {
  gridVisible: boolean;
  gridSnapping: boolean;
  gridSize: number;
  gridStyle: 'dots' | 'lines';
  autoSave: boolean;
  autoSaveInterval: number;
  zoomInvert: boolean;
  panDirection: 'shift' | 'space' | 'middle';
  cardPreviewSize: 'small' | 'medium' | 'large';
  showCardDescriptions: boolean;
  cardAnimations: boolean;
  enableVirtualization: boolean;
  maxConcurrentRenders: number;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
}

export const CanvasSettings: React.FC = () => {
  const [settings, setSettings] = useState<CanvasSettingsState>({
    gridVisible: true,
    gridSnapping: true,
    gridSize: 20,
    gridStyle: 'dots',
    autoSave: true,
    autoSaveInterval: 30,
    zoomInvert: false,
    panDirection: 'shift',
    cardPreviewSize: 'medium',
    showCardDescriptions: true,
    cardAnimations: true,
    enableVirtualization: true,
    maxConcurrentRenders: 50,
    defaultZoom: 100,
    minZoom: 10,
    maxZoom: 300,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = useCallback((key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveMessage('');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveMessage('✓ Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('✗ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <section

      data-testid={testId.settingsCanvasSection()}
      aria-label="Canvas settings"
    >
      <GridSettings
        gridVisible={settings.gridVisible}
        gridSnapping={settings.gridSnapping}
        gridSize={settings.gridSize}
        gridStyle={settings.gridStyle}
        onSettingChange={handleSettingChange}
      />

      <SnapSettings
        autoSave={settings.autoSave}
        autoSaveInterval={settings.autoSaveInterval}
        zoomInvert={settings.zoomInvert}
        panDirection={settings.panDirection}
        onSettingChange={handleSettingChange}
      />

      <LayoutSettings
        cardPreviewSize={settings.cardPreviewSize}
        showCardDescriptions={settings.showCardDescriptions}
        cardAnimations={settings.cardAnimations}
        onSettingChange={handleSettingChange}
      />

      <ZoomSettings
        enableVirtualization={settings.enableVirtualization}
        maxConcurrentRenders={settings.maxConcurrentRenders}
        onSettingChange={handleSettingChange}
      />

      <ViewportSettings
        defaultZoom={settings.defaultZoom}
        minZoom={settings.minZoom}
        maxZoom={settings.maxZoom}
        onSettingChange={handleSettingChange}
      />

      <div >
        <button
          className={""}
          onClick={handleSave}
          disabled={isSaving}
          data-testid={testId.settingsButton('save-all')}
          aria-busy={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
        {saveMessage && (
          <p

            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {saveMessage}
          </p>
        )}
      </div>
    </section>
  );
};

export default CanvasSettings;
