'use client'

import s from '../page.module.scss'

export function HeroEmpty() {
  return (
    <div className={s.hero} data-empty="true">
      <div className={s.heroGlow} aria-hidden />
      <div className={s.heroContent}>
        <span className={s.heroEyebrow}>MetaBuilder Stream</span>
        <h1 className={s.heroTitle}>
          Your own broadcast,
          <br />
          running live.
        </h1>
        <p className={s.heroSub}>
          Schedule a program and it shows up here — live TV, radio, and retro
          gaming, unified in one signal.
        </p>
      </div>
    </div>
  )
}
