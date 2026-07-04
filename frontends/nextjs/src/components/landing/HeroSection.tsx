import Link from 'next/link'
import s from './HeroSection.module.scss'

export function HeroSection() {
  return (
    <section className={s.root}>
      <div className={s.inner}>
        <div className={s.badge}>No platform lock-in</div>
        <h1 className={s.headline}>
          Your community.
          <br />
          <span className={s.accent}>Your platform.</span>
        </h1>
        <p className={s.sub}>
          Stop paying rent to Discord, Substack and Linktree.
          MetaBuilder gives your members a home you actually own
          — forums, blog, chat, email and more, all under your brand.
        </p>
        <div className={s.ctas}>
          <Link className={s.primary} href="/ui/signup">
            Start free trial
          </Link>
          <a className={s.secondary} href="#packages">
            See what&apos;s included
          </a>
        </div>
        <p className={s.note}>No credit card required · Cancel anytime</p>
      </div>
    </section>
  )
}
