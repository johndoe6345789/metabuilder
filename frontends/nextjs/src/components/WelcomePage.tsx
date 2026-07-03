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
          <a className={s.brand} href="/">
            <Logo size={30} />
            <span className={s.brandName}>MetaBuilder</span>
          </a>
          <div className={s.navLinks}>
            <a className={s.navLink} href="#packages">Features</a>
            <a className={s.navLink} href="#pricing">Pricing</a>
          </div>
          <div className={s.navCtas}>
            <a className={s.btnOutline} href="/ui/login">Sign In</a>
            <a className={s.btnFilled} href="/ui/signup">Start free</a>
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
          <span className={s.footerCopy}>
            © {new Date().getFullYear()} · Your platform, your rules.
          </span>
        </div>
      </footer>
    </div>
  )
}
