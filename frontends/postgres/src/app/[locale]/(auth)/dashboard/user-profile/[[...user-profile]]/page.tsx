import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import publicStyles from '@/styles/public.module.scss';
import { getSession } from '@/utils/session';

type IUserProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IUserProfilePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function UserProfilePage(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await getSession();

  return (
    <div className={publicStyles.userProfileShell}>
      <p>
        Signed in as
        {' '}
        <strong>{session?.username ?? 'unknown'}</strong>
        {' '}
        via MetaBuilder SSO.
      </p>
    </div>
  );
};
