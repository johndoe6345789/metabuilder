'use client'

import {
  PRODUCT_PACKAGES,
  PRODUCT_TIERS,
} from '@/lib/packages/product-packages'
import type { TierId } from './signup-form'
import s from './page.module.scss'

export interface TierPickerProps {
  tier: TierId
  onChange: (tier: TierId) => void
}

/** One plan's badges: which packages come with it. */
function TierPackages({ ids }: { ids: readonly string[] }) {
  return (
    <span className={s.tierPkgs}>
      {ids.map(pid => {
        const pkg = PRODUCT_PACKAGES.find(p => p.id === pid)
        return pkg !== undefined ? (
          <span
            key={pid}
            className="material-symbols-rounded"
            title={pkg.name}
            style={{ color: pkg.color }}
          >
            {pkg.icon}
          </span>
        ) : null
      })}
    </span>
  )
}

export function TierPicker({ tier, onChange }: TierPickerProps) {
  return (
    <div className={s.tierSection}>
      <p className={s.tierLabel}>Choose your plan</p>
      <div className={s.tiers}>
        {PRODUCT_TIERS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`${s.tier} ${tier === t.id ? s.tierSelected : ''}`}
            onClick={() => {
              onChange(t.id)
            }}
          >
            {t.highlight && <span className={s.tierBadge}>Popular</span>}
            <span className={s.tierName}>{t.name}</span>
            <span className={s.tierPrice}>£{t.price}/mo</span>
            <TierPackages ids={t.packageIds} />
          </button>
        ))}
      </div>
    </div>
  )
}
