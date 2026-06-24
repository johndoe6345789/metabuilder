import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { Sponsors } from './Sponsors';
import { StyledLink } from './StyledLink';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const user = await currentUser();

  return (
    <>
      <p>
        {`👋 `}
        {t('hello_message', { email: user?.primaryEmailAddress?.emailAddress ?? '' })}
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
