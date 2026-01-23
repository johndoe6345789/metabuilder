'use client';

import { classNames } from '../utils';
import styles from './Card.module.scss';

export default function Card({
  children,
  variant = 'elevated',
  className,
  onClick,
  ...props
}) {
  return (
    <div
      className={classNames(
        styles.card,
        styles[`card--${variant}`],
        onClick && styles['card--clickable'],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={classNames(styles.cardHeader, className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={classNames(styles.cardTitle, className)}>{children}</h3>;
}

export function CardContent({ children, className }) {
  return <div className={classNames(styles.cardContent, className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={classNames(styles.cardFooter, className)}>{children}</div>;
}
