import { useTranslations } from 'next-intl';
import { StyledLink } from '@/components/StyledLink';
import publicStyles from '@/styles/public.module.scss';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className={publicStyles.basePageRoot}>
      <div className={publicStyles.basePageInner}>
        <header className={publicStyles.baseHeader}>
          <div className={publicStyles.baseHero}>
            <h1 className={publicStyles.baseTitle}>
              {AppConfig.name}
            </h1>
            <h2 className={publicStyles.baseSubtitle}>{t('description')}</h2>
          </div>

          <div className={publicStyles.baseNavRow}>
            <nav aria-label="Main navigation">
              <ul className={publicStyles.baseNavList}>
                {props.leftNav}
              </ul>
            </nav>

            <nav>
              <ul className={publicStyles.baseNavList}>
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <main>{props.children}</main>

        <footer className={publicStyles.baseFooter}>
          {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
          {t.rich('made_with', {
            author: () => (
              <StyledLink
                href="https://nextjs-boilerplate.com"
                target="_blank"
                rel="noreferrer"
              >
                Next.js Boilerplate
              </StyledLink>
            ),
          })}
          {/*
           * PLEASE READ THIS SECTION
           * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
           * The link doesn't need to appear on every pages, one link on one page is enough.
           * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
           */}
        </footer>
      </div>
    </div>
  );
};
