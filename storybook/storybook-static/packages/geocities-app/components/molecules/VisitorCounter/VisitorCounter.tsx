import React from 'react';
import styles from './VisitorCounter.module.scss';

interface VisitorCounterProps {
  count: number;
  className?: string;
}

export const VisitorCounter: React.FC<VisitorCounterProps> = ({ 
  count, 
  className = '' 
}) => {
  const paddedCount = count.toString().padStart(7, '0');
  
  return (
    <div className={`${styles.counterContainer} ${className}`}>
      <div className={styles.label}>YOU ARE VISITOR #</div>
      <div className={styles.counter}>
        {paddedCount.split('').map((digit, i) => (
          <span key={i} className={styles.digit}>{digit}</span>
        ))}
      </div>
      <div className={styles.since}>since March 1998</div>
    </div>
  );
};
