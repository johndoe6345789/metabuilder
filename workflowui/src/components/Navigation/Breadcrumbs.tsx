/**
 * Breadcrumbs Component
 * Navigation breadcrumbs showing hierarchy
 */

import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.scss';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="breadcrumbs">
      {items.map((item, index) => (
        <div key={index} className={styles.breadcrumbItem}>
          {item.href ? (
            <>
              <Link href={item.href as any} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
              {index < items.length - 1 && <span className={styles.separator}>/</span>}
            </>
          ) : (
            <>
              <span className={styles.breadcrumbText}>{item.label}</span>
              {index < items.length - 1 && <span className={styles.separator}>/</span>}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
