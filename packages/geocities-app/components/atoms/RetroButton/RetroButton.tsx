import React from 'react';
import styles from './RetroButton.module.scss';

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.retroButton} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {children}
    </button>
  );
};
