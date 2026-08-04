import { getTranslations } from 'next-intl/server';
import { getSession } from '@/utils/session';
import { Sponsors } from './Sponsors';
import { StyledLink } from './StyledLink';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const session = await getSession();

  return (
    <>
      <p>
        {`👋 `}
        {t('hello_message', { email: session?.username ?? '' })}
      </p>
      <p>
        {t.rich('alternative_message', {
          url: () => (
            <StyledLink
              href="https://nextjs-boilerplate.com/pro-saas-starter-kit"
              target="_blank"
              rel="noreferrer"
            >
              Next.js Boilerplate Pro
            </StyledLink>
          ),
        })}
      </p>
      <Sponsors />
    </>
  );
};
