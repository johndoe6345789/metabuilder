'use client';

import { classNames } from '../utils';
import styles from './Button.module.scss';

export default function Button({
  children,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  type = 'button',
  onClick,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={classNames(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
