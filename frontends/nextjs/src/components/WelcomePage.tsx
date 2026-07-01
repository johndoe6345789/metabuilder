'use client'

import s from './WelcomePage.module.scss'

const LEVELS = [
  {
    level: 1, name: 'Public Website',
    desc: 'Beautiful landing pages with responsive design and navigation',
    detail: 'Perfect for marketing sites, portfolios, and public-facing content',
    color: '#2196f3',
  },
  {
    level: 2, name: 'User Area',
    desc: 'Authenticated dashboards with profiles and comment systems',
    detail: 'User registration, profile management, and interactive features',
    color: '#4caf50',
  },
  {
    level: 3, name: 'Admin Panel',
    desc: 'Full data management with CRUD operations and filters',
    detail: 'Complete control over data models with list views and editing',
    color: '#ff9800',
  },
  {
    level: 4, name: 'God Builder',
    desc: 'Meta-builder with workflows, schemas, and Lua scripting',
    detail: 'Design and generate entire applications declaratively',
    color: '#9c27b0',
  },
  {
    level: 5, name: 'Super God',
    desc: 'Multi-tenant control and platform administration',
    detail: 'Manage tenants, rotate credentials, and control the platform',
    color: '#ffc107',
  },
]

export function WelcomePage() {
  return (
    <div className={s.root}>
      <nav className={s.nav}>
        <div className={s.navInner}>
          <a className={s.brand} href="#">
            <div className={s.brandIcon} />
            <span className={s.brandName}>MetaBuilder</span>
          </a>

          <div className={s.navLinks}>
            <a className={s.navLink} href="#features">Features</a>
            <a className={s.navLink} href="#levels">Levels</a>
          </div>

          <div className={s.navCtas}>
            <a className={s.btnOutline} href="/app/ui/login">Sign In</a>
            <a className={s.btnFilled} href="/app/app/dashboard">Dashboard</a>
          </div>
        </div>
      </nav>

      <section className={s.hero}>
        <div className={s.heroLogo} />
        <h1 className={s.heroHeadline}>Build Anything, Visually</h1>
        <p className={s.heroSub}>
          A 5-level meta-architecture for creating entire applications through
          visual workflows, schema editors, and embedded scripting. No code
          required.
        </p>
        <div className={s.heroCtas}>
          <a className={s.ctaPrimary} href="/app/ui/login">Get Started</a>
          <a className={s.ctaSecondary} href="/app/app/dashboard">Sign In</a>
        </div>
      </section>

      <section id="levels" className={s.levels}>
        <h2 className={s.levelsTitle}>Five Levels of Power</h2>
        <div className={s.levelsGrid}>
          {LEVELS.map(item => (
            <div key={item.level} className={s.levelCard}
              style={{ borderColor: `color-mix(in srgb, ${item.color} 40%, var(--border))` }}
            >
              <div className={s.levelBadge} style={{ background: item.color }}>
                {item.level}
              </div>
              <p className={s.levelName}>{item.name}</p>
              <p className={s.levelDesc}>{item.desc}</p>
              <p className={s.levelDetail}>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
