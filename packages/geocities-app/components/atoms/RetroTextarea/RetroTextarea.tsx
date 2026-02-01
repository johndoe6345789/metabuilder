import React from 'react';
import styles from './RetroTextarea.module.scss';

interface RetroTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const RetroTextarea: React.FC<RetroTextareaProps> = ({
  value,
  onChange,
  placeholder,
  name,
  required = false,
  rows = 4,
  className = ''
}) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`${styles.retroTextarea} ${className}`}
    />
  );
};
