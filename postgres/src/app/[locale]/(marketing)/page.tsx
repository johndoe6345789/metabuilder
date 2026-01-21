import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sponsors } from '@/components/Sponsors';
import { StyledLink } from '@/components/StyledLink';
import { styles } from '@/config/styles';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <>
      <p>
        {`Follow `}
        <StyledLink
          href="https://twitter.com/ixartz"
          target="_blank"
          rel="noreferrer noopener"
        >
          @Ixartz on Twitter
        </StyledLink>
        {` for updates and more information about the boilerplate.`}
      </p>
      <h2 className={styles.headings.h2Bold}>
        Boilerplate Code for Your Next.js Project with Tailwind CSS
      </h2>
      <p className={styles.text.base}>
        Next.js Boilerplate is a developer-friendly starter code for Next.js projects, built with Tailwind CSS and TypeScript.
        {' '}
        <span role="img" aria-label="zap">
          ⚡️
        </span>
        {' '}
        Designed with developer experience in mind, it includes:
      </p>
      <ul className={styles.lists.baseMarginTop}>
        <li>🚀 Next.js with App Router support</li>
        <li>🔥 TypeScript for type checking</li>
        <li>💎 Tailwind CSS integration</li>
        <li>
          🔒 Authentication with
          {' '}
          <StyledLink
            href="https://clerk.com?utm_source=github&amp;utm_medium=sponsorship&amp;utm_campaign=nextjs-boilerplate"
            variant="primaryBold"
          >
            Clerk
          </StyledLink>
          {' '}
          (includes passwordless, social, and multi-factor auth)
        </li>
        <li>📦 ORM with DrizzleORM (PostgreSQL, SQLite, MySQL support)</li>
        <li>
          💽 Dev database with PGlite and production with Neon (PostgreSQL)
        </li>
        <li>
          🌐 Multi-language support (i18n) with next-intl and
          {' '}
          <StyledLink
            href="https://l.crowdin.com/next-js"
            variant="primaryBold"
          >
            Crowdin
          </StyledLink>
        </li>
        <li>🔴 Form handling (React Hook Form) and validation (Zod)</li>
        <li>📏 Linting and formatting (ESLint, Prettier)</li>
        <li>🦊 Git hooks and commit linting (Husky, Commitlint)</li>
        <li>🦺 Testing suite (Vitest, React Testing Library, Playwright)</li>
        <li>🎉 Storybook for UI development</li>
        <li>
          🐰 AI-powered code reviews with
          {' '}
          <StyledLink
            href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025"
            variant="primaryBold"
          >
            CodeRabbit
          </StyledLink>
        </li>
        <li>
          🚨 Error monitoring (
          <StyledLink
            href="https://sentry.io/for/nextjs/?utm_source=github&amp;utm_medium=paid-community&amp;utm_campaign=general-fy25q1-nextjs&amp;utm_content=github-banner-nextjsboilerplate-logo"
            variant="primaryBold"
          >
            Sentry
          </StyledLink>
          ) and logging (LogTape, an alternative to Pino.js)
        </li>
        <li>🖥️ Monitoring as Code (Checkly)</li>
        <li>
          🔐 Security and bot protection (
          <StyledLink
            href="https://launch.arcjet.com/Q6eLbRE"
            variant="primaryBold"
          >
            Arcjet
          </StyledLink>
          )
        </li>
        <li>🤖 SEO optimization (metadata, JSON-LD, Open Graph tags)</li>
        <li>⚙️ Development tools (VSCode config, bundler analyzer, changelog generation)</li>
      </ul>
      <p className={styles.text.base}>
        Our sponsors&apos; exceptional support has made this project possible.
        Their services integrate seamlessly with the boilerplate, and we
        recommend trying them out.
      </p>
      <h2 className={styles.headings.h2Bold}>{t('sponsors_title')}</h2>
      <Sponsors />
    </>
  );
};
