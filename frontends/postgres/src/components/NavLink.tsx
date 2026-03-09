import Link from 'next/link';
import { styles } from '@/config/styles';

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
};

/**
 * Navigation link component with consistent styling
 * Used for navigation menus in layouts
 */
export function NavLink({ href, children, external }: NavLinkProps) {
  if (external) {
    return (
      <a
        className={styles.links.nav}
        href={href}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={styles.links.nav}
    >
      {children}
    </Link>
  );
}
