import Link from 'next/link'
import s from './WelcomePage.module.scss'
import { Logo } from '@/components/brand/Logo'
import { HeroSection } from './landing/HeroSection'
import { PackagesSection } from './landing/PackagesSection'
import { PricingSection } from './landing/PricingSection'

export function WelcomePage() {
  return (
    <div className={s.root}>
      <nav className={s.nav}>
        <div className={s.navInner}>
          <Link className={s.brand} href="/">
            <Logo size={30} />
            <span className={s.brandName}>MetaBuilder</span>
          </Link>
          <div className={s.navLinks}>
            <a className={s.navLink} href="#packages">
              Features
            </a>
            <a className={s.navLink} href="#pricing">
              Pricing
            </a>
          </div>
          <div className={s.navCtas}>
            <Link className={s.btnOutline} href="/login">
              Sign In
            </Link>
            <Link className={s.btnFilled} href="/ui/signup">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <PackagesSection />
      <PricingSection />

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <Logo size={18} />
            <span>MetaBuilder</span>
          </div>
          <div className={s.footerMeta}>
            <span className={s.footerCopy}>
              © {new Date().getFullYear()} · Your platform, your rules.
            </span>
            <span className={s.footerVersion}>
              v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
