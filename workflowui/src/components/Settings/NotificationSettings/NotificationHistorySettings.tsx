/**
 * NotificationHistorySettings Component
 * View and manage notification history
 */

import React from 'react';

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
    <div >
      <h3 >Notification History</h3>
      <p >
        View and manage your notification history
      </p>

      {history.map((item) => (
        <div key={item.id} >
          <div >
            <p >{item.title}</p>
            <p >{item.time}</p>
          </div>
          <button
            className={""}
            onClick={() => onClearItem(item.id)}
          >
            Clear
          </button>
        </div>
      ))}

      <button
        className={""}
        onClick={onClearAll}
      >
        Clear All History
      </button>
    </div>
  );
};

export default NotificationHistorySettings;
