/**
 * SettingsModal Component
 * Comprehensive settings interface with account, security, and preferences
 */

import React, { useState } from 'react';
import styles from './SettingsModal.module.scss';
import { AccountSettings } from './sections/AccountSettings';
import { SecuritySettings } from './SecuritySettings/SecuritySettings';
import { CanvasSettings } from './sections/CanvasSettings';
import { NotificationSettings } from './sections/NotificationSettings';

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <button
            className={styles.closeButton}
            onClick={onClose}
            title="Close settings"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tab} ${activeTab === 'account' ? styles.active : ''}`}
            onClick={() => setActiveTab('account')}
          >
            👤 Account
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔐 Security
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'canvas' ? styles.active : ''}`}
            onClick={() => setActiveTab('canvas')}
          >
            🎨 Canvas
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'security' && (
            <SecuritySettings onAccountDeleted={handleAccountDeleted} />
          )}
          {activeTab === 'canvas' && <CanvasSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
