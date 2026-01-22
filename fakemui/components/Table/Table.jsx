'use client';

import { classNames } from '../utils';
import styles from './Table.module.scss';

export function Table({ children, className }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={classNames(styles.table, className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }) {
  return <thead className={classNames(styles.thead, className)}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={classNames(styles.tbody, className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={classNames(
        styles.tr,
        onClick && styles['tr--clickable'],
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, header = false, align = 'left' }) {
  const Tag = header ? 'th' : 'td';
  return (
    <Tag className={classNames(styles.cell, styles[`cell--${align}`], className)}>
      {children}
    </Tag>
  );
}
