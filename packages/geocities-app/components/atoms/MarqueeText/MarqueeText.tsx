import React from 'react';
import styles from './MarqueeText.module.scss';

interface MarqueeTextProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  children,
  direction = 'left',
  speed = 'normal',
  className = ''
}) => {
  return (
    <div className={`${styles.marqueeContainer} ${className}`}>
      <div className={`${styles.marquee} ${styles[direction]} ${styles[speed]}`}>
        <span>{children}</span>
        <span>{children}</span>
      </div>
    </div>
  );
};
