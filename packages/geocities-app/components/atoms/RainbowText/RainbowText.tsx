import React from 'react';
import styles from './RainbowText.module.scss';

interface RainbowTextProps {
  children: string;
  animated?: boolean;
  className?: string;
}

export const RainbowText: React.FC<RainbowTextProps> = ({
  children,
  animated = true,
  className = ''
}) => {
  if (animated) {
    return (
      <span className={`${styles.rainbowAnimated} ${className}`}>
        {children}
      </span>
    );
  }

  // Static rainbow - each letter gets a color
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
  
  return (
    <span className={className}>
      {children.split('').map((char, i) => (
        <span key={i} style={{ color: colors[i % colors.length] }}>
          {char}
        </span>
      ))}
    </span>
  );
};
