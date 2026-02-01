/**
 * CollaborativeCursors Component
 * Display remote users' cursors and presence on canvas
 */

import React from 'react';

export interface RemoteCursorData {
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
}

interface CollaborativeCursorsProps {
  cursors: RemoteCursorData[];
  zoom: number;
  pan: { x: number; y: number };
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  cursors,
  zoom,
  pan
}) => {
  return (
    <>
      {cursors.map((cursor) => {
        // Calculate screen position relative to viewport
        const screenX = cursor.position.x * zoom + pan.x;
        const screenY = cursor.position.y * zoom + pan.y;

        // Only render if cursor is within reasonable bounds (not way off-screen)
        const isVisible =
          screenX > -100 && screenX < window.innerWidth + 100 &&
          screenY > -100 && screenY < window.innerHeight + 100;

        if (!isVisible) return null;

        return (
          <div
            key={cursor.userId}
            
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              '--cursor-color': cursor.userColor
            } as React.CSSProperties}
            title={cursor.userName}
          >
            {/* Cursor Arrow */}
            <svg
              
              viewBox="0 0 16 20"
              width="16"
              height="20"
              fill="currentColor"
            >
              <path d="M0 0L0 16.3L4.3 13L8.8 20L11.3 19.2L6.8 12L11 12L0 0Z" />
            </svg>

            {/* User Label */}
            <div >{cursor.userName}</div>
          </div>
        );
      })}
    </>
  );
};

export default CollaborativeCursors;
