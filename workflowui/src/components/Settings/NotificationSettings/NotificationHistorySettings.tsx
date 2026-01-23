/**
 * NotificationHistorySettings Component
 * View and manage notification history
 */

import React from 'react';
import styles from '../sections.module.scss';

interface HistoryItem {
  id: string;
  title: string;
  time: string;
}

interface NotificationHistorySettingsProps {
  history?: HistoryItem[];
  onClearItem?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationHistorySettings: React.FC<NotificationHistorySettingsProps> = ({
  history = [
    { id: '1', title: 'Workflow "Payment Pipeline" completed', time: '2 hours ago' },
    { id: '2', title: 'Alice shared project "Marketing Workflows"', time: '5 hours ago' },
  ],
  onClearItem = () => {},
  onClearAll = () => {},
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Notification History</h3>
      <p className={styles.description}>
        View and manage your notification history
      </p>

      {history.map((item) => (
        <div key={item.id} className={styles.historyItem}>
          <div className={styles.historyContent}>
            <p className={styles.historyTitle}>{item.title}</p>
            <p className={styles.historyTime}>{item.time}</p>
          </div>
          <button
            className={`${styles.button} ${styles.small}`}
            onClick={() => onClearItem(item.id)}
          >
            Clear
          </button>
        </div>
      ))}

      <button
        className={`${styles.button} ${styles.full} ${styles.secondary}`}
        onClick={onClearAll}
      >
        Clear All History
      </button>
    </div>
  );
};

export default NotificationHistorySettings;
