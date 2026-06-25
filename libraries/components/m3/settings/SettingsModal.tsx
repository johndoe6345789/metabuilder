/**
 * SettingsModal Component
 * Comprehensive settings interface with account, security, and preferences
 */

import React, { useState } from 'react';
import { AccountSettings } from './sections/AccountSettings';
import { SecuritySettings } from './SecuritySettings/SecuritySettings';
import { CanvasSettings } from './sections/CanvasSettings';
import { NotificationSettings } from './sections/NotificationSettings';
import { testId, aria } from './accessibility';

type SettingsTab = 'account' | 'security' | 'canvas' | 'notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onAccountDeleted
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  if (!isOpen) return null;

  const handleAccountDeleted = () => {
    if (onAccountDeleted) {
      onAccountDeleted();
    }
    onClose();
  };

  return (
    <div

      onClick={onClose}
      role="presentation"
      data-testid={testId.modal('settings')}
    >
      <div

        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div >
          <h1  id="settings-title">Settings</h1>
          <button

            onClick={onClose}
            title="Close settings"
            aria-label="Close settings"
            data-testid={testId.modalClose('settings')}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div  role="tablist" aria-label="Settings sections">
          <button
            className={""}
            onClick={() => setActiveTab('account')}
            role="tab"
            aria-selected={activeTab === 'account'}
            aria-controls="settings-account"
            data-testid={testId.navTab('Account')}
          >
            👤 Account
          </button>
          <button
            className={""}
            onClick={() => setActiveTab('security')}
            role="tab"
            aria-selected={activeTab === 'security'}
            aria-controls="settings-security"
            data-testid={testId.navTab('Security')}
          >
            🔐 Security
          </button>
          <button
            className={""}
            onClick={() => setActiveTab('canvas')}
            role="tab"
            aria-selected={activeTab === 'canvas'}
            aria-controls="settings-canvas"
            data-testid={testId.navTab('Canvas')}
          >
            🎨 Canvas
          </button>
          <button
            className={""}
            onClick={() => setActiveTab('notifications')}
            role="tab"
            aria-selected={activeTab === 'notifications'}
            aria-controls="settings-notifications"
            data-testid={testId.navTab('Notifications')}
          >
            🔔 Notifications
          </button>
        </div>

        {/* Content */}
        <div >
          {activeTab === 'account' && (
            <div role="tabpanel" id="settings-account" aria-labelledby="settings-title">
              <AccountSettings />
            </div>
          )}
          {activeTab === 'security' && (
            <div role="tabpanel" id="settings-security" aria-labelledby="settings-title">
              <SecuritySettings onAccountDeleted={handleAccountDeleted} />
            </div>
          )}
          {activeTab === 'canvas' && (
            <div role="tabpanel" id="settings-canvas" aria-labelledby="settings-title">
              <CanvasSettings />
            </div>
          )}
          {activeTab === 'notifications' && (
            <div role="tabpanel" id="settings-notifications" aria-labelledby="settings-title">
              <NotificationSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
