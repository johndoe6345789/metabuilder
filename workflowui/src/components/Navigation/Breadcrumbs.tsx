/**
 * Breadcrumbs Component
 * Navigation breadcrumbs showing hierarchy
 */

import React from 'react';
import Link from 'next/link';
import { testId } from '../../utils/accessibility';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      
      aria-label="Breadcrumb navigation"
      data-testid={testId.navBreadcrumb()}
    >
      <ol role="list" >
        {items.map((item, index) => (
          <li
            key={index}
            
            role="listitem"
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.href ? (
              <>
                <Link
                  href={item.href as any}
                  
                  data-testid={testId.navLink(item.label.toLowerCase().replace(/\s+/g, '-'))}
                >
                  {item.label}
                </Link>
                {index < items.length - 1 && (
                  <span  aria-hidden="true">
                    /
                  </span>
                )}
              </>
            ) : (
              <>
                <span  aria-current="page">
                  {item.label}
                </span>
                {index < items.length - 1 && (
                  <span  aria-hidden="true">
                    /
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
