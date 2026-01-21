import React from 'react';
import styles from './WebRing.module.scss';

interface WebRingProps {
  ringName?: string;
}

export const WebRing: React.FC<WebRingProps> = ({ 
  ringName = 'CoOl SiTeS wEbRiNg' 
}) => {
  return (
    <div className={styles.webRing}>
      <div className={styles.title}>
        🔗 {ringName} 🔗
      </div>
      <div className={styles.navigation}>
        <a href="#" className={styles.link}>⬅️ PrEvIoUs</a>
        <span className={styles.separator}>|</span>
        <a href="#" className={styles.link}>🎲 RaNdOm</a>
        <span className={styles.separator}>|</span>
        <a href="#" className={styles.link}>NeXt ➡️</a>
      </div>
      <div className={styles.ringLogo}>
        [ Part of the {ringName} ]
      </div>
    </div>
  );
};
