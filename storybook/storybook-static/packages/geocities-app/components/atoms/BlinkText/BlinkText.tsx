import React from 'react';
import styles from './BlinkText.module.scss';

interface BlinkTextProps {
  children: React.ReactNode;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const BlinkText: React.FC<BlinkTextProps> = ({ 
  children, 
  color = '#ff0000',
  speed = 'normal',
  className = ''
}) => {
  return (
    <span 
      className={`${styles.blink} ${styles[speed]} ${className}`}
      style={{ color }}
    >
      {children}
    </span>
  );
};
