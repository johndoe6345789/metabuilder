/**
 * Loading Overlay Component
 * Full-screen overlay shown during loading operations
 */

import React from 'react';
import { useUI } from '../../hooks';

export const LoadingOverlay: React.FC = () => {
  const { loading, loadingMessage } = useUI();

  if (!loading) {
    return null;
  }

  return (
    <div  role="progressbar" aria-busy="true">
      <div >
        <div >
          <div ></div>
        </div>
        {loadingMessage && <p >{loadingMessage}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
