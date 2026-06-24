import publicStyles from '@/styles/public.module.scss';

export const DemoBadge = () => (
  <div className={publicStyles.demoBadgeWrap}>
    <a
      href="https://github.com/ixartz/Next-js-Boilerplate"
    >
      <div className={publicStyles.demoBadge}>
        <span className={publicStyles.demoBadgeMuted}>Demo of</span>
        {` Next.js Boilerplate`}
      </div>
    </a>
  </div>
);
