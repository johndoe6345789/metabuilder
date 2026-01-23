/**
 * PresenceIndicators Component
 * Shows who is currently viewing/editing the project
 */

import React from 'react';
import styles from './PresenceIndicators.module.scss';

export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  lockedItemId?: string;
}

interface PresenceIndicatorsProps {
  users: UserPresence[];
  currentUserId: string;
}

export const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({
  users,
  currentUserId
}) => {
  const otherUsers = users.filter((u) => u.userId !== currentUserId);

  return (
    <div className={styles.presenceIndicators}>
      <div className={styles.presenceList}>
        {otherUsers.map((user) => (
          <div
            key={user.userId}
            className={styles.presenceItem}
            title={user.userName + (user.lockedItemId ? ' (editing)' : ' (viewing)')}
          >
            <div
              className={styles.avatar}
              style={{ backgroundColor: user.userColor }}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{user.userName}</div>
              {user.lockedItemId && (
                <div className={styles.status}>Editing...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {otherUsers.length === 0 && (
        <div className={styles.empty}>Solo editing</div>
      )}
    </div>
  );
};

export default PresenceIndicators;
