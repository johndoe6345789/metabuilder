import React from 'react';
import styles from './RetroInput.module.scss';

interface RetroInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  name?: string;
  required?: boolean;
  className?: string;
}

export const RetroInput: React.FC<RetroInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  name,
  required = false,
  className = ''
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`${styles.retroInput} ${className}`}
    />
  );
};
