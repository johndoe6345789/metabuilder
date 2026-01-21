import Link from 'next/link';
import { styles } from '@/config/styles';

type StyledLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'primaryBold' | 'hoverBlue';
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  className?: string;
};

/**
 * Styled Link component that uses configured styles
 * Provides consistent link styling across the app
 */
export function StyledLink({
  href,
  children,
  variant = 'primary',
  target,
  rel,
  className,
}: StyledLinkProps) {
  const baseClassName = styles.links[variant];
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  // Use Next.js Link for internal links, regular <a> for external
  const isExternal = href.startsWith('http') || href.startsWith('//');

  if (isExternal) {
    return (
      <a
        className={combinedClassName}
        href={href}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={combinedClassName}
      href={href}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
}
