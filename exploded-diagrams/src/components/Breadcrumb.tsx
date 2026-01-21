'use client'

import Link from 'next/link'

const LABELS: Record<string, string> = {
  'rc': 'RC Vehicles',
  'traxxas': 'Traxxas',
  'slash-4x4': 'Slash 4x4',
  'front-shock': 'Front Shock',
  'rear-differential': 'Rear Differential',
  'steering-servo': 'Steering Servo'
}

function formatLabel(segment: string): string {
  return LABELS[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface BreadcrumbProps {
  path: string[]
}

export default function Breadcrumb({ path }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb">
      <Link href="/">Home</Link>
      {path.map((segment, i) => {
        const href = '/' + path.slice(0, i + 1).join('/')
        const isLast = i === path.length - 1

        return (
          <span key={href}>
            <span>›</span>
            {isLast ? (
              <span className="current">{formatLabel(segment)}</span>
            ) : (
              <Link href={href}>{formatLabel(segment)}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
