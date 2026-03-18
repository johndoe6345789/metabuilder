'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './NavTabs.module.scss'

const tabs = [
  { href: '/', label: 'Overview' },
  { href: '/query', label: 'Query Console' },
]

export function NavTabs() {
  const pathname = usePathname()
  return (
    <nav className={styles.tabs}>
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${styles.tab} ${pathname === tab.href ? styles.active : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
