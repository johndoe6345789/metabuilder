import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sponsors } from '@/components/Sponsors';
import { StyledLink } from '@/components/StyledLink';
import { styles } from '@/config/styles';
import boilerplateFeatures from '@/config/boilerplateFeatures.json';

type IIndexProps = { params: Promise<{ locale: string }> };

export async function generateMetadata(
  props: IIndexProps,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  return { title: t('meta_title'), description: t('meta_description') };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Index' });

  return (
    <>
      <p>
        {`Follow `}
        <StyledLink href="https://twitter.com/ixartz" target="_blank" rel="noreferrer noopener">
          @Ixartz on Twitter
        </StyledLink>
        {` for updates and more information about the boilerplate.`}
      </p>
      <h2 className={styles.headings.h2Bold}>
        Boilerplate Code for Your Next.js Project with Tailwind CSS
      </h2>
      <p className={styles.text.base}>
        Next.js Boilerplate is a developer-friendly starter code for Next.js
        projects, built with Tailwind CSS and TypeScript.
        {' '}<span role="img" aria-label="zap">⚡️</span>{' '}
        Designed with developer experience in mind, it includes:
      </p>
      <ul className={styles.lists.baseMarginTop}>
        {boilerplateFeatures.map((item, i) => <li key={i}>{item}</li>)}
        <li>
          {`🔒 Authentication with `}
          <StyledLink href="https://clerk.com?utm_source=github&amp;utm_medium=sponsorship&amp;utm_campaign=nextjs-boilerplate" variant="primaryBold">Clerk</StyledLink>
          {` (passwordless, social, MFA)`}
        </li>
        <li>
          {`🌐 Multi-language (i18n) with next-intl and `}
          <StyledLink href="https://l.crowdin.com/next-js" variant="primaryBold">Crowdin</StyledLink>
        </li>
        <li>
          {`🐰 AI code reviews with `}
          <StyledLink href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025" variant="primaryBold">CodeRabbit</StyledLink>
        </li>
        <li>
          {`🚨 Error monitoring (`}
          <StyledLink href="https://sentry.io/for/nextjs/?utm_source=github&amp;utm_medium=paid-community&amp;utm_campaign=general-fy25q1-nextjs&amp;utm_content=github-banner-nextjsboilerplate-logo" variant="primaryBold">Sentry</StyledLink>
          {`) and logging`}
        </li>
        <li>{`🖥️ Monitoring as Code (Checkly)`}</li>
        <li>
          {`🔐 Security (`}
          <StyledLink href="https://launch.arcjet.com/Q6eLbRE" variant="primaryBold">Arcjet</StyledLink>
          {`)`}
        </li>
      </ul>
      <p className={styles.text.base}>
        Our sponsors&apos; exceptional support has made this project possible.
      </p>
      <h2 className={styles.headings.h2Bold}>{t('sponsors_title')}</h2>
      <Sponsors />
    </>
  );
}
