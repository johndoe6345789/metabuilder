/**
 * PresenceIndicators Component
 * Shows who is currently viewing/editing the project
 */

import React from 'react';

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
    <div >
      <div >
        {otherUsers.map((user) => (
          <div
            key={user.userId}
            
            title={user.userName + (user.lockedItemId ? ' (editing)' : ' (viewing)')}
          >
            <div
              
              style={{ backgroundColor: user.userColor }}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div >
              <div >{user.userName}</div>
              {user.lockedItemId && (
                <div >Editing...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {otherUsers.length === 0 && (
        <div >Solo editing</div>
      )}
    </div>
  );
};

export default PresenceIndicators;
