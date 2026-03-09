import React from 'react';
import styles from './NavLink.module.scss';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: string;
  isNew?: boolean;
  isHot?: boolean;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children, 
  icon,
  isNew = false,
  isHot = false,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    onClick?.();
  };

  return (
    <a href={href} onClick={handleClick} className={styles.navLink}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
      {isNew && <span className={styles.badge + ' ' + styles.new}>NEW!</span>}
      {isHot && <span className={styles.badge + ' ' + styles.hot}>HOT!</span>}
    </a>
  );
};
