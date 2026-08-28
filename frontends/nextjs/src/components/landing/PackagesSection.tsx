import { PRODUCT_PACKAGES } from '@/lib/packages/product-packages'
import s from './PackagesSection.module.scss'

export function PackagesSection() {
  return (
    <section id="packages" className={s.root}>
      <div className={s.inner}>
        <div className={s.header}>
          <h2 className={s.title}>Everything your community needs</h2>
          <p className={s.sub}>
            Install the features you want. Skip what you don&apos;t. Each
            package adds pages, navigation and functionality to your platform
            instantly.
          </p>
        </div>
        <div className={s.grid}>
          {PRODUCT_PACKAGES.map(pkg => (
            <div key={pkg.id} className={s.card}>
              <div
                className={s.iconWrap}
                style={{
                  background: `color-mix(in srgb, ${pkg.color} 15%, transparent)`,
                }}
              >
                <span
                  className="material-symbols-rounded"
                  style={{ color: pkg.color }}
                >
                  {pkg.icon}
                </span>
              </div>
              <h3 className={s.cardName}>{pkg.name}</h3>
              <p className={s.cardTagline}>{pkg.tagline}</p>
              <ul className={s.features}>
                {pkg.features.map(f => (
                  <li key={f} className={s.feature}>
                    <span className={s.check}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
