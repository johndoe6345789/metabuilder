import {
  PRODUCT_TIERS,
  PRODUCT_PACKAGES,
} from '@/lib/packages/product-packages'
import s from './PricingSection.module.scss'

export function PricingSection() {
  return (
    <section id="pricing" className={s.root}>
      <div className={s.inner}>
        <div className={s.header}>
          <h2 className={s.title}>Simple, honest pricing</h2>
          <p className={s.sub}>
            Start free. Upgrade when you&apos;re ready. No hidden fees, no
            per-seat charges.
          </p>
        </div>
        <div className={s.grid}>
          {PRODUCT_TIERS.map(tier => (
            <div
              key={tier.id}
              className={`${s.card} ${tier.highlight ? s.featured : ''}`}
            >
              {tier.highlight && <div className={s.pill}>Most popular</div>}
              <p className={s.tierName}>{tier.name}</p>
              <div className={s.price}>
                <span className={s.currency}>£</span>
                <span className={s.amount}>{tier.price}</span>
                <span className={s.period}>/month</span>
              </div>
              <p className={s.limit}>
                {tier.memberLimit !== null
                  ? `Up to ${tier.memberLimit.toLocaleString()} members`
                  : 'Unlimited members'}
              </p>
              <a
                className={`${s.cta} ${tier.highlight ? s.ctaFilled : s.ctaOutline}`}
                href="/ui/signup"
              >
                {tier.cta}
              </a>
              <ul className={s.includes}>
                {tier.packageIds.map(pid => {
                  const pkg = PRODUCT_PACKAGES.find(p => p.id === pid)
                  if (pkg === undefined) return null
                  return (
                    <li key={pid} className={s.include}>
                      <span
                        className="material-symbols-rounded"
                        style={{ color: pkg.color }}
                      >
                        {pkg.icon}
                      </span>
                      {pkg.name}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className={s.note}>
          14-day free trial · No card required · Cancel any time
        </p>
      </div>
    </section>
  )
}
