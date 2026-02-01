/**
 * SessionManagementSettings Component
 * Active session management and logout control
 */

import React, { useState, useCallback } from 'react';

interface Session {
  id: string;
  device: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionManagementSettingsProps {
  onSessionsCleared?: () => void;
}

export const SessionManagementSettings: React.FC<SessionManagementSettingsProps> = ({
  onSessionsCleared
}) => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      lastActive: '2 minutes ago',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on MacOS',
      lastActive: '1 hour ago',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Firefox on Linux',
      lastActive: '3 days ago',
      isCurrent: false
    }
  ]);
  const [isClearing, setIsClearing] = useState(false);

  const handleSignOutSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const handleSignOutAll = useCallback(async () => {
    if (
      !confirm(
        'Are you sure? You will be signed out of all other sessions immediately.'
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      if (onSessionsCleared) onSessionsCleared();
    } catch (error) {
      alert('Failed to sign out sessions. Please try again.');
    } finally {
      setIsClearing(false);
    }
  }, [onSessionsCleared]);

  return (
    <div >
      <h3 >Active Sessions</h3>
      <p >
        Manage your active sessions across devices
      </p>

      {sessions.map((session) => (
        <div key={session.id} >
          <div >
            <p >{session.device}</p>
            <p >Last active: {session.lastActive}</p>
          </div>
          {session.isCurrent ? (
            <span >Current</span>
          ) : (
            <button
              className={""}
              onClick={() => handleSignOutSession(session.id)}
            >
              Sign Out
            </button>
          )}
        </div>
      ))}

      <button
        className={""}
        onClick={handleSignOutAll}
        disabled={isClearing || sessions.filter((s) => !s.isCurrent).length === 0}
      >
        {isClearing ? 'Signing Out...' : 'Sign Out All Other Sessions'}
      </button>
    </div>
  );
};

export default SessionManagementSettings;
